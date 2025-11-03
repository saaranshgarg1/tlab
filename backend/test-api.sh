#!/bin/bash

# Smart Garbage Monitoring System - API Test Script
# This script tests all backend API endpoints

BASE_URL="http://localhost:5000"
echo "=========================================="
echo "Testing Smart Garbage Monitoring System API"
echo "=========================================="
echo ""

# Test 1: Root endpoint
echo "1️⃣  Testing root endpoint..."
curl -s $BASE_URL | jq '.'
echo ""
echo ""

# Test 2: Update bin (create new)
echo "2️⃣  Testing POST /api/bins/update (Create new bin)..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-001","fillLevel":45,"location":"Test Location 1"}' | jq '.'
echo ""
echo ""

# Test 3: Update bin (modify existing)
echo "3️⃣  Testing POST /api/bins/update (Update existing bin)..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-001","fillLevel":85}' | jq '.'
echo ""
echo ""

# Test 4: Create another bin
echo "4️⃣  Creating another test bin..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-002","fillLevel":95,"location":"Test Location 2"}' | jq '.'
echo ""
echo ""

# Test 5: Get all bins
echo "5️⃣  Testing GET /api/bins/status (Get all bins)..."
curl -s $BASE_URL/api/bins/status | jq '.'
echo ""
echo ""

# Test 6: Get full bins
echo "6️⃣  Testing GET /api/bins/full (Get full bins only)..."
curl -s $BASE_URL/api/bins/full | jq '.'
echo ""
echo ""

# Test 7: Get specific bin
echo "7️⃣  Testing GET /api/bins/status/:binId (Get specific bin)..."
curl -s $BASE_URL/api/bins/status/TEST-BIN-001 | jq '.'
echo ""
echo ""

# Test 8: Get non-existent bin
echo "8️⃣  Testing GET /api/bins/status/:binId (Non-existent bin)..."
curl -s $BASE_URL/api/bins/status/NON-EXISTENT | jq '.'
echo ""
echo ""

# Test 9: Invalid request (missing fillLevel)
echo "9️⃣  Testing POST with invalid data (missing fillLevel)..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-003"}' | jq '.'
echo ""
echo ""

# Test 10: Invalid request (fillLevel out of range)
echo "🔟 Testing POST with invalid data (fillLevel > 100)..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-003","fillLevel":150}' | jq '.'
echo ""
echo ""

echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="
