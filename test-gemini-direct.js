// Direct test of Gemini AI service without database/auth dependencies
// Set environment variables directly
process.env.GEMINI_API_KEY = 'AIzaSyBnRegfhw_pplaUI5iXf7XhZqln22uFN8o';
process.env.GEMINI_MODEL = 'gemini-2.0-flash-exp';

const aiService = require('./backend/src/services/aiService');

async function testGeminiIntegration() {
  console.log('🤖 Testing Gemini AI Integration\n');
  console.log('================================\n');

  try {
    // Test 1: Generate Feedback
    console.log('Test 1: Generate Feedback');
    console.log('-------------------------');
    const feedbackResult = await aiService.generateFeedback(
      'function add(a, b) { return a + b; }',
      {
        title: 'Create an Addition Function',
        difficulty: 'Easy',
        description: 'Write a function that adds two numbers'
      }
    );
    console.log('✅ Feedback generated successfully');
    console.log('Model:', feedbackResult.model);
    console.log('Timestamp:', feedbackResult.timestamp);
    console.log('Feedback preview:', feedbackResult.feedback.substring(0, 200) + '...\n');

    // Test 2: Generate Hints
    console.log('Test 2: Generate Hints');
    console.log('----------------------');
    const hintsResult = await aiService.generateHints(
      'Array Sorting Challenge',
      'Sort an array of numbers in ascending order',
      'let numbers = [3, 1, 4, 1, 5];'
    );
    console.log('✅ Hints generated successfully');
    console.log('Timestamp:', hintsResult.timestamp);
    console.log('Hints preview:', hintsResult.hints.substring(0, 200) + '...\n');

    // Test 3: Analyze Pattern
    console.log('Test 3: Analyze Learning Patterns');
    console.log('----------------------------------');
    const analysisResult = await aiService.analyzePattern({
      completedChallenges: 15,
      successRate: 80,
      strengths: ['loops', 'conditionals'],
      weaknesses: ['recursion', 'async'],
      recentActivity: 'Completed 3 challenges this week'
    });
    console.log('✅ Analysis generated successfully');
    console.log('Timestamp:', analysisResult.timestamp);
    console.log('Analysis preview:', analysisResult.analysis.substring(0, 200) + '...\n');

    // Test 4: Suggest Next Challenges
    console.log('Test 4: Suggest Next Challenges');
    console.log('--------------------------------');
    const suggestionsResult = await aiService.suggestNextChallenges({
      skillLevel: 'Intermediate',
      completedTopics: ['Arrays', 'Objects', 'Functions'],
      languages: ['JavaScript'],
      goals: 'Master data structures'
    });
    console.log('✅ Suggestions generated successfully');
    console.log('Timestamp:', suggestionsResult.timestamp);
    console.log('Suggestions preview:', suggestionsResult.suggestions.substring(0, 200) + '...\n');

    console.log('================================');
    console.log('🎉 All Gemini AI tests passed!');
    console.log('================================\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGeminiIntegration();
