# AI Response Snapshot Testing

## Overview

This testing system validates that AI-generated feedback remains structurally consistent across code changes. Instead of comparing exact text (which would be too brittle for AI responses), we validate that responses contain expected structural elements.

## How It Works

### Test Files

- **`aiSnapshots.test.js`** - Main test file that generates AI feedback and compares against snapshots
- **`__snapshots__/`** - Directory containing baseline snapshot files (JSON format)

### Validation Approach

The tests validate **structural consistency** rather than exact text matching:

1. ✅ **Has Response** - Response exists and isn't empty
2. ✅ **Minimum Length** - Response is at least 50 characters
3. ✅ **Has Metadata** - Metadata object is present
4. ✅ **Has Prompt** - Prompt information is included
5. ✅ **Contains "What Went Well"** - Includes positive feedback (words like "well", "good", "correct")
6. ✅ **Contains Improvements** - Includes suggestions (words like "improve", "better", "suggest")
7. ✅ **Length Reasonable** - Response is between 100-10,000 characters
8. ✅ **Not Severely Truncated** - Response doesn't end abruptly

## Running Tests

### Create/Update Snapshots

```bash
docker-compose exec backend node tests/aiSnapshots.test.js --update
```

Use this when:

- Creating snapshots for the first time
- Intentionally updating AI prompts or feedback templates
- Accepting new AI response patterns as correct

### Compare Against Snapshots

```bash
docker-compose exec backend node tests/aiSnapshots.test.js
```

Use this for:

- Regression testing after code changes
- CI/CD pipeline validation
- Verifying prompt template changes don't break structure

## Test Cases

### Current Test Cases

1. **fibonacci_recursive**

   - Tests feedback for a recursive Fibonacci implementation
   - Validates discussion of recursion, performance, and optimization

2. **array_sum_basic**

   - Tests feedback for a basic array sum function
   - Validates discussion of loops, built-in methods, and best practices

3. **string_reverse**
   - Tests feedback for string reversal using built-in methods
   - Validates discussion of method chaining, Unicode handling, and input validation

### Adding New Test Cases

Edit `aiSnapshots.test.js` and add to the `TEST_CASES` array:

```javascript
{
  name: 'test_case_name',
  submissionText: `
    // Your code here
  `.trim(),
  challengeContext: {
    title: 'Challenge Title',
    description: 'Challenge description',
    requirements: 'Specific requirements',
    previousAttempts: 0,
  },
}
```

Then run with `--update` to create the baseline snapshot.

## Understanding Test Results

### Success Output

```
📋 Testing: fibonacci_recursive
   ⏳ Generating AI feedback...
   ✅ Response generated in 11789ms
   ✅ Snapshot match
      - Response length: 5028 chars
      - Snapshot length: 274 chars
```

### Failure Output

```
📋 Testing: array_sum_basic
   ⏳ Generating AI feedback...
   ✅ Response generated in 11737ms
   ❌ Snapshot mismatch
      Failed checks: [ 'hasImprovements', 'lengthReasonable' ]
      Current: 42 chars
      Snapshot: 3834 chars
```

Failed checks indicate which structural validations didn't pass.

## Known Limitations

### AI Response Variability

Gemini AI responses naturally vary in:

- **Length** - Responses can be 200-6000+ characters
- **Content** - Same prompt may produce different examples or explanations
- **Token Limits** - Long responses may hit `MAX_TOKENS` and be truncated

### What We DON'T Validate

- ❌ Exact text matching
- ❌ Specific code examples used
- ❌ Exact response length
- ❌ Order of suggestions

### What We DO Validate

- ✅ Response structure (has feedback, metadata, prompt)
- ✅ Response contains key elements (positive feedback + improvements)
- ✅ Response is complete (not severely truncated)
- ✅ Response length is reasonable (not too short or too long)

## Snapshot File Format

Snapshots are stored as JSON:

```json
{
  "timestamp": "2025-12-01T04:44:00.000Z",
  "response": {
    "feedback": "Full AI feedback text...",
    "prompt": {
      "system": "System prompt...",
      "user": "User prompt...",
      "combined": "Combined prompt..."
    },
    "metadata": {
      "validated": true,
      "validationErrors": []
    }
  },
  "metadata": {
    "responseLength": 5028,
    "hasValidation": true,
    "validated": true
  }
}
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
- name: Run AI Snapshot Tests
  run: docker-compose exec -T backend node tests/aiSnapshots.test.js
```

Tests will exit with code 0 (success) or 1 (failure).

## Troubleshooting

### All Tests Failing with "notSeverelyTruncated"

**Issue**: Gemini is hitting MAX_TOKENS limit consistently

**Solution**:

- Increase `maxOutputTokens` in `backend/src/services/aiService.js` (currently 2500)
- Simplify prompt templates to reduce token usage
- Check if `thoughtsTokenCount` is unusually high

### Tests Pass Locally But Fail in CI

**Issue**: Different AI responses in different environments

**Solution**:

- Ensure same Gemini model version (`gemini-2.5-flash`)
- Check temperature setting (0.7)
- Verify API key is configured correctly
- Consider making validation rules more lenient

### Snapshot Drift Over Time

**Issue**: Tests that previously passed now fail

**Causes**:

- Gemini model updates from Google
- Changes to prompt templates
- Changes to challenge context

**Solution**:

- Review the failed checks carefully
- If responses are still structurally valid, update snapshots with `--update`
- Document why snapshots were updated in commit message

## Best Practices

1. **Update Snapshots Intentionally** - Only use `--update` when you've reviewed and approved the new AI responses

2. **Test After Template Changes** - Always run snapshot tests after modifying prompt templates

3. **Review Failed Tests** - Don't blindly update snapshots; understand why they failed first

4. **Keep Test Cases Diverse** - Include different code patterns, difficulties, and languages

5. **Document Changes** - When updating snapshots, note in git commit why the update was needed

## Future Enhancements

Potential improvements to consider:

- [ ] Semantic similarity scoring instead of keyword matching
- [ ] Response time performance benchmarks
- [ ] Multiple snapshot versions for A/B testing prompts
- [ ] Automated detection of response quality degradation
- [ ] Support for testing different AI models/temperatures
- [ ] Parallel test execution for faster runs
- [ ] Integration with feedback persistence database
