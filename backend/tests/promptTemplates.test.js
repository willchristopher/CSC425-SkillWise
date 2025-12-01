/**
 * Test Harness for AI Prompt Templates
 *
 * This test suite verifies that:
 * 1. Templates are properly formatted
 * 2. Placeholders are correctly replaced
 * 3. Response validation works as expected
 */

const {
  getPrompt,
  fillTemplate,
  validateResponse,
} = require('../src/utils/promptTemplates');

// Test data
const testData = {
  challengeGeneration: {
    category: 'JavaScript',
    difficulty: 'medium',
    topic: 'Array Methods',
    requirements: 'Use functional programming',
  },
  feedbackGeneration: {
    submissionText: 'function add(a, b) { return a + b; }',
    challengeTitle: 'Simple Addition',
    challengeDescription: 'Create a function that adds two numbers',
  },
};

// Mock responses
const mockResponses = {
  validChallengeJSON: {
    title: 'Array Transformation Challenge',
    description: 'Learn to transform arrays using map, filter, and reduce',
    instructions:
      '1. Use map to transform\n2. Filter results\n3. Reduce to final value',
    category: 'JavaScript',
    difficulty_level: 'medium',
    estimated_time_minutes: 45,
    points_reward: 30,
    learning_objectives: [
      'Master array methods',
      'Functional programming',
      'Data transformation',
    ],
    tags: ['arrays', 'functional', 'javascript'],
    starter_code: 'function transform(arr) {\n  // Your code here\n}',
    test_cases: ['transform([1,2,3]) should return [2,4,6]'],
    hints: ['Use map for transformation', 'Consider the input type'],
  },
  invalidChallengeJSON: {
    title: 'Incomplete Challenge',
    // Missing required fields
  },
  validFeedbackText: `Great work! Your solution correctly implements the addition function.

Strengths:
- Clear function naming
- Proper parameter handling

Areas for improvement:
- Consider adding input validation
- Add JSDoc comments for better documentation`,
  shortFeedbackText: 'Good job!', // Too short
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
};

/**
 * Test assertion helper
 */
function assert(condition, testName, errorMessage = '') {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${testName}`);
    results.passed++;
    return true;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${testName}`);
    if (errorMessage) {
      console.log(`  ${colors.red}Error: ${errorMessage}${colors.reset}`);
    }
    results.failed++;
    return false;
  }
}

function warn(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  results.warnings++;
}

/**
 * Run all tests
 */
async function runTests() {
  console.log(
    `\n${colors.blue}===== AI Prompt Template Test Harness =====${colors.reset}\n`
  );

  // Test 1: Template retrieval
  console.log(`${colors.blue}Test Suite: Template Retrieval${colors.reset}`);
  try {
    const challengePrompt = getPrompt(
      'generateChallenge',
      testData.challengeGeneration
    );
    assert(
      challengePrompt.systemPrompt && challengePrompt.userPrompt,
      'Get challenge generation template'
    );
    assert(
      challengePrompt.config.maxOutputTokens === 4000,
      'Template includes correct config'
    );
  } catch (e) {
    assert(false, 'Get challenge generation template', e.message);
  }

  // Test 2: Placeholder replacement
  console.log(
    `\n${colors.blue}Test Suite: Placeholder Replacement${colors.reset}`
  );
  const template = 'Hello {{name}}, you are learning {{topic}}!';
  const filled = fillTemplate(template, { name: 'Alice', topic: 'JavaScript' });
  assert(
    filled === 'Hello Alice, you are learning JavaScript!',
    'Replace simple placeholders'
  );

  const conditionalTemplate =
    'Category: {{category}}{{#if topic}} - Topic: {{topic}}{{/if}}';
  const withTopic = fillTemplate(conditionalTemplate, {
    category: 'JS',
    topic: 'Arrays',
  });
  const withoutTopic = fillTemplate(conditionalTemplate, { category: 'JS' });
  assert(
    withTopic === 'Category: JS - Topic: Arrays',
    'Conditional block with value'
  );
  assert(withoutTopic === 'Category: JS', 'Conditional block without value');

  // Test 3: Full prompt generation
  console.log(
    `\n${colors.blue}Test Suite: Full Prompt Generation${colors.reset}`
  );
  const challengePrompt = getPrompt(
    'generateChallenge',
    testData.challengeGeneration
  );
  assert(
    challengePrompt.userPrompt.includes('JavaScript'),
    'Prompt includes category'
  );
  assert(
    challengePrompt.userPrompt.includes('medium'),
    'Prompt includes difficulty'
  );
  assert(
    challengePrompt.userPrompt.includes('Array Methods'),
    'Prompt includes topic'
  );
  assert(
    challengePrompt.userPrompt.includes('functional programming'),
    'Prompt includes requirements'
  );

  // Test 4: Response validation - Valid JSON
  console.log(`\n${colors.blue}Test Suite: Response Validation${colors.reset}`);
  const validResult = validateResponse(
    'generateChallenge',
    mockResponses.validChallengeJSON
  );
  assert(
    validResult.valid === true,
    'Valid challenge response passes validation'
  );
  assert(validResult.errors.length === 0, 'Valid response has no errors');

  // Test 5: Response validation - Invalid JSON
  const invalidResult = validateResponse(
    'generateChallenge',
    mockResponses.invalidChallengeJSON
  );
  assert(
    invalidResult.valid === false,
    'Invalid challenge response fails validation'
  );
  assert(invalidResult.errors.length > 0, 'Invalid response has errors');
  if (invalidResult.errors.length > 0) {
    console.log(
      `  ${colors.yellow}Validation errors: ${invalidResult.errors.join(', ')}${
        colors.reset
      }`
    );
  }

  // Test 6: Text response validation
  const validTextResult = validateResponse(
    'generateFeedback',
    mockResponses.validFeedbackText
  );
  assert(
    validTextResult.valid === true,
    'Valid feedback text passes validation'
  );

  const shortTextResult = validateResponse(
    'generateFeedback',
    mockResponses.shortFeedbackText
  );
  assert(
    shortTextResult.valid === false,
    'Short feedback text fails validation'
  );

  // Test 7: All template types exist
  console.log(
    `\n${colors.blue}Test Suite: Template Completeness${colors.reset}`
  );
  const expectedTemplates = [
    'generateChallenge',
    'generateFeedback',
    'generateHints',
    'generateSuggestions',
    'analyzeProgress',
  ];

  expectedTemplates.forEach((templateName) => {
    try {
      const prompt = getPrompt(templateName, {});
      assert(
        prompt.systemPrompt && prompt.userPrompt,
        `Template '${templateName}' exists and is complete`
      );
    } catch (e) {
      assert(false, `Template '${templateName}' exists`, e.message);
    }
  });

  // Test 8: Missing placeholders warning
  console.log(`\n${colors.blue}Test Suite: Edge Cases${colors.reset}`);
  const promptWithMissing = getPrompt('generateChallenge', {
    category: 'JavaScript',
    // difficulty missing
  });
  if (promptWithMissing.userPrompt.includes('{{difficulty}}')) {
    warn('Missing placeholder not replaced (this is expected behavior)');
  }

  // Summary
  console.log(`\n${colors.blue}===== Test Summary =====${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Warnings: ${results.warnings}${colors.reset}`);

  const totalTests = results.passed + results.failed;
  const successRate =
    totalTests > 0 ? ((results.passed / totalTests) * 100).toFixed(1) : 0;
  console.log(`\nSuccess Rate: ${successRate}%`);

  if (results.failed === 0) {
    console.log(`\n${colors.green}✓ All tests passed!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.red}✗ Some tests failed${colors.reset}\n`);
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  console.error(`${colors.red}Test harness error:${colors.reset}`, error);
  process.exit(1);
});
