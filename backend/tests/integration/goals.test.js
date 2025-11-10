const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/connection');

describe('Goals API Integration Tests', () => {
  let authToken;
  let userId;
  let goalId;

  beforeAll(async () => {
    // Create test user and get auth token
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
  });

  afterAll(async () => {
    // Cleanup: Delete test user
    if (userId) {
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await db.end();
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'Learn Node.js',
        description: 'Master backend development with Node.js and Express',
        target_completion_date: '2025-12-31',
        category: 'programming',
      };

      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(goalData.title);
      expect(res.body.data.user_id).toBe(userId);

      goalId = res.body.data.id;
    });

    it('should fail without authentication', async () => {
      const res = await request(app)
        .post('/api/goals')
        .send({
          title: 'Test Goal',
          description: 'Test description',
        });

      expect(res.status).toBe(401);
    });

    it('should fail with invalid data', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test',
          // Missing description and target_date
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/goals', () => {
    it('should return all user goals', async () => {
      const res = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should filter goals by completion status', async () => {
      const res = await request(app)
        .get('/api/goals?is_completed=false')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should return a specific goal', async () => {
      const res = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(goalId);
    });

    it('should return 404 for non-existent goal', async () => {
      const res = await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update a goal', async () => {
      const updates = {
        title: 'Learn Node.js - Updated',
        is_completed: true,
      };

      const res = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updates);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(updates.title);
      expect(res.body.data.is_completed).toBe(true);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal', async () => {
      const res = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify goal is deleted
      const getRes = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    });
  });
});
