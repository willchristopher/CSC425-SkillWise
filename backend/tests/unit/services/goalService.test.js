// Implement goal service unit tests
const goalService = require('../../../src/services/goalService');
const Goal = require('../../../src/models/Goal');
const db = require('../../../src/database/connection');

// Mock the dependencies
jest.mock('../../../src/models/Goal');
jest.mock('../../../src/database/connection');

describe('GoalService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createGoal', () => {
    test('should create goal with valid data', async () => {
      const goalData = {
        title: 'Test Goal',
        description: 'Test Description',
        target_date: '2025-12-31'
      };
      const userId = 1;
      const mockGoal = { id: 1, ...goalData, user_id: userId };

      Goal.create.mockResolvedValue(mockGoal);

      const result = await goalService.createGoal(goalData, userId);

      expect(result).toEqual(mockGoal);
      expect(Goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: goalData.title,
          description: goalData.description,
          user_id: userId,
          progress_percentage: 0,
          is_completed: false
        })
      );
    });

    test('should throw error if title is missing', async () => {
      const goalData = { description: 'Test Description' };
      const userId = 1;

      await expect(goalService.createGoal(goalData, userId)).rejects.toThrow();
    });
  });

  describe('getUserGoals', () => {
    test('should get goals with calculated progress', async () => {
      const userId = 1;
      const mockGoals = [
        { id: 1, title: 'Goal 1', user_id: userId },
        { id: 2, title: 'Goal 2', user_id: userId }
      ];

      Goal.findByUserId.mockResolvedValue(mockGoals);
      db.query.mockResolvedValue({
        rows: [{ total: '5', completed: '2' }]
      });

      const result = await goalService.getUserGoals(userId);

      expect(result).toHaveLength(2);
      expect(Goal.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe('calculateCompletion', () => {
    test('should calculate correct completion percentage', async () => {
      const goalId = 1;
      db.query.mockResolvedValue({
        rows: [{ total: '5', completed: '3' }]
      });

      const result = await goalService.calculateCompletion(goalId);

      expect(result).toBe(60);
    });

    test('should return 0 if no challenges', async () => {
      const goalId = 1;
      db.query.mockResolvedValue({
        rows: [{ total: '0', completed: '0' }]
      });

      const result = await goalService.calculateCompletion(goalId);

      expect(result).toBe(0);
    });
  });

  describe('updateProgress', () => {
    test('should update progress and mark complete if 100%', async () => {
      const goalId = 1;
      const progress = 100;
      const mockGoal = { id: goalId, progress_percentage: 0 };
      const updatedGoal = { id: goalId, progress_percentage: 100, is_completed: true };

      Goal.findById.mockResolvedValue(mockGoal);
      Goal.update.mockResolvedValue(updatedGoal);

      const result = await goalService.updateProgress(goalId, progress);

      expect(result.is_completed).toBe(true);
      expect(Goal.update).toHaveBeenCalledWith(
        goalId,
        expect.objectContaining({
          progress_percentage: 100,
          is_completed: true
        })
      );
    });
  });
});

module.exports = {};