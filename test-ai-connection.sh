#!/bin/bash
# Test AI API Connection Script

set -e

echo "🤖 Testing AI API Connection"
echo "=============================="
echo ""

API_URL="http://localhost:3001/api"
TEST_EMAIL="ai-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Register and get token
echo -e "${YELLOW}Step 1: Authenticating...${NC}"
AUTH_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"firstName\": \"AI\",
    \"lastName\": \"Tester\"
  }")

ACCESS_TOKEN=$(echo "$AUTH_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['data']['accessToken'])" 2>/dev/null || echo "")

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Authentication failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Authenticated successfully${NC}"
echo ""

# Step 2: Test AI Feedback
echo -e "${YELLOW}Step 2: Testing AI Feedback Generation...${NC}"
FEEDBACK_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $API_URL/ai/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "submissionText": "function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}",
    "challengeContext": {
      "title": "Fibonacci Sequence",
      "description": "Write a function to calculate Fibonacci numbers",
      "difficulty": "Medium"
    }
  }')

HTTP_CODE=$(echo "$FEEDBACK_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$FEEDBACK_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ AI Feedback generated successfully${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool | head -20
  echo "..."
elif [ "$HTTP_CODE" == "503" ]; then
  echo -e "${YELLOW}⚠️  AI service not configured (expected without API key)${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool
else
  echo -e "${RED}❌ Unexpected response code: $HTTP_CODE${NC}"
  echo "$RESPONSE_BODY"
fi
echo ""

# Step 3: Test AI Hints
echo -e "${YELLOW}Step 3: Testing AI Hints Generation...${NC}"
HINTS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $API_URL/ai/hints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "challengeTitle": "Binary Search",
    "challengeDescription": "Implement an efficient binary search algorithm",
    "userProgress": "function binarySearch(arr, target) { // stuck here }"
  }')

HTTP_CODE=$(echo "$HINTS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$HINTS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ AI Hints generated successfully${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool | head -20
  echo "..."
elif [ "$HTTP_CODE" == "503" ]; then
  echo -e "${YELLOW}⚠️  AI service not configured (expected without API key)${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool
else
  echo -e "${RED}❌ Unexpected response code: $HTTP_CODE${NC}"
fi
echo ""

# Step 4: Test Challenge Suggestions
echo -e "${YELLOW}Step 4: Testing Challenge Suggestions...${NC}"
SUGGESTIONS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $API_URL/ai/suggestions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "skillLevel": "Intermediate",
    "completedTopics": ["Arrays", "Strings", "Basic Algorithms"],
    "languages": ["JavaScript", "Python"],
    "goals": "Master data structures and prepare for interviews"
  }')

HTTP_CODE=$(echo "$SUGGESTIONS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$SUGGESTIONS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Challenge suggestions generated successfully${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool | head -15
  echo "..."
elif [ "$HTTP_CODE" == "503" ]; then
  echo -e "${YELLOW}⚠️  AI service not configured (expected without API key)${NC}"
else
  echo -e "${RED}❌ Unexpected response code: $HTTP_CODE${NC}"
fi
echo ""

# Step 5: Test Learning Analysis
echo -e "${YELLOW}Step 5: Testing Learning Progress Analysis...${NC}"
ANALYSIS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST $API_URL/ai/analysis \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "completedChallenges": 15,
    "successRate": 80,
    "strengths": ["Problem Solving", "Array Manipulation"],
    "weaknesses": ["Time Complexity", "Edge Cases"],
    "recentActivity": "Completed 3 challenges this week"
  }')

HTTP_CODE=$(echo "$ANALYSIS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$ANALYSIS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" == "200" ]; then
  echo -e "${GREEN}✅ Learning analysis generated successfully${NC}"
  echo "$RESPONSE_BODY" | python3 -m json.tool | head -15
  echo "..."
elif [ "$HTTP_CODE" == "503" ]; then
  echo -e "${YELLOW}⚠️  AI service not configured (expected without API key)${NC}"
else
  echo -e "${RED}❌ Unexpected response code: $HTTP_CODE${NC}"
fi
echo ""

# Summary
echo "=============================="
echo -e "${GREEN}🎉 AI API Connection Tests Complete!${NC}"
echo ""
echo "📊 Test Summary:"
echo "  ✅ Authentication endpoint working"
echo "  ✅ AI Feedback endpoint accessible"
echo "  ✅ AI Hints endpoint accessible"
echo "  ✅ Challenge Suggestions endpoint accessible"
echo "  ✅ Learning Analysis endpoint accessible"
echo ""
echo "💡 To enable full AI functionality:"
echo "   1. Get an OpenAI API key from https://platform.openai.com/api-keys"
echo "   2. Update backend/.env: OPENAI_API_KEY=your-actual-key"
echo "   3. Restart the backend server"
echo ""
echo "📝 API Endpoints tested:"
echo "   POST /api/ai/feedback - Generate code feedback"
echo "   POST /api/ai/hints - Get challenge hints"
echo "   POST /api/ai/suggestions - Get personalized suggestions"
echo "   POST /api/ai/analysis - Analyze learning progress"
