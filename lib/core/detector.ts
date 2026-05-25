import { ProviderConfig, Confidence } from './types';
import { logger } from '../utils/logger';

export class ProviderDetector {
  constructor(private providers: ProviderConfig[]) {
    if (!Array.isArray(providers) || providers.length === 0) {
      logger.error('ProviderDetector initialized with invalid providers', null, { providers });
      throw new Error('Providers must be a non-empty array');
    }
  }

  detect(key: string): ProviderConfig | null {
    if (!key || typeof key !== 'string') {
      logger.warn('Invalid key provided to detector', { keyType: typeof key });
      return null;
    }

    try {
      for (const provider of this.providers) {
        if (!provider.pattern) {
          logger.warn('Provider missing pattern', { provider: provider.name });
          continue;
        }

        try {
          if (provider.pattern.test(key)) {
            logger.debug('Provider detected', { provider: provider.name });
            return provider;
          }
        } catch (error) {
          logger.error('Pattern test failed', error, { provider: provider.name });
        }
      }
    } catch (error) {
      logger.error('Provider detection failed', error);
    }

    return null;
  }

  getUnknownProvider(): ProviderConfig {
    return {
      name: 'Unknown',
      pattern: /.*/,
      confidence: 'unknown' as Confidence,
      testable: false,
    };
  }
}
