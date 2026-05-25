import { logger } from './logger';

export class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

const ALLOWED_HOSTS = new Set([
  'api.cerebras.ai',
  'openrouter.ai',
  'api.anthropic.com',
  'api.openai.com',
  'generativelanguage.googleapis.com',
  'api.groq.com',
  'api.perplexity.ai',
  'huggingface.co',
  'api.replicate.com',
  'api.together.xyz',
  'api.cohere.com',
  'api.mistral.ai',
]);

export function assertAllowedEndpoint(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new ValidationError(`Invalid endpoint URL: ${url}`, 'INVALID_ENDPOINT_URL');
  }
  if (parsed.protocol !== 'https:') {
    throw new ValidationError(`Endpoint must use HTTPS, got: ${parsed.protocol}`, 'ENDPOINT_NOT_HTTPS');
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new ValidationError(`Host not in allowlist: ${parsed.hostname}`, 'ENDPOINT_HOST_BLOCKED');
  }
}

export function validateApiKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('API key must be a non-empty string', 'INVALID_KEY_TYPE');
  }

  if (key.length < 8) {
    throw new ValidationError('API key too short (minimum 8 characters)', 'KEY_TOO_SHORT');
  }

  if (key.length > 500) {
    throw new ValidationError('API key too long (maximum 500 characters)', 'KEY_TOO_LONG');
  }

  // Check for suspicious patterns
  if (/[\x00-\x1F\x7F]/.test(key)) {
    throw new ValidationError('API key contains invalid control characters', 'INVALID_CHARACTERS');
  }
}

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    logger.warn('Non-string input received', { type: typeof input });
    return '';
  }
  
  // Remove null bytes and other control characters
  return input.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

export function validateKeys(keys: string[]): string[] {
  if (!Array.isArray(keys)) {
    throw new ValidationError('Keys must be an array', 'INVALID_INPUT_TYPE');
  }

  if (keys.length === 0) {
    throw new ValidationError('No keys provided', 'EMPTY_INPUT');
  }

  if (keys.length > 100) {
    throw new ValidationError('Too many keys (maximum 100)', 'TOO_MANY_KEYS');
  }

  const validated: string[] = [];
  const errors: Array<{ key: string; error: string }> = [];

  for (const key of keys) {
    try {
      const sanitized = sanitizeInput(key);
      if (sanitized) {
        validateApiKey(sanitized);
        validated.push(sanitized);
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        errors.push({ key: key.slice(0, 20), error: error.message });
      }
    }
  }

  if (errors.length > 0) {
    logger.warn('Some keys failed validation', { errorCount: errors.length, errors: errors.slice(0, 5) });
  }

  if (validated.length === 0) {
    throw new ValidationError('No valid keys after validation', 'NO_VALID_KEYS');
  }

  return validated;
}
