import { ValidationResult, ValidatorOptions, ProviderConfig } from './types';
import { ProviderDetector } from './detector';
import { logger } from '../utils/logger';
import { validateKeys, ValidationError, assertAllowedEndpoint } from '../utils/validation';

export class ApiKeyValidator {
  private options: Required<ValidatorOptions>;

  constructor(
    private detector: ProviderDetector,
    options: ValidatorOptions = {}
  ) {
    this.options = {
      timeout: Math.max(1000, Math.min(options.timeout ?? 10000, 30000)),
      truncateLength: Math.max(4, Math.min(options.truncateLength ?? 8, 20)),
      parallel: options.parallel ?? true,
    };

    logger.info('ApiKeyValidator initialized', { options: this.options });
  }

  async validate(keys: string[]): Promise<ValidationResult[]> {
    logger.info('Starting validation', { keyCount: keys.length });

    try {
      const validatedKeys = validateKeys(keys);
      const uniqueKeys = [...new Set(validatedKeys)];
      
      logger.debug('Keys validated and deduplicated', { 
        original: keys.length, 
        valid: validatedKeys.length,
        unique: uniqueKeys.length 
      });

      if (this.options.parallel) {
        return await this.validateParallel(uniqueKeys);
      }
      return await this.validateSequential(uniqueKeys);
    } catch (error) {
      logger.error('Validation failed', error);
      
      if (error instanceof ValidationError) {
        throw error;
      }
      
      throw new Error('Validation failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  private async validateParallel(keys: string[]): Promise<ValidationResult[]> {
    const concurrency = 5;
    const results: ValidationResult[] = [];
    
    for (let i = 0; i < keys.length; i += concurrency) {
      const batch = keys.slice(i, i + concurrency);
      const batchResults = await Promise.allSettled(
        batch.map(key => this.validateSingle(key))
      );
      
      results.push(...batchResults.map((r, idx) => 
        r.status === 'fulfilled' ? r.value : this.createErrorResult(batch[idx], 'Promise rejected')
      ));
    }
    
    logger.info('Parallel validation complete', { total: keys.length, batches: Math.ceil(keys.length / concurrency) });
    return results;
  }

  private async validateSequential(keys: string[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];
    
    for (const key of keys) {
      try {
        results.push(await this.validateSingle(key));
      } catch (error) {
        logger.error('Sequential validation error', error, { key: key.slice(0, 8) });
        results.push(this.createErrorResult(key, 'Validation exception'));
      }
    }
    
    logger.info('Sequential validation complete', { total: keys.length });
    return results;
  }

  private async validateSingle(key: string): Promise<ValidationResult> {
    const truncatedKey = key.slice(0, this.options.truncateLength) + '…';
    const provider = this.detector.detect(key) ?? this.detector.getUnknownProvider();

    if (!provider.testable || !provider.endpoint) {
      logger.debug('Provider not testable', { provider: provider.name });
      return {
        key,
        truncatedKey,
        provider: provider.name,
        confidence: provider.confidence,
        status: 'untestable',
      };
    }

    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeout);

    try {
      const url = provider.buildUrl?.(provider.endpoint, key) ?? provider.endpoint;
      const headers = provider.buildHeaders?.(key) ?? {};

      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL generated');
      }

      assertAllowedEndpoint(url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const latencyMs = Date.now() - start;

      logger.debug('API response received', { 
        provider: provider.name, 
        status: response.status, 
        latencyMs 
      });

      if (response.ok) {
        return await this.handleSuccessResponse(response, key, truncatedKey, provider, latencyMs);
      }

      return await this.handleErrorResponse(response, key, truncatedKey, provider, latencyMs);
    } catch (error: unknown) {
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;
      
      return this.handleException(error, key, truncatedKey, provider, latencyMs);
    }
  }

  private async handleSuccessResponse(
    response: Response,
    key: string,
    truncatedKey: string,
    provider: ProviderConfig,
    latencyMs: number
  ): Promise<ValidationResult> {
    try {
      const data = await response.json();
      const metadata = provider.parseResponse?.(data) ?? {};
      const rateLimit = this.extractRateLimits(response.headers);

      return {
        key,
        truncatedKey,
        provider: provider.name,
        confidence: provider.confidence,
        status: 'valid',
        statusCode: response.status,
        metadata: { ...metadata, rateLimit: Object.keys(rateLimit).length ? rateLimit : undefined },
        latencyMs,
      };
    } catch (error) {
      logger.error('Failed to parse success response', error, { provider: provider.name });
      return {
        key,
        truncatedKey,
        provider: provider.name,
        confidence: provider.confidence,
        status: 'error',
        statusCode: response.status,
        errorMessage: 'Failed to parse response',
        latencyMs,
      };
    }
  }

  private async handleErrorResponse(
    response: Response,
    key: string,
    truncatedKey: string,
    provider: ProviderConfig,
    latencyMs: number
  ): Promise<ValidationResult> {
    try {
      const errorText = await response.text();
      logger.debug('API error response', { 
        provider: provider.name, 
        status: response.status,
        error: errorText.slice(0, 100)
      });

      const status = (response.status === 401 || response.status === 403) ? 'invalid' : 'error';

      return {
        key,
        truncatedKey,
        provider: provider.name,
        confidence: provider.confidence,
        status,
        statusCode: response.status,
        errorMessage: errorText.slice(0, 200),
        latencyMs,
      };
    } catch (error) {
      logger.error('Failed to read error response', error);
      return {
        key,
        truncatedKey,
        provider: provider.name,
        confidence: provider.confidence,
        status: 'error',
        statusCode: response.status,
        errorMessage: 'Failed to read error response',
        latencyMs,
      };
    }
  }

  private handleException(
    error: unknown,
    key: string,
    truncatedKey: string,
    provider: ProviderConfig,
    latencyMs: number
  ): ValidationResult {
    let errorMessage = 'Unknown error';

    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') {
      errorMessage = 'Timeout';
      logger.warn('Request timeout', { provider: provider.name, timeout: this.options.timeout });
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('CORS')) {
      errorMessage = 'CORS blocked';
      logger.warn('CORS error', { provider: provider.name });
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error';
      logger.error('Network error', error, { provider: provider.name });
    } else {
      errorMessage = error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' ? error.message : 'Request failed';
      logger.error('Validation request failed', error, { provider: provider.name });
    }

    return {
      key,
      truncatedKey,
      provider: provider.name,
      confidence: provider.confidence,
      status: 'error',
      errorMessage,
      latencyMs,
    };
  }

  private extractRateLimits(headers: Headers): Record<string, string> {
    const rateLimit: Record<string, string> = {};
    try {
      headers.forEach((value, key) => {
        if (key.toLowerCase().includes('ratelimit') || key.toLowerCase().includes('rate-limit')) {
          rateLimit[key] = value;
        }
      });
    } catch (error) {
      logger.warn('Failed to extract rate limits', { error });
    }
    return rateLimit;
  }

  private createErrorResult(key: string, reason: string): ValidationResult {
    logger.warn('Creating error result', { reason, key: key.slice(0, 8) });
    return {
      key,
      truncatedKey: key.slice(0, this.options.truncateLength) + '…',
      provider: 'Unknown',
      confidence: 'unknown',
      status: 'error',
      errorMessage: reason,
    };
  }
}
