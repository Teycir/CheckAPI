# Rate Limiting Implementation

## Overview

Two-tier rate limiting system for the CheckAPI API:
- **L1 (In-memory)**: Fast, synchronous sliding window counter per isolate
- **L2 (KV)**: Cross-isolate check with optimistic concurrency

## Configuration

- **Limit**: 20 requests per minute per IP
- **Window**: 60 seconds sliding window
- **KV Namespace**: `RATE_LIMIT_KV` (ID: `5bc636712fbf4d91a4bf84a3e385b436`)

## How It Works

### L1 - In-Memory Cache
- Runs first on every request (no I/O, no latency)
- Maintains a sliding window of timestamps per IP
- Blocks immediately if limit exceeded within the isolate
- Returns `retryAfter` in seconds

### L2 - KV Cross-Isolate
- Runs only if L1 passes
- Uses per-minute buckets: `rl:<ip>:<bucket>` where `bucket = floor(now / 60000)`
- Implements optimistic concurrency with read-back CAS pattern
- Auto-expires keys after 120 seconds (2× window)
- Gracefully degrades if KV is unavailable

### Response Format

**Rate Limited (429)**:
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 45
}
```

Headers include: `Retry-After: 45`

## Testing

Run the test suite:
```bash
./test-rate-limit-comprehensive.sh
```

Expected behavior:
- First 20 requests succeed
- 21st request returns 429
- Retry-After header present
- L1 handles single-isolate traffic
- L2 (KV) handles cross-isolate coordination

## Deployment

The rate limiter is automatically deployed with Cloudflare Pages.

**Prerequisites**:
1. KV namespace created: `wrangler kv namespace create RATE_LIMIT_KV`
2. Namespace ID added to `wrangler.toml`

**Deploy**:
```bash
npm run build
npx wrangler pages deploy out --project-name=checkapi
```

## Caveats

- **Best-effort enforcement**: In-memory cache is per-isolate, not global
- **Potential overshoot**: CAS pattern can allow ~3 extra requests during concurrent races
- **Cold starts**: Memory resets on cold start
- For exact enforcement, consider Durable Objects

## Files Modified

- `functions/api/check.js` - Added rate limiting logic
- `wrangler.toml` - Added KV namespace binding
- `test-rate-limit-comprehensive.sh` - Test suite
