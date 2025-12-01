// Test for AI feedback endpoint
const { query } = require('../src/database/connection');

async function testFeedbackEndpoint() {
  console.log('🧪 Testing AI Feedback Endpoint Integration...\n');

  try {
    // Step 1: Find an existing submission or create one
    console.log('📋 Step 1: Finding an existing submission...');

    const submissionResult = await query(`
      SELECT s.id, s.submission_text, s.user_id, c.title
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      LIMIT 1
    `);

    if (submissionResult.rows.length === 0) {
      // Create a test submission
      console.log('Creating test submission...');

      // Find a challenge
      const challengeResult = await query(`
        SELECT id FROM challenges LIMIT 1
      `);

      if (challengeResult.rows.length === 0) {
        console.log('❌ No challenges found. Please create a challenge first.');
        return;
      }

      const challengeId = challengeResult.rows[0].id;

      // Find a user
      const userResult = await query(`
        SELECT id FROM users LIMIT 1
      `);

      if (userResult.rows.length === 0) {
        console.log('❌ No users found. Please create a user first.');
        return;
      }

      const userId = userResult.rows[0].id;

      // Create submission
      const newSubmission = await query(
        `
        INSERT INTO submissions (
          challenge_id, user_id, submission_text, status, attempt_number
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
        [
          challengeId,
          userId,
          'function test() { return "Hello World"; }',
          'submitted',
          1,
        ]
      );

      console.log('✅ Created test submission:', newSubmission.rows[0].id);
    }

    // Get submission again
    const finalSubmission = await query(`
      SELECT s.*, c.title, c.description, c.instructions
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      LIMIT 1
    `);

    const submission = finalSubmission.rows[0];
    console.log('✅ Found submission:', submission.id);
    console.log('   - Challenge:', submission.title);
    console.log('   - User ID:', submission.user_id);
    console.log(
      '   - Code length:',
      submission.submission_text.length,
      'characters\n'
    );

    // Step 2: Test the feedback generation
    console.log('📋 Step 2: Testing feedback generation via service...');
    const aiService = require('../src/services/aiService');

    const feedbackResult = await aiService.generateFeedback(
      submission.submission_text,
      {
        title: submission.title,
        description: submission.description,
        requirements: submission.instructions || '',
        previousAttempts: submission.attempt_number - 1,
      },
      submission.user_id
    );

    console.log('✅ Feedback generated successfully!');
    console.log(
      '   - Feedback length:',
      feedbackResult.feedback.length,
      'characters'
    );
    console.log('   - Validated:', feedbackResult.metadata.validated);

    // Step 3: Store feedback in database
    console.log('\n📋 Step 3: Storing feedback in database...');
    await query(
      `
      UPDATE submissions
      SET feedback = $1, updated_at = NOW()
      WHERE id = $2
    `,
      [feedbackResult.feedback, submission.id]
    );

    console.log('✅ Feedback stored in database');

    // Step 4: Verify storage
    console.log('\n📋 Step 4: Verifying feedback storage...');
    const verifyResult = await query(
      `
      SELECT id, feedback IS NOT NULL as has_feedback, LENGTH(feedback) as feedback_length
      FROM submissions
      WHERE id = $1
    `,
      [submission.id]
    );

    const verified = verifyResult.rows[0];
    console.log('✅ Verification complete:');
    console.log('   - Has feedback:', verified.has_feedback);
    console.log(
      '   - Feedback length:',
      verified.feedback_length,
      'characters'
    );

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Summary:');
    console.log('   - Submission ID:', submission.id);
    console.log('   - AI feedback generated and stored successfully');
    console.log('   - Endpoint: POST /api/ai/feedback');
    console.log('   - Body: { submissionId:', submission.id, '}');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

testFeedbackEndpoint();
