#!/bin/bash
# CheckAPIs API Test Script

echo "Testing CheckAPIs API..."
echo ""

# Test 1: GET endpoint info
echo "1. Getting API info:"
curl -s https://checkapis.pages.dev/api/check | jq
echo ""

# Test 2: Invalid key
echo "2. Testing with invalid key:"
curl -s -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-test-invalid"]}' | jq
echo ""

# Test 3: Multiple invalid keys
echo "3. Testing with multiple keys:"
curl -s -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": ["sk-test-1", "sk-ant-test-2", "AIzaTest3"]}' | jq
echo ""

# Test 4: Error handling - no keys
echo "4. Testing error handling (no keys):"
curl -s -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"keys": []}' | jq
echo ""

# Test 5: Error handling - invalid format
echo "5. Testing error handling (invalid format):"
curl -s -X POST https://checkapis.pages.dev/api/check \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}' | jq
echo ""

echo "✅ All tests completed!"
