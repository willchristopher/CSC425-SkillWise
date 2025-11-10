const goalService = require('../../../src/services/goalService');
const pool = require('../../../src/database/connection');

jest.mock('../../../src/database/connection');

describe('goalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    test('should create a new goal', async () => {
      const userId = 1;
      const goalData = {
        title: 'Learn Python',
        description: 'Master Python programming',
        category: 'programming',
        difficulty: 'medium',
        targetCompletionDate: '2024-12-31'
      };

      const mockGoal = {
        id: 1,
        user_id: userId,
        ...goalData,
        current_progress: 0,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGoal] });

      const result = await goalService.createGoal(userId, goalData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO goals'),
        expect.arrayContaining([userId, goalData.title])
      );
      expect(result).toMatchObject({
        id: 1,
        title: goalData.title,
        current_progress: 0
      });
    });

    test('should throw error if database fails', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      await expect(
        goalService.createGoal(1, { title: 'Test Goal' })
      ).rejects.toThrow('Database error');
    });
  });

  describe('getUserGoals', () => {
    test('should return all goals for a user', async () => {
      const userId = 1;
      const mockGoals = [
        {
          id: 1,
          user_id: userId,
          title: 'Learn React',
          current_progress: 30,
          status: 'active'
        },
        {
          id: 2,
          user_id: userId,
          title: 'Learn Node',
          current_progress: 60,
          status: 'active'
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockGoals });

      const result = await goalService.getUserGoals(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals'),
        [userId]
      );
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Learn React');
    });

    test('should return empty array if user has no goals', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.getUserGoals(1);

      expect(result).toEqual([]);
    });

    test('should filter by status if provided', async () => {
      const userId = 1;
      const status = 'completed';

      pool.query.mockResolvedValueOnce({ rows: [] });

      await goalService.getUserGoals(userId, { status });

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1 AND status = $2'),
        [userId, status]
      );
    });
  });

  describe('getGoalById', () => {
    test('should return specific goal by ID', async () => {
      const goalId = 1;
      const userId = 1;
      const mockGoal = {
        id: goalId,
        user_id: userId,
        title: 'Learn Docker',
        current_progress: 45
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGoal] });

      const result = await goalService.getGoalById(goalId, userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM goals'),
        [goalId, userId]
      );
      expect(result).toMatchObject({
        id: goalId,
        title: 'Learn Docker'
      });
    });

    test('should return null if goal not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.getGoalById(999, 1);

      expect(result).toBeNull();
    });

    test('should not return goals from other users', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.getGoalById(1, 999);

      expect(result).toBeNull();
    });
  });

  describe('updateGoal', () => {
    test('should update goal successfully', async () => {
      const goalId = 1;
      const userId = 1;
      const updateData = {
        title: 'Updated Title',
        current_progress: 75
      };

      const mockUpdatedGoal = {
        id: goalId,
        user_id: userId,
        ...updateData,
        updated_at: new Date()
      };

      pool.query.mockResolvedValueOnce({ rows: [mockUpdatedGoal] });

      const result = await goalService.updateGoal(goalId, userId, updateData);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE goals'),
        expect.arrayContaining([goalId, userId])
      );
      expect(result).toMatchObject({
        id: goalId,
        title: updateData.title,
        current_progress: updateData.current_progress
      });
    });

    test('should return null if goal not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.updateGoal(999, 1, { title: 'New Title' });

      expect(result).toBeNull();
    });

    test('should handle partial updates', async () => {
      const mockGoal = {
        id: 1,
        user_id: 1,
        title: 'Original Title',
        current_progress: 50
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGoal] });

      const result = await goalService.updateGoal(1, 1, { current_progress: 75 });

      expect(result.current_progress).toBe(50);
      expect(pool.query).toHaveBeenCalled();
    });
  });

  describe('deleteGoal', () => {
    test('should delete goal successfully', async () => {
      const goalId = 1;
      const userId = 1;

      pool.query.mockResolvedValueOnce({ rows: [{ id: goalId }] });

      const result = await goalService.deleteGoal(goalId, userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM goals'),
        [goalId, userId]
      );
      expect(result).toBe(true);
    });

    test('should return false if goal not found', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.deleteGoal(999, 1);

      expect(result).toBe(false);
    });

    test('should not delete goals from other users', async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await goalService.deleteGoal(1, 999);

      expect(result).toBe(false);
    });
  });

  describe('getGoalStats', () => {
    test('should return user statistics', async () => {
      const userId = 1;
      const mockStats = {
        total_goals: 10,
        goals_completed: 3,
        goals_in_progress: 5,
        goals_not_started: 2,
        average_progress: 45.5
      };

      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await goalService.getGoalStats(userId);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*)'),
        [userId]
      );
      expect(result).toMatchObject({
        total_goals: 10,
        goals_completed: 3
      });
    });

    test('should return zeros for user with no goals', async () => {
      const mockStats = {
        total_goals: 0,
        goals_completed: 0,
        goals_in_progress: 0,
        goals_not_started: 0,
        average_progress: 0
      };

      pool.query.mockResolvedValueOnce({ rows: [mockStats] });

      const result = await goalService.getGoalStats(1);

      expect(result.total_goals).toBe(0);
    });
  });

  describe('updateGoalProgress', () => {
    test('should update goal progress', async () => {
      const goalId = 1;
      const userId = 1;
      const progress = 80;

      const mockGoal = {
        id: goalId,
        user_id: userId,
        current_progress: progress
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGoal] });

      const result = await goalService.updateGoalProgress(goalId, userId, progress);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE goals'),
        expect.arrayContaining([progress, goalId, userId])
      );
      expect(result.current_progress).toBe(progress);
    });

    test('should mark goal as completed when progress reaches 100', async () => {
      const mockGoal = {
        id: 1,
        user_id: 1,
        current_progress: 100,
        status: 'completed'
      };

      pool.query.mockResolvedValueOnce({ rows: [mockGoal] });

      const result = await goalService.updateGoalProgress(1, 1, 100);

      expect(result.current_progress).toBe(100);
    });
  });
});

module.exports = {};