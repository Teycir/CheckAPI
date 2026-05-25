# Tests

Rate limiting test suite for CheckAPI.

## Test Files

- **test-api.sh** - Basic API functionality test
- **test-rate-limit.sh** - Simple rate limit test
- **test-rate-limit-full.sh** - Full rate limit test with server lifecycle
- **test-rate-limit-comprehensive.sh** - Complete test suite (recommended)
- **test-kv-cross-isolate.sh** - KV cross-isolate coordination test

## Running Tests

### Comprehensive Test (Recommended)
```bash
./tests/test-rate-limit-comprehensive.sh
```

### Individual Tests
```bash
./tests/test-api.sh
./tests/test-rate-limit-full.sh
./tests/test-kv-cross-isolate.sh
```

## Requirements

- Node.js and npm installed
- Project built (`npm run build`)
- Wrangler CLI available (`npx wrangler`)
