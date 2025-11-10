const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/database/connection');

describe('Challenges API Integration', () => {
  let authToken;
  let userId;
  let goalId;

  beforeAll(async () => {
    // Register and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-challenges-${Date.now()}@example.com`,
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User'
      });

    userId = registerRes.body.data.user.id;
    authToken = registerRes.body.data.accessToken;

    // Create a test goal
    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Learn JavaScript',
        description: 'Master JavaScript fundamentals',
        category: 'programming',
        difficulty: 'medium'
      });

    goalId = goalRes.body.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await pool.query('DELETE FROM submissions WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  });

  describe('GET /api/challenges', () => {
    test('should return AI-generated challenges based on user goals', async () => {
      const response = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const challenge = response.body.data[0];
        expect(challenge).toHaveProperty('id');
        expect(challenge).toHaveProperty('title');
        expect(challenge).toHaveProperty('goal_id', goalId);
      }
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/challenges')
        .expect(401);
    });

    test('should filter challenges by difficulty', async () => {
      const response = await request(app)
        .get('/api/challenges?difficulty=easy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      // All challenges should be easy difficulty
      response.body.data.forEach(challenge => {
        if (challenge.difficulty_level) {
          expect(challenge.difficulty_level.toLowerCase()).toBe('easy');
        }
      });
    });
  });

  describe('GET /api/challenges/:id', () => {
    test('should return specific challenge details', async () => {
      // First get all challenges
      const listRes = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (listRes.body.data.length > 0) {
        const challengeId = listRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/challenges/${challengeId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(challengeId);
        expect(response.body.data).toHaveProperty('title');
        expect(response.body.data).toHaveProperty('instructions');
      }
    });

    test('should return 404 for non-existent challenge', async () => {
      await request(app)
        .get('/api/challenges/999-999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('POST /api/challenges/:id/start', () => {
    test('should start a challenge and create submission', async () => {
      // Get a challenge first
      const listRes = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (listRes.body.data.length > 0) {
        const challengeId = listRes.body.data[0].id;

        const response = await request(app)
          .post(`/api/challenges/${challengeId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Challenge');
        expect(response.body.submissionId).toBeDefined();
      }
    });

    test('should handle starting the same challenge twice', async () => {
      const listRes = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      if (listRes.body.data.length > 0) {
        const challengeId = listRes.body.data[0].id;

        // Start challenge first time
        await request(app)
          .post(`/api/challenges/${challengeId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        // Start again - should return existing submission
        const response = await request(app)
          .post(`/api/challenges/${challengeId}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);

        expect(response.body.message).toContain('already started');
      }
    });
  });
});

module.exports = {};