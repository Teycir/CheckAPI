# CheckAPI Library

Reusable API key validation library with provider detection and validation.

## Structure

```
lib/
├── core/              # Core abstractions (reusable)
│   ├── types.ts       # Type definitions
│   ├── detector.ts    # Provider detection logic
│   └── validator.ts   # Validation engine
├── providers/         # Provider configurations
│   └── llm-providers.ts
└── index.ts          # Public API
```

## Usage

### Basic Usage

```typescript
import { checkKeys } from '@/lib';

const results = await checkKeys(['sk-proj-...', 'sk-ant-...']);
```

### Advanced Usage

```typescript
import { createLLMValidator } from '@/lib';

const validator = createLLMValidator({
  timeout: 5000,
  truncateLength: 10,
  parallel: true
});

const results = await validator.validate(keys);
```

### Custom Provider

```typescript
import { ApiKeyValidator, ProviderDetector, ProviderConfig } from '@/lib';

const customProviders: ProviderConfig[] = [
  {
    name: 'MyAPI',
    pattern: /^myapi-[A-Za-z0-9]{32}$/,
    confidence: 'definite',
    endpoint: 'https://api.example.com/validate',
    buildHeaders: (key) => ({ 'Authorization': `Bearer ${key}` }),
    parseResponse: (data) => ({ userId: data.user_id }),
    testable: true,
  }
];

const detector = new ProviderDetector(customProviders);
const validator = new ApiKeyValidator(detector);
const results = await validator.validate(keys);
```

## Reusability

The `lib/core` folder contains abstract, framework-agnostic code that can be reused in:
- Node.js backends
- Browser extensions
- CLI tools
- Other Next.js projects
- React Native apps

Only `lib/providers/llm-providers.ts` is specific to LLM providers.
