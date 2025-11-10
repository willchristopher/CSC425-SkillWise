# AI API Connection - Deliverable Documentation

## Overview
This deliverable implements a complete AI integration using Google's Gemini API to provide intelligent feedback, hints, and learning insights for the SkillWise platform.

## Features Implemented

### 1. AI Feedback Generation
**Endpoint:** `POST /api/ai/feedback`

Generates constructive feedback for student code submissions using Gemini AI models.

**Request Body:**
```json
{
  "submissionText": "string (required, max 10000 chars)",
  "challengeContext": {
    "title": "string (optional)",
    "description": "string (optional)",
    "difficulty": "string (optional)"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "feedback": "Detailed AI-generated feedback...",
    "metadata": {
      "model": "gemini-2.0-flash-exp",
      "timestamp": "2025-11-06T..."
    }
  }
}
```

### 2. AI Hints Generation
**Endpoint:** `POST /api/ai/hints`

Provides progressive hints for challenges without revealing complete solutions.

**Request Body:**
```json
{
  "challengeTitle": "string (required)",
  "challengeDescription": "string (required)",
  "userProgress": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "hints": "Progressive hints...",
    "timestamp": "2025-11-06T..."
  }
}
```

### 3. Challenge Suggestions
**Endpoint:** `POST /api/ai/suggestions`

Generates personalized challenge recommendations based on user profile.

**Request Body:**
```json
{
  "skillLevel": "string (optional, default: 'Beginner')",
  "completedTopics": ["string"] (optional),
  "languages": ["string"] (optional),
  "goals": "string (optional)"
}
```

### 4. Learning Progress Analysis
**Endpoint:** `POST /api/ai/analysis`

Analyzes learning patterns and provides personalized insights.

**Request Body:**
```json
{
  "completedChallenges": "number (optional)",
  "successRate": "number (optional)",
  "strengths": ["string"] (optional),
  "weaknesses": ["string"] (optional),
  "recentActivity": "string (optional)"
}
```

## Configuration

### Environment Variables
Add to `backend/.env`:
```properties
# AI Configuration - Google Gemini
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Getting a Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add it to your `.env` file
5. Restart the backend server

## Testing

### Run Integration Tests
```bash
cd backend
npm test -- tests/integration/ai.test.js
```

### Run Manual Tests
```bash
./test-ai-connection.sh
```

This script tests all four AI endpoints and provides detailed output.

### Expected Test Results
- ✅ Without API key: Returns 503 with "API key not configured"
- ✅ With valid API key: Returns 200 with AI-generated content
- ✅ Invalid requests: Returns 400 with validation errors
- ✅ Unauthorized requests: Returns 401

## Architecture

### Service Layer (`aiService.js`)
- Handles Google Gemini API communication
- Manages prompt engineering
- Error handling and rate limiting

### Controller Layer (`aiController.js`)
- Request validation
- Authentication enforcement
- Response formatting
- Error handling

### Routes (`ai.js`)
- RESTful endpoint definitions
- Authentication middleware
- Route documentation

## Error Handling

### Common Errors
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | Missing or invalid request data |
| 401 | UNAUTHORIZED | Missing or invalid authentication token |
| 503 | AI_SERVICE_ERROR | Gemini API key not configured or invalid |
| 500 | AI_*_ERROR | Unexpected AI service error |

### Error Response Format
```json
{
  "status": "fail",
  "error": {
    "statusCode": 503,
    "code": "AI_SERVICE_ERROR",
    "message": "Gemini API key not configured"
  }
}
```

## Security Considerations

1. **Authentication Required**: All AI endpoints require valid JWT token
2. **Rate Limiting**: Protected by global rate limiter (100 req/15min)
3. **Input Validation**: 
   - Submission text limited to 10,000 characters
   - All inputs sanitized
4. **API Key Security**: 
   - Stored in environment variables
   - Never exposed in responses
   - Validated before use

## Usage Examples

### Example 1: Get Feedback on Code
```bash
curl -X POST http://localhost:3001/api/ai/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "submissionText": "function isPalindrome(str) {\n  return str === str.split(\"\").reverse().join(\"\");\n}",
    "challengeContext": {
      "title": "Palindrome Checker",
      "difficulty": "Easy"
    }
  }'
```

### Example 2: Get Hints
```bash
curl -X POST http://localhost:3001/api/ai/hints \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "challengeTitle": "Two Sum",
    "challengeDescription": "Find two numbers that add up to target"
  }'
```

## File Structure
```
backend/
├── src/
│   ├── services/
│   │   └── aiService.js          # Gemini AI integration logic
│   ├── controllers/
│   │   └── aiController.js       # Request handlers
│   └── routes/
│       └── ai.js                 # API endpoints
├── tests/
│   └── integration/
│       └── ai.test.js            # Integration tests
└── .env                          # API key configuration
```

## Performance Considerations
- Feedback generation: ~500-1000 tokens
- Hints generation: ~300-500 tokens
- Suggestions: ~400-600 tokens
- Analysis: ~500-700 tokens

### Response Times
- Average: 2-5 seconds
- Depends on Gemini API latency
- Consider implementing caching for similar requests

## Future Enhancements

1. **Response Caching**: Cache similar feedback requests
2. **Streaming Responses**: Stream AI responses for better UX
3. **Custom Fine-tuning**: Train custom models for domain-specific feedback
4. **Multilingual Support**: Support multiple programming languages
5. **Advanced Analytics**: Track AI usage and effectiveness

## Troubleshooting

### "Gemini API key not configured"
- Verify `GEMINI_API_KEY` is set in `.env`
- Check key is not the default placeholder value
- Restart backend server after updating `.env`

### "Invalid Gemini API key"
- Verify key is correct (starts with `AIza`)
- Check key hasn't been restricted/revoked
- Ensure key has Generative AI API enabled

### "Rate limit exceeded"
- Gemini has API rate limits
- Wait and retry after cooldown period
- Check quota limits in Google Cloud Console

### High Latency
- Normal for AI responses (2-5 seconds)
- Consider implementing loading states
- Use streaming for real-time feedback

## Testing Checklist

- [x] AI service implementation complete
- [x] Controller endpoints implemented
- [x] Routes configured correctly
- [x] Authentication middleware applied
- [x] Input validation working
- [x] Error handling comprehensive
- [x] Integration tests written
- [x] Manual test script created
- [x] Documentation complete
- [x] Works without API key (graceful degradation)
- [x] Works with valid API key

## Deliverable Requirements Met

✅ **AI API Connection Implemented**
- Google Gemini integration complete
- All 4 endpoints functional
- Proper error handling

✅ **Authentication Protected**
- All endpoints require valid JWT
- Proper 401 responses for unauthorized access

✅ **Comprehensive Testing**
- Integration tests cover all endpoints
- Direct test script validates Gemini
- Error scenarios tested

✅ **Documentation Complete**
- API documentation provided
- Usage examples included
- Configuration instructions clear

✅ **Production Ready**
- Environment variable configuration
- Graceful error handling
- Security best practices followed
