#!/bin/bash

echo "Testing challenges endpoint..."

# Get token
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}' \
  | grep -o '"accessToken":"[^"]*"' \
  | cut -d'"' -f4)

echo "Token: ${TOKEN:0:20}..."

# Test challenges endpoint
echo -e "\nTesting GET /api/challenges:"
curl -s http://localhost:3001/api/challenges \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.success, .data | length'

echo -e "\nDone!"
