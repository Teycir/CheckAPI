#!/bin/bash

echo "=== Rate Limiting Test Suite ==="
echo ""

# Start wrangler in background
npx wrangler pages dev out --kv RATE_LIMIT_KV --port 8788 > /tmp/wrangler.log 2>&1 &
WRANGLER_PID=$!

echo "Starting wrangler (PID: $WRANGLER_PID)..."
sleep 8

# Test if server is up
if ! curl -s http://localhost:8788/api/check > /dev/null 2>&1; then
  echo "Server not responding"
  kill $WRANGLER_PID 2>/dev/null
  exit 1
fi

echo "✓ Server is up"
echo ""

# Test 1: Normal request
echo "Test 1: Normal request should succeed"
response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8788/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys":["sk-test123"]}')
http_code=$(echo "$response" | tail -1)

if [ "$http_code" = "200" ]; then
  echo "✓ Normal request succeeded (200)"
else
  echo "✗ Expected 200, got $http_code"
fi
echo ""

# Test 2: Burst of 21 requests
echo "Test 2: Sending 21 rapid requests (limit is 20/min)"
SUCCESS=0
BLOCKED=0

for i in {1..21}; do
  response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8788/api/check \
    -H "Content-Type: application/json" \
    -d '{"keys":["sk-test456"]}' 2>/dev/null)
  
  http_code=$(echo "$response" | tail -1)
  
  if [ "$http_code" = "200" ]; then
    SUCCESS=$((SUCCESS + 1))
  elif [ "$http_code" = "429" ]; then
    BLOCKED=$((BLOCKED + 1))
    body=$(echo "$response" | head -n -1)
    retry_after=$(echo "$body" | grep -o '"retryAfter":[0-9]*' | cut -d: -f2)
    echo "  Request $i: Rate limited (retry after ${retry_after}s)"
  fi
done

echo "  Results: $SUCCESS succeeded, $BLOCKED blocked"

if [ $BLOCKED -gt 0 ]; then
  echo "✓ Rate limiting triggered after $SUCCESS requests"
else
  echo "✗ Rate limiting did not trigger"
fi
echo ""

# Test 3: Check retry-after header
echo "Test 3: Verify Retry-After header"
response=$(curl -s -i -X POST http://localhost:8788/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys":["sk-test789"]}' 2>/dev/null)

if echo "$response" | grep -q "Retry-After:"; then
  retry_value=$(echo "$response" | grep "Retry-After:" | cut -d: -f2 | tr -d ' \r')
  echo "✓ Retry-After header present: ${retry_value}s"
else
  echo "✗ Retry-After header missing"
fi
echo ""

# Test 4: Check KV integration
echo "Test 4: Verify KV namespace binding"
kv_keys=$(npx wrangler kv key list --namespace-id=5bc636712fbf4d91a4bf84a3e385b436 2>/dev/null)
if [ -n "$kv_keys" ] && [ "$kv_keys" != "[]" ]; then
  echo "✓ KV namespace has data"
  echo "$kv_keys" | head -5
else
  echo "⚠ KV namespace is empty (L1 cache handled all requests)"
fi
echo ""

# Cleanup
kill $WRANGLER_PID 2>/dev/null
wait $WRANGLER_PID 2>/dev/null

echo "=== Test Complete ==="
