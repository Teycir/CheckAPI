#!/bin/bash

echo "=== KV Cross-Isolate Test ==="
echo "This test manually writes to KV to simulate cross-isolate traffic"
echo ""

# Get current bucket
NOW=$(date +%s)000  # milliseconds
BUCKET=$((NOW / 60000))
IP="127.0.0.1"
KEY="rl:${IP}:${BUCKET}"

echo "Current bucket: $BUCKET"
echo "KV key: $KEY"
echo ""

# Manually set KV to 18 requests (simulating traffic from other isolates)
echo "Simulating 18 requests from other isolates..."
npx wrangler kv key put "$KEY" "18" \
  --namespace-id=5bc636712fbf4d91a4bf84a3e385b436 \
  --ttl=120 2>&1 | grep -v "wrangler"

sleep 2

# Start wrangler
npx wrangler pages dev out --kv RATE_LIMIT_KV --port 8788 > /tmp/wrangler.log 2>&1 &
WRANGLER_PID=$!
echo "Starting wrangler (PID: $WRANGLER_PID)..."
sleep 8

# Now send 3 requests - should succeed (18 + 3 = 21, but we allow up to 20 + overshoot)
echo ""
echo "Sending 3 requests (KV already has 18)..."

for i in {1..3}; do
  response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8788/api/check \
    -H "Content-Type: application/json" \
    -d '{"keys":["sk-test"]}' 2>/dev/null)
  
  http_code=$(echo "$response" | tail -1)
  
  if [ "$http_code" = "200" ]; then
    echo "  Request $i: OK (200)"
  elif [ "$http_code" = "429" ]; then
    echo "  Request $i: RATE LIMITED (429)"
    body=$(echo "$response" | head -n -1)
    echo "  Response: $body"
  else
    echo "  Request $i: Status $http_code"
  fi
done

echo ""
echo "Checking KV value after requests..."
FINAL_VALUE=$(npx wrangler kv key get "$KEY" --namespace-id=5bc636712fbf4d91a4bf84a3e385b436 2>&1 | grep -v "wrangler")
echo "Final KV value: $FINAL_VALUE"

# Cleanup
kill $WRANGLER_PID 2>/dev/null
wait $WRANGLER_PID 2>/dev/null

echo ""
echo "=== Test Complete ==="
echo "This demonstrates L2 (KV) coordination across isolates"
