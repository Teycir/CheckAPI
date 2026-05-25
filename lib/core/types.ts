export type Confidence = 'definite' | 'likely' | 'unknown';
export type ValidationStatus = 'valid' | 'invalid' | 'error' | 'untestable';

export interface ValidationMetadata {
  models?: string[];
  modelCount?: number;
  organization?: string;
  username?: string;
  type?: string;
  rateLimit?: Record<string, string>;
}

export interface ValidationResult {
  key: string;
  truncatedKey: string;
  provider: string;
  confidence: Confidence;
  status: ValidationStatus;
  statusCode?: number;
  metadata?: ValidationMetadata;
  errorMessage?: string;
  latencyMs?: number;
}

export interface ProviderConfig {
  name: string;
  pattern: RegExp;
  confidence: Confidence;
  endpoint?: string;
  buildHeaders?: (key: string) => Record<string, string>;
  buildUrl?: (endpoint: string, key: string) => string;
  parseResponse?: (data: any) => Record<string, any>;
  testable: boolean;
}

export interface ValidatorOptions {
  timeout?: number;
  truncateLength?: number;
  parallel?: boolean;
}
