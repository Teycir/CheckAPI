#!/bin/bash

echo "Testing rate limiting..."
echo "Sending 25 requests (limit is 20 per minute)"
echo ""

for i in {1..25}; do
  response=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST http://localhost:8788/api/check \
    -H "Content-Type: application/json" \
    -d '{"keys":["test-key"]}')
  
  http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
  body=$(echo "$response" | sed '/HTTP_CODE:/d')
  
  if [ "$http_code" = "429" ]; then
    echo "Request $i: RATE LIMITED (429)"
    echo "Response: $body"
    break
  else
    echo "Request $i: OK ($http_code)"
  fi
  
  sleep 0.1
done

echo ""
echo "Test complete!"
