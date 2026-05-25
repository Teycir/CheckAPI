#!/bin/bash

echo "Testing rate limiting with wrangler dev..."
echo ""

# Start wrangler in background
npx wrangler pages dev out --kv RATE_LIMIT_KV --port 8788 > /tmp/wrangler.log 2>&1 &
WRANGLER_PID=$!

echo "Starting wrangler (PID: $WRANGLER_PID)..."
sleep 8

# Test if server is up
if ! curl -s http://localhost:8788/api/check > /dev/null 2>&1; then
  echo "Server not responding, checking logs..."
  tail -20 /tmp/wrangler.log
  kill $WRANGLER_PID 2>/dev/null
  exit 1
fi

echo "Server is up! Testing rate limiting..."
echo "Sending 25 requests (limit is 20 per minute)"
echo ""

SUCCESS_COUNT=0
RATE_LIMITED=0

for i in {1..25}; do
  response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8788/api/check \
    -H "Content-Type: application/json" \
    -d '{"keys":["test-key"]}' 2>/dev/null)
  
  http_code=$(echo "$response" | tail -1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$http_code" = "429" ]; then
    echo "Request $i: RATE LIMITED ✓"
    retry_after=$(echo "$body" | grep -o '"retryAfter":[0-9]*' | cut -d: -f2)
    echo "  Retry after: ${retry_after}s"
    RATE_LIMITED=1
    break
  elif [ "$http_code" = "200" ]; then
    echo "Request $i: OK"
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    echo "Request $i: Unexpected status $http_code"
  fi
  
  sleep 0.05
done

echo ""
echo "Results:"
echo "  Successful requests: $SUCCESS_COUNT"
echo "  Rate limited: $RATE_LIMITED"

# Cleanup
kill $WRANGLER_PID 2>/dev/null
wait $WRANGLER_PID 2>/dev/null

if [ $RATE_LIMITED -eq 1 ]; then
  echo ""
  echo "✓ Rate limiting is working!"
  exit 0
else
  echo ""
  echo "✗ Rate limiting did not trigger"
  exit 1
fi
