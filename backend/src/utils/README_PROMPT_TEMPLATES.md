# AI Prompt Templates

This directory contains reusable AI prompt templates for consistent challenge generation and AI interactions across the SkillWise platform.

## Overview

The prompt template system provides:

- **Reusable Templates**: Standardized prompts with placeholders for consistent AI responses
- **Variable Substitution**: Dynamic placeholder replacement using `{{variable}}` syntax
- **Conditional Content**: Support for conditional blocks with `{{#if variable}}...{{/if}}`
- **Response Validation**: Automatic validation of AI responses against expected formats
- **Test Harness**: Comprehensive testing to ensure template quality

## Available Templates

### 1. Generate Challenge (`generateChallenge`)

Creates a complete programming challenge with all necessary fields.

**Placeholders:**

- `{{category}}` - Programming category (e.g., JavaScript, Python)
- `{{difficulty}}` - Difficulty level (easy, medium, hard)
- `{{topic}}` - Optional specific topic
- `{{requirements}}` - Optional additional requirements

**Expected Response:** JSON object with challenge details

### 2. Generate Feedback (`generateFeedback`)

Provides constructive feedback on code submissions.

**Placeholders:**

- `{{submissionText}}` - The student's code submission
- `{{challengeTitle}}` - Name of the challenge
- `{{challengeDescription}}` - Challenge description

**Expected Response:** Text feedback (100-3000 characters)

### 3. Generate Hints (`generateHints`)

Provides progressive hints without giving away the solution.

**Placeholders:**

- `{{challengeTitle}}` - Name of the challenge
- `{{challengeDescription}}` - Challenge description
- `{{userProgress}}` - Student's current progress

**Expected Response:** 2-3 hints in text format

### 4. Generate Suggestions (`generateSuggestions`)

Recommends challenges based on user profile.

**Placeholders:**

- `{{skillLevel}}` - User's skill level
- `{{completedCount}}` - Number of completed challenges
- `{{preferredCategories}}` - User's preferred categories
- `{{weakAreas}}` - Areas needing improvement

**Expected Response:** Text with 3-5 recommendations

### 5. Analyze Progress (`analyzeProgress`)

Analyzes learning patterns and provides insights.

**Placeholders:**

- `{{completedChallenges}}` - Total challenges completed
- `{{successRate}}` - Success percentage
- `{{strongAreas}}` - Areas of strength
- `{{weakAreas}}` - Areas needing work
- `{{avgTimePerChallenge}}` - Average time spent
- `{{streak}}` - Learning streak in days
- `{{recentActivity}}` - Recent activity summary

**Expected Response:** Analysis text (300-2500 characters)

## Usage

### Get a Template

```javascript
const { getPrompt } = require('./utils/promptTemplates');

const prompt = getPrompt('generateChallenge', {
  category: 'JavaScript',
  difficulty: 'medium',
  topic: 'Array Methods',
  requirements: 'Use functional programming',
});

// Use prompt.systemPrompt and prompt.userPrompt with AI service
// Use prompt.config for model parameters
```

### Validate Response

```javascript
const { validateResponse } = require('./utils/promptTemplates');

const validation = validateResponse('generateChallenge', aiResponse);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
}
```

### Template Syntax

#### Simple Placeholders

```
Hello {{name}}, you are {{age}} years old.
```

#### Conditional Blocks

```
Category: {{category}}{{#if topic}} - Topic: {{topic}}{{/if}}
```

## Testing

Run the test harness to verify all templates:

```bash
# From the backend container
node tests/promptTemplates.test.js

# Or via docker-compose
docker-compose exec backend node tests/promptTemplates.test.js
```

The test harness verifies:

- ✓ Template retrieval works correctly
- ✓ Placeholder replacement functions properly
- ✓ Conditional blocks work as expected
- ✓ Full prompt generation includes all variables
- ✓ Response validation catches errors
- ✓ All templates exist and are complete

## Adding New Templates

1. Add template to `promptTemplates.js`:

```javascript
newTemplate: {
  systemPrompt: `System instructions...`,
  userPrompt: `User prompt with {{placeholder}}...`,
  config: {
    maxOutputTokens: 1000,
    temperature: 0.7,
  },
  expectedResponseFormat: {
    type: 'json', // or 'text'
    requiredFields: ['field1', 'field2'], // for JSON
    // OR
    minLength: 100, // for text
    maxLength: 2000,
  },
},
```

2. Add test cases to `promptTemplates.test.js`

3. Run test harness to verify

## Configuration

Each template includes configuration for the AI model:

- `maxOutputTokens`: Maximum tokens in response
- `temperature`: Creativity level (0.0-1.0)
- `topP`, `topK`: Sampling parameters (optional)

## Best Practices

1. **Clear Placeholders**: Use descriptive names like `{{challengeTitle}}` not `{{t}}`
2. **Validate Inputs**: Check all required variables are provided before calling template
3. **Test Changes**: Always run test harness after modifying templates
4. **Document Format**: Clearly specify expected response format
5. **Version Control**: Track template changes for consistency

## Benefits

✅ **Consistency**: Standardized prompts across the application  
✅ **Maintainability**: Central location for all AI prompts  
✅ **Quality**: Automated validation ensures response quality  
✅ **Testability**: Comprehensive test coverage  
✅ **Flexibility**: Easy to update and improve prompts  
✅ **Debugging**: Clear separation of prompt logic from business logic

## Integration

The prompt templates are automatically used by:

- `aiService.generateChallenge()` - Challenge generation
- AI feedback endpoints (when implemented)
- Hint generation endpoints (when implemented)
- Progress analysis endpoints (when implemented)

All AI interactions are logged to the `ai_interaction_logs` database table for auditing and analysis.
