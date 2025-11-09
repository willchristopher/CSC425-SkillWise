const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/connection');

describe('Goals API Integration Tests', () => {
  let authToken;
  let userId;
  let goalId;

  beforeAll(async () => {
    // Create a test user and get auth token
    const signupResponse = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser_goals',
        email: 'testgoals@example.com',
        password: 'TestPassword123!',
        full_name: 'Test User'
      });

    if (signupResponse.status === 201) {
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testgoals@example.com',
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.accessToken;
      userId = loginResponse.body.user.id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await db.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await db.end();
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const newGoal = {
        title: 'Learn React Testing',
        description: 'Master Jest and React Testing Library',
        target_date: '2025-12-31',
        type: 'professional'
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newGoal)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(newGoal.title);
      expect(response.body.data.user_id).toBe(userId);

      goalId = response.body.data.id;
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Description without title'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .post('/api/goals')
        .send({
          title: 'Unauthorized Goal'
        })
        .expect(401);
    });
  });

  describe('GET /api/goals', () => {
    it('should return all goals for authenticated user', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/goals')
        .expect(401);
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should return a specific goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(goalId);
    });

    it('should return 404 if goal not found', async () => {
      const response = await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update a goal', async () => {
      const updateData = {
        title: 'Updated Goal Title',
        progress: 50
      };

      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
    });

    it('should return 404 if goal not found', async () => {
      await request(app)
        .put('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');
    });

    it('should return 404 if goal already deleted', async () => {
      await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

module.exports = {};