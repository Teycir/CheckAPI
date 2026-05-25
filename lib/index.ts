export * from './core/types';
export * from './core/detector';
export * from './core/validator';
export * from './providers/llm-providers';
export * from './utils/validation';
export * from './utils/logger';

import { ApiKeyValidator } from './core/validator';
import { ProviderDetector } from './core/detector';
import { llmProviders } from './providers/llm-providers';
import { ValidationResult } from './core/types';
import { logger } from './utils/logger';

// Convenience function for the app
export function createLLMValidator(options = {}) {
  const detector = new ProviderDetector(llmProviders);
  return new ApiKeyValidator(detector, options);
}

// Legacy compatibility
export async function checkKeys(keys: string[]): Promise<ValidationResult[]> {
  try {
    const validator = createLLMValidator();
    return await validator.validate(keys);
  } catch (error) {
    logger.error('checkKeys failed', error);
    throw error;
  }
}
