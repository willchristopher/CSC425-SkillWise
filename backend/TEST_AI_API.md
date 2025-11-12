# Testing Google Gemini API Integration

## Setup

1. **Get a Gemini API key from Google AI Studio:**
   - Go to https://makersuite.google.com/app/apikey
   - Click "Create API key"
   - Copy your API key

2. **Add your Gemini API key to `.env` file:**
```bash
GEMINI_API_KEY=your-actual-api-key-here
```

3. **Restart your backend server** to load the new environment variable.

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header).

### 1. Generate Feedback
**POST** `/api/ai/feedback`

Generate AI feedback for a code submission.

**Request Body:**
```json
{
  "submissionText": "function add(a, b) { return a + b; }",
  "challengeContext": {
    "title": "Create an Add Function",
    "description": "Write a function that adds two numbers",
    "requirements": "Function should handle positive and negative numbers"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "feedback": "Great job! Your function correctly adds two numbers...",
    "submissionLength": 38,
    "generatedAt": "2025-11-09T..."
  }
}
```

### 2. Get Hints
**POST** `/api/ai/hints/:challengeId`

Get helpful hints for a challenge without revealing the solution.

**Request Body:**
```json
{
  "challenge": {
    "title": "Reverse a String",
    "description": "Write a function that reverses a string",
    "difficulty": "Medium"
  }
}
```

**Query Parameters:**
- `attempts` (optional): Number of attempts made
- `lastAttempt` (optional): Summary of last attempt

**Response:**
```json
{
  "success": true,
  "data": {
    "challengeId": "123",
    "hints": "1. Consider using array methods... 2. Think about...",
    "generatedAt": "2025-11-09T..."
  }
}
```

### 3. Get Challenge Suggestions
**POST** `/api/ai/suggestions`

Get personalized challenge recommendations based on user profile.

**Request Body:**
```json
{
  "userProfile": {
    "skillLevel": "Intermediate",
    "completedCount": 15,
    "interests": ["JavaScript", "Algorithms"],
    "goals": "Improve problem-solving skills",
    "recentTopics": ["Arrays", "Loops"],
    "preferredDifficulty": "Medium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": "Based on your profile, here are recommended challenges...",
    "generatedAt": "2025-11-09T...",
    "basedOnProfile": {
      "skillLevel": "Intermediate",
      "completedCount": 15
    }
  }
}
```

### 4. Analyze Learning Progress
**POST** `/api/ai/analysis`

Get AI-powered analysis of learning patterns and recommendations.

**Request Body:**
```json
{
  "userId": "user123",
  "learningData": {
    "completedChallenges": 20,
    "successRate": 75,
    "strongAreas": ["Arrays", "Strings"],
    "weakAreas": ["Recursion", "Dynamic Programming"],
    "avgTimePerChallenge": 25,
    "streak": 7,
    "recentActivity": "Completed 5 challenges this week"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Your learning pattern shows excellent progress...",
    "generatedAt": "2025-11-09T...",
    "userId": "user123"
  }
}
```

## Testing with curl

### Example 1: Generate Feedback
```bash
curl -X POST http://localhost:3001/api/ai/feedback \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "submissionText": "function add(a, b) { return a + b; }",
    "challengeContext": {
      "title": "Create an Add Function",
      "description": "Write a function that adds two numbers"
    }
  }'
```

### Example 2: Get Hints
```bash
curl -X POST http://localhost:3001/api/ai/hints/123?attempts=2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "challenge": {
      "title": "Reverse a String",
      "description": "Write a function that reverses a string",
      "difficulty": "Medium"
    }
  }'
```

## Error Handling

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common errors:
- `400 Bad Request`: Missing required fields
- `401 Unauthorized`: Invalid or missing auth token
- `500 Internal Server Error`: Gemini API error or server issue

## Notes

- The API uses Google Gemini 1.5 Flash by default (fast and cost-effective)
- You can change to `gemini-1.5-pro` or `gemini-pro` in `aiService.js` for better quality
- Requests timeout after 30 seconds
- Make sure your Gemini API key is valid and has quota
- All endpoints require user authentication
- Gemini API is FREE for most use cases (up to 15 requests per minute)
