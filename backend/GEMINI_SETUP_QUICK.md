# 🚀 Quick Setup: Gemini API Integration

## ✅ What Changed

Your SkillWise backend now uses **Google Gemini** instead of OpenAI!

### Why Gemini?

- ✨ **FREE** for most use cases (15 requests/minute)
- 🚀 Fast responses with Gemini 1.5 Flash
- 💪 Powerful AI capabilities
- 📊 Generous quotas for development

## 🔑 Get Your Free API Key (2 minutes)

1. **Go to Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API key"**
4. **Copy the key** - it looks like: `AIzaSyC...`

## 📝 Add to Your .env File

Open `/Users/zachwalters/CSC425-SkillWise/backend/.env` and add:

```bash
GEMINI_API_KEY=AIzaSyC_your_actual_key_here
```

## 🔄 Restart Your Server

### If using Docker:

```bash
cd /Users/zachwalters/CSC425-SkillWise
docker-compose restart backend
```

### If running directly:

```bash
cd /Users/zachwalters/CSC425-SkillWise/backend
npm run dev
```

## 🧪 Test It Works

### Quick Test with curl:

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

## 🎯 Available Endpoints

All work the same as before, just using Gemini now:

- `POST /api/ai/feedback` - Generate feedback for code
- `POST /api/ai/hints/:challengeId` - Get helpful hints
- `POST /api/ai/suggestions` - Get challenge recommendations
- `POST /api/ai/analysis` - Analyze learning progress

## 📚 More Info

- **Full API docs**: `TEST_AI_API.md`
- **Implementation details**: `GEMINI_IMPLEMENTATION.md`
- **Free quota info**: https://ai.google.dev/pricing

## 🎉 That's It!

You're ready to use AI-powered features in your app - completely free!
