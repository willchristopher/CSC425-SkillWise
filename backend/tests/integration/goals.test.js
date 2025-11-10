const request = require('supertest');
const app = require('../../src/app');
const pool = require('../../src/database/connection');

describe('Goals API Integration', () => {
  let authToken;
  let userId;
  let goalId;

  beforeAll(async () => {
    // Register and login a test user
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: `test-goals-${Date.now()}@example.com`,
        password: 'TestPassword123',
        confirmPassword: 'TestPassword123',
        firstName: 'Test',
        lastName: 'User'
      });

    userId = registerRes.body.data.user.id;
    authToken = registerRes.body.data.accessToken;
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await pool.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    }
    await pool.end();
  });

  describe('POST /api/goals', () => {
    test('should create new goal', async () => {
      const goalData = {
        title: 'Learn React Hooks',
        description: 'Master useState, useEffect, and custom hooks',
        category: 'web-development',
        difficulty: 'medium',
        targetCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(goalData)
        .expect(201);

      expect(response.body.title).toBe(goalData.title);
      expect(response.body.description).toBe(goalData.description);
      expect(response.body.difficulty).toBe(goalData.difficulty);
      expect(response.body.currentProgress).toBe(0);
      
      goalId = response.body.id;
    });

    test('should require authentication', async () => {
      await request(app)
        .post('/api/goals')
        .send({ title: 'Test Goal' })
        .expect(401);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({}) // Missing required title
        .expect(400);

      expect(response.body.message).toContain('title');
    });
  });

  describe('GET /api/goals', () => {
    test('should return user goals', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      const goal = response.body[0];
      expect(goal).toHaveProperty('id');
      expect(goal).toHaveProperty('title');
      expect(goal).toHaveProperty('difficulty');
    });

    test('should require authentication', async () => {
      await request(app)
        .get('/api/goals')
        .expect(401);
    });
  });

  describe('GET /api/goals/:id', () => {
    test('should return specific goal', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(goalId);
      expect(response.body).toHaveProperty('title');
      expect(response.body).toHaveProperty('currentProgress');
    });

    test('should return 404 for non-existent goal', async () => {
      await request(app)
        .get('/api/goals/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/goals/:id', () => {
    test('should update existing goal', async () => {
      const updateData = {
        title: 'Master React Hooks (Updated)',
        currentProgress: 50
      };

      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.currentProgress).toBe(updateData.currentProgress);
    });

    test('should not allow updating other users goals', async () => {
      // Create another user
      const otherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: `test-other-${Date.now()}@example.com`,
          password: 'TestPassword123',
          confirmPassword: 'TestPassword123',
          firstName: 'Other',
          lastName: 'User'
        });

      const otherToken = otherUserRes.body.data.accessToken;
      const otherUserId = otherUserRes.body.data.user.id;

      // Try to update first user's goal with second user's token
      await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked Goal' })
        .expect(404);

      // Clean up
      await pool.query('DELETE FROM users WHERE id = $1', [otherUserId]);
    });
  });

  describe('DELETE /api/goals/:id', () => {
    test('should delete existing goal', async () => {
      // Create a goal to delete
      const createRes = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Goal to Delete',
          difficulty: 'easy'
        })
        .expect(201);

      const deleteGoalId = createRes.body.id;

      await request(app)
        .delete(`/api/goals/${deleteGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify it's deleted
      await request(app)
        .get(`/api/goals/${deleteGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/goals/stats', () => {
    test('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/goals/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalGoals');
      expect(response.body).toHaveProperty('goalsCompleted');
      expect(response.body).toHaveProperty('goalsInProgress');
      expect(typeof response.body.totalGoals).toBe('number');
    });
  });
});

module.exports = {};