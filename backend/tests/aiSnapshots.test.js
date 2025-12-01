// Snapshot tests for AI responses
const aiService = require('../src/services/aiService');
const fs = require('fs');
const path = require('path');

// Directory for storing snapshots
const SNAPSHOTS_DIR = path.join(__dirname, '__snapshots__');

// Ensure snapshots directory exists
if (!fs.existsSync(SNAPSHOTS_DIR)) {
  fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
}

/**
 * Load or create snapshot
 */
function getSnapshot(testName) {
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${testName}.json`);

  if (fs.existsSync(snapshotPath)) {
    return JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
  }

  return null;
}

/**
 * Save snapshot
 */
function saveSnapshot(testName, data) {
  const snapshotPath = path.join(SNAPSHOTS_DIR, `${testName}.json`);
  fs.writeFileSync(snapshotPath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * Compare snapshot with current response
 * Instead of exact length matching, we check for key structural elements
 * because AI responses naturally vary in length
 */
function compareSnapshots(testName, currentResponse, updateSnapshots = false) {
  const snapshot = getSnapshot(testName);

  if (!snapshot || updateSnapshots) {
    console.log(`📸 Creating/updating snapshot for: ${testName}`);
    saveSnapshot(testName, {
      timestamp: new Date().toISOString(),
      response: currentResponse,
      metadata: {
        responseLength: currentResponse.feedback.length,
        hasValidation: !!currentResponse.metadata,
        validated: currentResponse.metadata?.validated,
      },
    });
    return { passed: true, created: true };
  }

  // Compare key structural aspects of the response
  // We don't compare exact text because AI responses naturally vary
  const currentFeedback = currentResponse.feedback.toLowerCase();

  const checks = {
    hasResponse: !!currentResponse.feedback,
    responseNotEmpty: currentResponse.feedback.length > 50, // At least 50 chars
    hasMetadata: !!currentResponse.metadata,
    hasPrompt: !!currentResponse.prompt,
    // Check for key feedback sections (what went well, improvements, etc.)
    hasWhatWentWell:
      currentFeedback.includes('well') ||
      currentFeedback.includes('good') ||
      currentFeedback.includes('correct'),
    hasImprovements:
      currentFeedback.includes('improve') ||
      currentFeedback.includes('better') ||
      currentFeedback.includes('suggest'),
    // Length is reasonable (not too short, not way too long)
    lengthReasonable:
      currentResponse.feedback.length > 100 &&
      currentResponse.feedback.length < 10000,
    // Check the response wasn't severely truncated (look for common truncation patterns)
    notSeverelyTruncated:
      !currentFeedback.endsWith('...') && currentFeedback.length > 200,
  };

  const allPassed = Object.values(checks).every((v) => v === true);

  return {
    passed: allPassed,
    checks,
    snapshot: snapshot.metadata,
    current: {
      responseLength: currentResponse.feedback.length,
      validated: currentResponse.metadata?.validated,
    },
  };
}

/**
 * Test sample prompts
 */
const TEST_CASES = [
  {
    name: 'fibonacci_recursive',
    submissionText: `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
    `.trim(),
    challengeContext: {
      title: 'Fibonacci Sequence',
      description: 'Write a function that calculates the nth Fibonacci number',
      requirements:
        'Must handle base cases correctly and return accurate results',
      previousAttempts: 0,
    },
  },
  {
    name: 'array_sum_basic',
    submissionText: `
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}
    `.trim(),
    challengeContext: {
      title: 'Array Sum',
      description: 'Calculate the sum of all numbers in an array',
      requirements: 'Use a loop to iterate through the array',
      previousAttempts: 0,
    },
  },
  {
    name: 'string_reverse',
    submissionText: `
function reverse(str) {
  return str.split('').reverse().join('');
}
    `.trim(),
    challengeContext: {
      title: 'String Reversal',
      description: 'Reverse a string using JavaScript methods',
      requirements: 'Use built-in string and array methods',
      previousAttempts: 0,
    },
  },
];

async function runSnapshotTests() {
  console.log('🧪 Running AI Response Snapshot Tests...\n');

  const updateMode = process.argv.includes('--update');

  if (updateMode) {
    console.log('📝 UPDATE MODE: Snapshots will be created/updated\n');
  }

  const results = {
    passed: 0,
    failed: 0,
    created: 0,
    tests: [],
  };

  for (const testCase of TEST_CASES) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(
      `   Submission: ${testCase.submissionText.substring(0, 50)}...`
    );

    try {
      // Generate AI response
      console.log('   ⏳ Generating AI feedback...');
      const startTime = Date.now();

      const response = await aiService.generateFeedback(
        testCase.submissionText,
        testCase.challengeContext,
        1 // Test user ID
      );

      const duration = Date.now() - startTime;
      console.log(`   ✅ Response generated in ${duration}ms`);

      // Compare with snapshot
      const comparison = compareSnapshots(testCase.name, response, updateMode);

      if (comparison.created) {
        results.created++;
        console.log('   📸 Snapshot created');
      } else if (comparison.passed) {
        results.passed++;
        console.log('   ✅ Snapshot match');
        console.log(
          `      - Response length: ${comparison.current.responseLength} chars`
        );
        console.log(
          `      - Snapshot length: ${comparison.snapshot.responseLength} chars`
        );
      } else {
        results.failed++;
        console.log('   ❌ Snapshot mismatch');
        console.log(
          '      Failed checks:',
          Object.entries(comparison.checks)
            .filter(([, v]) => !v)
            .map(([k]) => k)
        );
        console.log(
          `      Current: ${comparison.current.responseLength} chars`
        );
        console.log(
          `      Snapshot: ${comparison.snapshot.responseLength} chars`
        );
      }

      results.tests.push({
        name: testCase.name,
        passed: comparison.passed || comparison.created,
        duration,
        ...comparison,
      });
    } catch (error) {
      results.failed++;
      console.log('   ❌ Test failed:', error.message);
      results.tests.push({
        name: testCase.name,
        passed: false,
        error: error.message,
      });
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Snapshot Test Results');
  console.log('='.repeat(60));
  console.log(`Total tests: ${TEST_CASES.length}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📸 Created: ${results.created}`);
  console.log(
    `Success rate: ${((results.passed / TEST_CASES.length) * 100).toFixed(1)}%`
  );

  if (results.failed > 0) {
    console.log(
      '\n❌ Some tests failed. Run with --update to update snapshots'
    );
    process.exit(1);
  } else {
    console.log('\n✅ All snapshot tests passed!');
    process.exit(0);
  }
}

// Run tests
runSnapshotTests().catch((error) => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
});
