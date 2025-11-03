#!/bin/bash

# Smart Garbage Monitoring System - Simple API Test Script
# This script tests all backend API endpoints

BASE_URL="http://localhost:5000"
echo "=========================================="
echo "Testing Smart Garbage Monitoring System API"
echo "=========================================="
echo ""

# Test 1: Root endpoint
echo "1️⃣  Testing root endpoint..."
echo "GET $BASE_URL"
curl -s $BASE_URL
echo -e "\n\n"

# Test 2: Update bin (create new)
echo "2️⃣  Testing POST /api/bins/update (Create new bin)..."
echo "POST $BASE_URL/api/bins/update"
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-001","fillLevel":45,"location":"Test Location 1"}'
echo -e "\n\n"

# Test 3: Update bin (modify existing)
echo "3️⃣  Testing POST /api/bins/update (Update to Full status)..."
echo "POST $BASE_URL/api/bins/update"
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-001","fillLevel":85}'
echo -e "\n\n"

# Test 4: Create another bin
echo "4️⃣  Creating another test bin (Full status)..."
curl -s -X POST $BASE_URL/api/bins/update \
  -H "Content-Type: application/json" \
  -d '{"binId":"TEST-BIN-002","fillLevel":95,"location":"Test Location 2"}'
echo -e "\n\n"

# Test 5: Get all bins
echo "5️⃣  Testing GET /api/bins/status (Get all bins)..."
echo "GET $BASE_URL/api/bins/status"
curl -s $BASE_URL/api/bins/status
echo -e "\n\n"

# Test 6: Get full bins
echo "6️⃣  Testing GET /api/bins/full (Get full bins only)..."
echo "GET $BASE_URL/api/bins/full"
curl -s $BASE_URL/api/bins/full
echo -e "\n\n"

# Test 7: Get specific bin
echo "7️⃣  Testing GET /api/bins/status/:binId (Get specific bin)..."
echo "GET $BASE_URL/api/bins/status/TEST-BIN-001"
curl -s $BASE_URL/api/bins/status/TEST-BIN-001
echo -e "\n\n"

echo "=========================================="
echo "✅ All tests completed!"
echo "=========================================="
