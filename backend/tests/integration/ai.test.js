// AI Integration Tests
const request = require('supertest');
const app = require('../../src/app');

describe('AI Integration Tests', () => {
  let authToken;

  // Helper to get auth token
  const getAuthToken = async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-ai-${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
      });
    
    return registerResponse.body.data.accessToken;
  };

  beforeAll(async () => {
    authToken = await getAuthToken();
  });

  describe('POST /api/ai/feedback', () => {
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/feedback')
        .send({
          submissionText: 'function test() { return true; }'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 without submission text', async () => {
      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('required');
    });

    test('should return 400 if submission text too long', async () => {
      const longText = 'a'.repeat(10001);
      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          submissionText: longText
        });

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('too long');
    });

    test('should generate AI feedback with valid input', async () => {
      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          submissionText: 'function add(a, b) { return a + b; }',
          challengeContext: {
            title: 'Simple Addition',
            description: 'Create a function that adds two numbers',
            difficulty: 'Easy'
          }
        });

      // Should succeed or return service error if no API key
      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('feedback');
        expect(response.body.data).toHaveProperty('metadata');
        expect(response.body.data.metadata).toHaveProperty('timestamp');
      }
    });

    test('should handle missing challenge context gracefully', async () => {
      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          submissionText: 'console.log("Hello World");'
        });

      expect([200, 503]).toContain(response.status);
    });
  });

  describe('POST /api/ai/hints', () => {
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/hints')
        .send({
          challengeTitle: 'Test Challenge',
          challengeDescription: 'Test description'
        });

      expect(response.status).toBe(401);
    });

    test('should return 400 without required fields', async () => {
      const response = await request(app)
        .post('/api/ai/hints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('required');
    });

    test('should generate hints with valid input', async () => {
      const response = await request(app)
        .post('/api/ai/hints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeTitle: 'Binary Search',
          challengeDescription: 'Implement binary search algorithm',
          userProgress: 'function search(arr, target) { }'
        });

      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('hints');
        expect(response.body.data).toHaveProperty('timestamp');
      }
    });

    test('should work without user progress', async () => {
      const response = await request(app)
        .post('/api/ai/hints')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          challengeTitle: 'Reverse String',
          challengeDescription: 'Reverse a string in place'
        });

      expect([200, 503]).toContain(response.status);
    });
  });

  describe('POST /api/ai/suggestions', () => {
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/suggestions')
        .send({});

      expect(response.status).toBe(401);
    });

    test('should generate suggestions with minimal data', async () => {
      const response = await request(app)
        .post('/api/ai/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('suggestions');
      }
    });

    test('should generate suggestions with full profile', async () => {
      const response = await request(app)
        .post('/api/ai/suggestions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          skillLevel: 'Intermediate',
          completedTopics: ['Arrays', 'Loops', 'Functions'],
          languages: ['JavaScript', 'Python'],
          goals: 'Master data structures and algorithms'
        });

      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('suggestions');
        expect(response.body.data).toHaveProperty('timestamp');
      }
    });
  });

  describe('POST /api/ai/analysis', () => {
    test('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/ai/analysis')
        .send({});

      expect(response.status).toBe(401);
    });

    test('should analyze learning patterns with minimal data', async () => {
      const response = await request(app)
        .post('/api/ai/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('analysis');
      }
    });

    test('should analyze with comprehensive learning data', async () => {
      const response = await request(app)
        .post('/api/ai/analysis')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          completedChallenges: 25,
          successRate: 78,
          strengths: ['Problem Solving', 'Algorithms'],
          weaknesses: ['Code Optimization', 'Edge Cases'],
          recentActivity: 'Completed 5 challenges this week'
        });

      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('analysis');
        expect(response.body.data).toHaveProperty('timestamp');
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle service errors gracefully', async () => {
      // Test will pass if AI service is not configured
      const response = await request(app)
        .post('/api/ai/feedback')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          submissionText: 'test code'
        });

      if (response.status === 503) {
        expect(response.body.error.code).toBe('AI_SERVICE_ERROR');
        expect(response.body.error.message).toBeTruthy();
      }
    });
  });
});

module.exports = {};