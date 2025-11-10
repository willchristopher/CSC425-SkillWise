const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/connection');

describe('Challenges API Integration Tests', () => {
  let authToken;
  let userId;
  let goalId;
  let challengeId;

  beforeAll(async () => {
    // Create test user
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `test${Date.now()}@example.com`,
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      });

    authToken = signupRes.body.data.accessToken;
    userId = signupRes.body.data.user.id;

    // Create a test goal
    const goalRes = await request(app)
      .post('/api/goals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Test Goal for Challenges',
        description: 'A goal to test challenges',
        target_completion_date: '2025-12-31',
      });

    goalId = goalRes.body.data.id;
  });

  afterAll(async () => {
    // Cleanup
    if (userId) {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await db.end();
  });

  describe('POST /api/challenges', () => {
    it('should create a new challenge', async () => {
      const challengeData = {
        goal_id: goalId,
        title: 'Complete React Tutorial',
        description: 'Finish the official React tutorial',
        difficulty_level: 'easy',
        points_reward: 100,
      };

      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send(challengeData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(challengeData.title);
      expect(res.body.data.goal_id).toBe(goalId);

      challengeId = res.body.data.id;
    });

    it('should fail without goal_id', async () => {
      const res = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Challenge',
          description: 'Test',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/challenges', () => {
    it('should return all user challenges', async () => {
      const res = await request(app)
        .get('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter challenges by goal', async () => {
      const res = await request(app)
        .get(`/api/challenges?goal_id=${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(c => c.goal_id === goalId)).toBe(true);
    });

    it('should filter by difficulty level', async () => {
      const res = await request(app)
        .get('/api/challenges?difficulty_level=easy')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/challenges/:id', () => {
    it('should return a specific challenge', async () => {
      const res = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(challengeId);
    });

    it('should return 404 for non-existent challenge', async () => {
      const res = await request(app)
        .get('/api/challenges/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/challenges/:id', () => {
    it('should update a challenge', async () => {
      const updates = {
        title: 'Complete React Tutorial - Updated',
        is_completed: true,
      };

      const res = await request(app)
        .put(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updates.title);
      expect(res.body.data.is_completed).toBe(true);
    });

    it('should mark challenge as complete', async () => {
      const res = await request(app)
        .put(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ is_completed: true });

      expect(res.status).toBe(200);
      expect(res.body.data.is_completed).toBe(true);
      expect(res.body.data.completion_date).toBeTruthy();
    });
  });

  describe('DELETE /api/challenges/:id', () => {
    it('should delete a challenge', async () => {
      const res = await request(app)
        .delete(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify challenge is deleted
      const getRes = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
