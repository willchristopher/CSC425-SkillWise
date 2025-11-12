// Integration test for complete goals and challenges workflow
const request = require('supertest');
const app = require('../../src/app');
const db = require('../../src/database/connection');

describe('Goals and Challenges Integration Workflow', () => {
  let authToken;
  let userId;
  let goalId;
  let challengeId;

  beforeAll(async () => {
    // Create a test user and authenticate
    const signupResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'workflow@test.com',
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!',
        firstName: 'Workflow',
        lastName: 'TestUser'
      });

    if (signupResponse.status === 201 || signupResponse.status === 400) {
      // Login even if user already exists
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'workflow@test.com',
          password: 'TestPassword123!'
        });

      authToken = loginResponse.body.data.accessToken;
      userId = loginResponse.body.data.user.id;
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (userId) {
      await db.query('DELETE FROM user_goal_challenges WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM goals WHERE user_id = $1', [userId]);
      await db.query('DELETE FROM challenges WHERE created_by = $1', [userId]);
      await db.query('DELETE FROM users WHERE id = $1', [userId]);
    }
  });

  describe('Complete Workflow: Create Goal → Add Challenge → Link Together → Mark Complete', () => {
    test('Step 1: Create a new goal', async () => {
      const response = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Learn React Testing',
          description: 'Master React testing with Jest and Cypress',
          target_date: '2025-12-31',
          type: 'professional',
          category: 'programming'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Learn React Testing');
      
      goalId = response.body.data.id;
    });

    test('Step 2: Verify goal appears in user\'s goal list', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            id: goalId,
            title: 'Learn React Testing'
          })
        ])
      );
    });

    test('Step 3: Create a challenge', async () => {
      const response = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Build a Todo App with Tests',
          description: 'Create a React todo application with full test coverage',
          difficulty: 'medium',
          subject: 'React',
          category: 'programming',
          points: 50,
          type: 'project',
          goal_id: goalId
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      
      challengeId = response.body.data.id;
    });

    test('Step 4: View challenge details', async () => {
      const response = await request(app)
        .get(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.title).toBe('Build a Todo App with Tests');
      expect(response.body.data.goal_id).toBe(goalId);
    });

    test('Step 5: View goal with progress (0% initially)', async () => {
      const response = await request(app)
        .get(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.progress_percentage).toBe(0);
    });

    test('Step 6: Update goal progress to 50%', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          progress_percentage: 50
        });

      expect(response.status).toBe(200);
      expect(response.body.data.progress_percentage).toBe(50);
    });

    test('Step 7: Update goal progress to 100% (complete)', async () => {
      const response = await request(app)
        .put(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          progress_percentage: 100,
          is_completed: true
        });

      expect(response.status).toBe(200);
      expect(response.body.data.progress_percentage).toBe(100);
      expect(response.body.data.is_completed).toBe(true);
    });

    test('Step 8: Verify completed goal shows correctly', async () => {
      const response = await request(app)
        .get('/api/goals')
        .set('Authorization', `Bearer ${authToken}`);

      const completedGoal = response.body.data.find(g => g.id === goalId);
      expect(completedGoal.is_completed).toBe(true);
      expect(completedGoal.progress_percentage).toBe(100);
    });

    test('Step 9: Delete the challenge', async () => {
      const response = await request(app)
        .delete(`/api/challenges/${challengeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Step 10: Delete the goal', async () => {
      const response = await request(app)
        .delete(`/api/goals/${goalId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Verify CRUD operations work correctly', () => {
    test('Goals CRUD is fully functional', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'CRUD Test Goal',
          description: 'Testing CRUD operations',
          target_date: '2025-12-31'
        });
      expect(createResponse.status).toBe(201);
      const testGoalId = createResponse.body.data.id;

      // READ
      const readResponse = await request(app)
        .get(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(readResponse.status).toBe(200);

      // UPDATE
      const updateResponse = await request(app)
        .put(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated CRUD Test Goal' });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.title).toBe('Updated CRUD Test Goal');

      // DELETE
      const deleteResponse = await request(app)
        .delete(`/api/goals/${testGoalId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(deleteResponse.status).toBe(200);
    });

    test('Challenges CRUD is fully functional', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/challenges')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'CRUD Test Challenge',
          description: 'Testing CRUD operations for challenges',
          difficulty: 'easy'
        });
      expect(createResponse.status).toBe(201);
      const testChallengeId = createResponse.body.data.id;

      // READ
      const readResponse = await request(app)
        .get(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(readResponse.status).toBe(200);

      // UPDATE
      const updateResponse = await request(app)
        .put(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated CRUD Test Challenge' });
      expect(updateResponse.status).toBe(200);

      // DELETE
      const deleteResponse = await request(app)
        .delete(`/api/challenges/${testChallengeId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(deleteResponse.status).toBe(200);
    });
  });
});

module.exports = {};
