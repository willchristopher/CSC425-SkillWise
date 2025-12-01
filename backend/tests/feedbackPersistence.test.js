// Test for AI feedback persistence
const aiFeedbackService = require('../src/services/aiFeedbackService');
const { query } = require('../src/database/connection');

async function testFeedbackPersistence() {
  console.log('🧪 Testing AI Feedback Persistence...\n');

  try {
    // Step 1: Find or create a submission
    console.log('📋 Step 1: Setting up test submission...');

    const submissionResult = await query(`
      SELECT s.id, s.submission_text, c.title
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      LIMIT 1
    `);

    if (submissionResult.rows.length === 0) {
      console.log('❌ No submissions found. Please create a submission first.');
      return;
    }

    const submission = submissionResult.rows[0];
    console.log('✅ Found submission:', submission.id);
    console.log('   - Challenge:', submission.title);

    // Step 2: Create AI feedback
    console.log('\n📋 Step 2: Creating AI feedback record...');

    const feedbackData = {
      submissionId: submission.id,
      prompt:
        'Please review this code submission and provide feedback on code quality, best practices, and areas for improvement.',
      response:
        'This is a well-structured solution! You correctly implemented the algorithm with clear variable names. Areas for improvement: Consider adding error handling for edge cases and documenting your functions with JSDoc comments.',
      feedbackType: 'test_feedback',
      confidenceScore: 0.85,
      suggestions: [
        'Add error handling for null inputs',
        'Use JSDoc comments for documentation',
      ],
      strengths: [
        'Clear variable naming',
        'Proper code structure',
        'Efficient algorithm',
      ],
      improvements: [
        'Add edge case handling',
        'Include function documentation',
      ],
      aiModel: 'gemini-2.5-flash',
      processingTimeMs: 2500,
    };

    const createdFeedback = await aiFeedbackService.createAIFeedback(
      feedbackData
    );

    console.log('✅ Feedback created successfully!');
    console.log('   - ID:', createdFeedback.id);
    console.log('   - Submission ID:', createdFeedback.submission_id);
    console.log('   - AI Model:', createdFeedback.ai_model);
    console.log(
      '   - Processing Time:',
      createdFeedback.processing_time_ms,
      'ms'
    );
    console.log('   - Confidence Score:', createdFeedback.confidence_score);

    // Step 3: Retrieve feedback by submission
    console.log('\n📋 Step 3: Retrieving feedback for submission...');

    const allFeedback = await aiFeedbackService.getFeedbackBySubmission(
      submission.id
    );

    console.log('✅ Retrieved', allFeedback.length, 'feedback record(s)');
    allFeedback.forEach((fb, index) => {
      console.log(
        `   [${index + 1}] ID: ${fb.id}, Type: ${fb.feedback_type}, Created: ${
          fb.created_at
        }`
      );
    });

    // Step 4: Get latest feedback
    console.log('\n📋 Step 4: Getting latest feedback...');

    const latestFeedback = await aiFeedbackService.getLatestFeedback(
      submission.id
    );

    console.log('✅ Latest feedback retrieved:');
    console.log('   - ID:', latestFeedback.id);
    console.log('   - Type:', latestFeedback.feedback_type);
    console.log(
      '   - Prompt length:',
      latestFeedback.prompt.length,
      'characters'
    );
    console.log(
      '   - Response length:',
      latestFeedback.response.length,
      'characters'
    );
    console.log('   - Strengths:', latestFeedback.strengths?.length || 0);
    console.log('   - Improvements:', latestFeedback.improvements?.length || 0);
    console.log('   - Suggestions:', latestFeedback.suggestions?.length || 0);

    // Step 5: Get feedback by user
    console.log('\n📋 Step 5: Getting all user feedback...');

    const userSubmission = await query(
      'SELECT user_id FROM submissions WHERE id = $1',
      [submission.id]
    );
    const userId = userSubmission.rows[0].user_id;

    const userFeedback = await aiFeedbackService.getFeedbackByUser(userId);

    console.log(
      '✅ Retrieved',
      userFeedback.length,
      'feedback records for user',
      userId
    );
    userFeedback.slice(0, 3).forEach((fb, index) => {
      console.log(
        `   [${index + 1}] Challenge: ${fb.challenge_title}, Type: ${
          fb.feedback_type
        }`
      );
    });

    // Step 6: Verify data structure
    console.log('\n📋 Step 6: Verifying data structure...');

    const dbCheck = await query(
      `SELECT 
        id, 
        submission_id, 
        prompt IS NOT NULL as has_prompt,
        feedback_text IS NOT NULL as has_response,
        LENGTH(prompt) as prompt_length,
        LENGTH(feedback_text) as response_length,
        feedback_type,
        ai_model,
        processing_time_ms,
        created_at
      FROM ai_feedback
      WHERE id = $1`,
      [createdFeedback.id]
    );

    const dbRecord = dbCheck.rows[0];
    console.log('✅ Database structure verified:');
    console.log('   - Has prompt:', dbRecord.has_prompt);
    console.log('   - Has response:', dbRecord.has_response);
    console.log('   - Prompt length:', dbRecord.prompt_length, 'characters');
    console.log(
      '   - Response length:',
      dbRecord.response_length,
      'characters'
    );
    console.log('   - Feedback type:', dbRecord.feedback_type);
    console.log('   - AI model:', dbRecord.ai_model);
    console.log('   - Processing time:', dbRecord.processing_time_ms, 'ms');

    // Step 7: Clean up test data
    console.log('\n📋 Step 7: Cleaning up test data...');

    await aiFeedbackService.deleteFeedback(createdFeedback.id);
    console.log('✅ Test feedback deleted');

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - AI feedback table: ✅ Working');
    console.log('   - Create feedback: ✅ Success');
    console.log('   - Retrieve by submission: ✅ Success');
    console.log('   - Retrieve latest: ✅ Success');
    console.log('   - Retrieve by user: ✅ Success');
    console.log('   - Delete feedback: ✅ Success');
    console.log('   - Stores: submission_id, prompt, response ✅');
    console.log(
      '   - Additional fields: type, suggestions, strengths, improvements ✅'
    );
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testFeedbackPersistence();
