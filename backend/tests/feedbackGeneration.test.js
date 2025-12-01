// Quick test for AI feedback generation
const aiService = require('../src/services/aiService');

async function testFeedbackGeneration() {
  console.log('🧪 Testing AI Feedback Generation...\n');

  const testCode = `
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}
console.log(fibonacci(10));
  `.trim();

  const challengeContext = {
    title: 'Fibonacci Sequence',
    description: 'Write a function that calculates the nth Fibonacci number',
    requirements: 'The function should handle edge cases and be efficient',
    previousAttempts: 0,
  };

  try {
    console.log('Challenge:', challengeContext.title);
    console.log('Code submitted:\n', testCode);
    console.log('\n⏳ Generating AI feedback...\n');

    const result = await aiService.generateFeedback(
      testCode,
      challengeContext,
      1
    );

    console.log('✅ Feedback Generated Successfully!\n');
    console.log('Feedback:', result.feedback);
    console.log('\nMetadata:');
    console.log('- Validated:', result.metadata.validated);
    if (result.metadata.validationErrors?.length > 0) {
      console.log('- Validation Errors:', result.metadata.validationErrors);
    }

    console.log('\n✅ Test Passed!');
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testFeedbackGeneration();
