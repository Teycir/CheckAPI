# CheckAPIs API

Use CheckAPIs programmatically via curl or any HTTP client.

## Endpoint

```
POST https://checkapis.pages.dev/api/check
```

## Request Format

```bash
curl -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-proj-...", "sk-ant-api03-..."]}'
```

## Request Body

```json
{
  "keys": [
    "sk-proj-...",
    "sk-ant-api03-...",
    "AIzaSy..."
  ]
}
```

- **keys**: Array of API keys to validate (max 50 per request)

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "count": 3,
  "results": [
    {
      "key": "sk-proj-...",
      "provider": "openai",
      "valid": true,
      "models": ["gpt-4", "gpt-3.5-turbo"],
      "latency": 245,
      "rateLimit": "5000"
    },
    {
      "key": "sk-ant-...",
      "provider": "anthropic",
      "valid": true,
      "models": ["claude-3-opus", "claude-3-sonnet"],
      "latency": 312
    },
    {
      "key": "invalid-...",
      "provider": "unknown",
      "valid": false,
      "error": "Invalid API key format"
    }
  ]
}
```

### Error Response (400/500)

```json
{
  "error": "Error message"
}
```

## Response Fields

- **success**: Boolean indicating overall request success
- **count**: Number of keys validated
- **results**: Array of validation results
  - **key**: Truncated key (first 8 chars)
  - **provider**: Detected provider name
  - **valid**: Boolean indicating if key is valid
  - **models**: Array of available models (if valid)
  - **latency**: Response time in milliseconds
  - **rateLimit**: Remaining rate limit (if available)
  - **error**: Error message (if invalid)

## Rate Limits

- Maximum 50 keys per request
- No authentication required
- CORS enabled for browser requests

## Examples

### Single Key

```bash
curl -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-proj-abc123..."]}'
```

### Multiple Keys

```bash
curl -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{
    "keys": [
      "sk-proj-abc123...",
      "sk-ant-api03-xyz789...",
      "AIzaSyDEF456..."
    ]
  }'
```

### With jq for Pretty Output

```bash
curl -s -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-proj-..."]}' | jq
```

## Supported Providers

- OpenAI
- Anthropic (Claude)
- Google Gemini
- Groq
- Perplexity
- HuggingFace
- Replicate
- Together AI
- Cohere
- Mistral

## Privacy

All validation happens server-side but keys are:
- Never logged or stored
- Only used for immediate validation
- Sent directly to provider APIs
- Truncated in responses (first 8 chars only)
