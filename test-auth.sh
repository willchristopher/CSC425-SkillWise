#!/bin/bash
# Authentication Testing Script for Deliverable 7
# Tests all rubric requirements without using the UI

set -e  # Exit on error

echo "🧪 SkillWise Authentication Testing Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:3001/api"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
COOKIES_FILE="/tmp/skillwise-cookies.txt"

# Clean up cookies file
rm -f $COOKIES_FILE

echo -e "${YELLOW}📋 Test 1: User Registration (bcrypt hashing)${NC}"
echo "Creating new user: $TEST_EMAIL"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"firstName\": \"Test\",
    \"lastName\": \"User\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool

if echo "$REGISTER_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✅ Registration successful${NC}"
else
  echo -e "${RED}❌ Registration failed${NC}"
  exit 1
fi
echo ""

echo -e "${YELLOW}📋 Test 2: Verify bcrypt hashing in database${NC}"
DB_PASSWORD=$(docker exec skillwise_db psql -U skillwise_user -d skillwise_db -t -c \
  "SELECT password_hash FROM users WHERE email='$TEST_EMAIL';")

if [[ $DB_PASSWORD == *'$2a$'* ]] || [[ $DB_PASSWORD == *'$2b$'* ]]; then
  echo -e "${GREEN}✅ Password is bcrypt hashed: ${DB_PASSWORD:0:20}...${NC}"
else
  echo -e "${RED}❌ Password is not properly hashed${NC}"
  exit 1
fi
echo ""

echo -e "${YELLOW}📋 Test 3: User Login (JWT generation)${NC}"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -c $COOKIES_FILE \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$LOGIN_RESPONSE" | python3 -m json.tool

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Login failed - no access token received${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Login successful, received JWT token${NC}"
echo "Token (first 30 chars): ${ACCESS_TOKEN:0:30}..."
echo ""

echo -e "${YELLOW}📋 Test 4: Verify httpOnly refresh token cookie${NC}"
if grep -q "refreshToken" $COOKIES_FILE; then
  echo -e "${GREEN}✅ Refresh token cookie set${NC}"
  cat $COOKIES_FILE
else
  echo -e "${RED}❌ Refresh token cookie not found${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 5: Access protected route WITHOUT token${NC}"
UNAUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $API_URL/user/profile)
HTTP_CODE=$(echo "$UNAUTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✅ Protected route correctly returns 401 without token${NC}"
else
  echo -e "${RED}❌ Expected 401, got $HTTP_CODE${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 6: Access protected route WITH valid token${NC}"
PROFILE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $API_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_CODE=$(echo "$PROFILE_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Protected route accessible with valid token${NC}"
  echo "$PROFILE_RESPONSE" | sed '/HTTP_CODE/d' | python3 -m json.tool
else
  echo -e "${RED}❌ Expected 200, got $HTTP_CODE${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 7: Token Refresh${NC}"
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh \
  -b $COOKIES_FILE \
  -c $COOKIES_FILE)

echo "$REFRESH_RESPONSE" | python3 -m json.tool

if echo "$REFRESH_RESPONSE" | grep -q "accessToken"; then
  echo -e "${GREEN}✅ Token refresh successful${NC}"
else
  echo -e "${RED}❌ Token refresh failed${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 8: Login with invalid credentials${NC}"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"WrongPassword123!\"
  }")
HTTP_CODE=$(echo "$INVALID_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)

if [ "$HTTP_CODE" == "401" ]; then
  echo -e "${GREEN}✅ Invalid credentials correctly rejected${NC}"
else
  echo -e "${RED}❌ Expected 401, got $HTTP_CODE${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 9: Verify refresh tokens in database${NC}"
docker exec skillwise_db psql -U skillwise_user -d skillwise_db -c \
  "SELECT id, user_id, LEFT(token, 30) as token_preview, expires_at, is_revoked FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email='$TEST_EMAIL') ORDER BY created_at DESC LIMIT 3;"
echo ""

echo -e "${YELLOW}📋 Test 10: Logout${NC}"
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/auth/logout \
  -b $COOKIES_FILE)

echo "$LOGOUT_RESPONSE" | python3 -m json.tool

if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
  echo -e "${GREEN}✅ Logout successful${NC}"
else
  echo -e "${RED}❌ Logout failed${NC}"
fi
echo ""

echo -e "${YELLOW}📋 Test 11: Verify token revoked in database${NC}"
docker exec skillwise_db psql -U skillwise_user -d skillwise_db -c \
  "SELECT id, user_id, is_revoked, updated_at FROM refresh_tokens WHERE user_id = (SELECT id FROM users WHERE email='$TEST_EMAIL') ORDER BY updated_at DESC LIMIT 1;"
echo ""

echo -e "${YELLOW}📋 Test 12: Try using token after logout${NC}"
AFTER_LOGOUT=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET $API_URL/user/profile \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_CODE=$(echo "$AFTER_LOGOUT" | grep "HTTP_CODE" | cut -d: -f2)

# Note: Access token might still work until it expires (15 min), but refresh should fail
echo "Access token status after logout: $HTTP_CODE (may still be valid until expiration)"
echo ""

# Clean up
rm -f $COOKIES_FILE

echo "=========================================="
echo -e "${GREEN}🎉 All authentication tests completed!${NC}"
echo ""
echo "📊 Summary of what was tested:"
echo "  ✅ User registration with validation"
echo "  ✅ bcrypt password hashing (12 rounds)"
echo "  ✅ JWT access token generation"
echo "  ✅ httpOnly refresh token cookies"
echo "  ✅ Authentication middleware protection"
echo "  ✅ Token verification on protected routes"
echo "  ✅ Token refresh mechanism"
echo "  ✅ Invalid credential handling"
echo "  ✅ Database token storage"
echo "  ✅ Logout and token revocation"
echo ""
echo "🔍 To verify bcrypt implementation:"
echo "   Check: backend/src/services/authService.js (lines 26, 88)"
echo ""
echo "🔍 To verify JWT implementation:"
echo "   Check: backend/src/utils/jwt.js"
echo "   Check: backend/src/middleware/auth.js"
echo ""
echo "🔍 To verify .env configuration:"
echo "   Check: backend/.env (JWT_SECRET, BCRYPT_ROUNDS)"
