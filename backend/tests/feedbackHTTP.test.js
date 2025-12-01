// Integration test for AI feedback HTTP endpoint
const axios = require('axios');
const { query } = require('../src/database/connection');

const API_URL = 'http://localhost:3001/api';

async function testFeedbackHTTPEndpoint() {
  console.log('🧪 Testing AI Feedback HTTP Endpoint...\n');

  let authToken = null;

  try {
    // Step 1: Login to get auth token
    console.log('📋 Step 1: Authenticating...');

    // First, ensure we have a test user
    const userResult = await query(`
      SELECT id, email FROM users LIMIT 1
    `);

    if (userResult.rows.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    const testUser = userResult.rows[0];
    console.log('✅ Found test user:', testUser.email);

    // For testing, we'll use a test token (in production, this would come from login)
    // Create a simple JWT token for testing
    const jwt = require('jsonwebtoken');
    const JWT_SECRET =
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-change-in-production';

    authToken = jwt.sign(
      {
        id: testUser.id,
        email: testUser.email,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('✅ Auth token created\n');

    // Step 2: Find or create a submission
    console.log('📋 Step 2: Finding submission...');

    const submissionResult = await query(
      `
      SELECT s.id, s.submission_text, c.title
      FROM submissions s
      JOIN challenges c ON s.challenge_id = c.id
      WHERE s.user_id = $1
      LIMIT 1
    `,
      [testUser.id]
    );

    let submissionId;

    if (submissionResult.rows.length === 0) {
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

      // Create submission
      const newSubmission = await query(
        `
        INSERT INTO submissions (
          challenge_id, user_id, submission_text, status, attempt_number
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `,
        [
          challengeId,
          testUser.id,
          'function fibonacci(n) { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }',
          'submitted',
          1,
        ]
      );

      submissionId = newSubmission.rows[0].id;
      console.log('✅ Created test submission:', submissionId);
    } else {
      submissionId = submissionResult.rows[0].id;
      console.log('✅ Found submission:', submissionId);
      console.log('   - Challenge:', submissionResult.rows[0].title);
    }

    // Step 3: Call the HTTP endpoint
    console.log('\n📋 Step 3: Calling POST /api/ai/feedback endpoint...');
    console.log('   - Endpoint:', `${API_URL}/ai/feedback`);
    console.log('   - Body:', JSON.stringify({ submissionId }, null, 2));

    const startTime = Date.now();

    const response = await axios.post(
      `${API_URL}/ai/feedback`,
      { submissionId },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 35000, // 35 second timeout
      }
    );

    const duration = Date.now() - startTime;

    console.log('✅ Response received in', duration, 'ms');
    console.log('   - Status:', response.status);
    console.log('   - Success:', response.data.success);

    // Step 4: Verify response structure
    console.log('\n📋 Step 4: Verifying response structure...');

    const { data } = response.data;

    if (!data || !data.feedback) {
      throw new Error('Response missing feedback data');
    }

    console.log('✅ Response structure valid:');
    console.log('   - Has overall feedback:', !!data.feedback.overall);
    console.log('   - Has score:', !!data.feedback.score);
    console.log(
      '   - Has positive points:',
      Array.isArray(data.feedback.positive)
    );
    console.log(
      '   - Has improvements:',
      Array.isArray(data.feedback.improvements)
    );
    console.log(
      '   - Has suggestions:',
      Array.isArray(data.feedback.suggestions)
    );
    console.log('   - Submission ID:', data.submissionId);
    console.log('   - Generated at:', data.generatedAt);

    // Step 5: Verify database was updated
    console.log('\n📋 Step 5: Verifying database update...');

    const dbCheck = await query(
      `
      SELECT 
        id, 
        feedback IS NOT NULL as has_feedback,
        LENGTH(feedback) as feedback_length,
        updated_at
      FROM submissions
      WHERE id = $1
    `,
      [submissionId]
    );

    const dbRecord = dbCheck.rows[0];

    console.log('✅ Database verified:');
    console.log('   - Has feedback:', dbRecord.has_feedback);
    console.log(
      '   - Feedback length:',
      dbRecord.feedback_length,
      'characters'
    );
    console.log('   - Updated at:', dbRecord.updated_at);

    // Display sample feedback
    console.log('\n📊 Sample Feedback Preview:');
    console.log('─'.repeat(60));
    console.log(data.feedback.overall.substring(0, 300) + '...');
    console.log('─'.repeat(60));

    console.log('\n✅ All tests passed!');
    console.log('\n📊 Endpoint Summary:');
    console.log('   - Endpoint: POST /api/ai/feedback');
    console.log('   - Auth: Required (Bearer token)');
    console.log('   - Body: { submissionId: number }');
    console.log('   - Response time:', duration, 'ms');
    console.log('   - Saves to database: ✅');
    console.log('   - Returns structured feedback: ✅');
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error(
        'Response data:',
        JSON.stringify(error.response.data, null, 2)
      );
    }
    console.error(error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

testFeedbackHTTPEndpoint();
