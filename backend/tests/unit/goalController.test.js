const goalController = require('../../src/controllers/goalController');
const Goal = require('../../src/models/Goal');
const goalService = require('../../src/services/goalService');

// Mock the Goal model and goalService
jest.mock('../../src/models/Goal');
jest.mock('../../src/services/goalService');

describe('Goal Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request object
    mockReq = {
      user: { userId: 1 },
      params: {},
      body: {},
      query: {}
    };

    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    // Mock next function
    mockNext = jest.fn();
  });

  describe('getGoals', () => {
    it('should return all goals for authenticated user', async () => {
      const mockGoals = [
        { id: 1, title: 'Learn React', user_id: 1, progress_percentage: 50 },
        { id: 2, title: 'Master Node.js', user_id: 1, progress_percentage: 30 }
      ];

      goalService.getUserGoals.mockResolvedValue(mockGoals);

      await goalController.getGoals(mockReq, mockRes, mockNext);

      expect(goalService.getUserGoals).toHaveBeenCalledWith(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockGoals,
        count: 2
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      goalService.getUserGoals.mockRejectedValue(error);

      await goalController.getGoals(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getGoalById', () => {
    it('should return a specific goal', async () => {
      const mockGoal = { id: 1, title: 'Learn React', user_id: 1 };
      mockReq.params.id = '1';

      Goal.findById.mockResolvedValue(mockGoal);

      await goalController.getGoalById(mockReq, mockRes, mockNext);

      expect(Goal.findById).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockGoal
      });
    });

    it('should return 404 if goal not found', async () => {
      mockReq.params.id = '999';
      Goal.findById.mockResolvedValue(null);

      await goalController.getGoalById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Goal not found'
      });
    });

    it('should return 403 if goal belongs to another user', async () => {
      const mockGoal = { id: 1, title: 'Learn React', user_id: 2 }; // Different user
      mockReq.params.id = '1';

      Goal.findById.mockResolvedValue(mockGoal);

      await goalController.getGoalById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to access this goal'
      });
    });
  });

  describe('createGoal', () => {
    it('should create a new goal', async () => {
      const goalData = {
        title: 'Learn GraphQL',
        description: 'Master GraphQL APIs',
        target_date: '2025-12-31',
        type: 'professional'
      };

      const mockCreatedGoal = {
        id: 1,
        ...goalData,
        user_id: 1,
        created_at: new Date()
      };

      mockReq.body = goalData;
      Goal.create.mockResolvedValue(mockCreatedGoal);

      await goalController.createGoal(mockReq, mockRes, mockNext);

      expect(Goal.create).toHaveBeenCalledWith({
        ...goalData,
        user_id: 1
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Goal created successfully',
        data: mockCreatedGoal
      });
    });

    it('should return 400 if title is missing', async () => {
      mockReq.body = {
        description: 'A description without title'
      };

      await goalController.createGoal(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Title is required'
      });
    });
  });

  describe('updateGoal', () => {
    it('should update an existing goal', async () => {
      const existingGoal = { id: 1, title: 'Learn React', user_id: 1 };
      const updateData = { title: 'Master React', progress: 75 };
      const updatedGoal = { ...existingGoal, ...updateData };

      mockReq.params.id = '1';
      mockReq.body = updateData;

      Goal.findById.mockResolvedValue(existingGoal);
      Goal.update.mockResolvedValue(updatedGoal);

      await goalController.updateGoal(mockReq, mockRes, mockNext);

      expect(Goal.findById).toHaveBeenCalledWith('1');
      expect(Goal.update).toHaveBeenCalledWith('1', updateData);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Goal updated successfully',
        data: updatedGoal
      });
    });

    it('should return 404 if goal not found', async () => {
      mockReq.params.id = '999';
      mockReq.body = { title: 'Updated Title' };

      Goal.findById.mockResolvedValue(null);

      await goalController.updateGoal(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Goal not found'
      });
    });
  });

  describe('deleteGoal', () => {
    it('should delete a goal', async () => {
      const existingGoal = { id: 1, title: 'Learn React', user_id: 1 };
      mockReq.params.id = '1';

      Goal.findById.mockResolvedValue(existingGoal);
      Goal.delete.mockResolvedValue(existingGoal);

      await goalController.deleteGoal(mockReq, mockRes, mockNext);

      expect(Goal.findById).toHaveBeenCalledWith('1');
      expect(Goal.delete).toHaveBeenCalledWith('1');
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Goal deleted successfully'
      });
    });

    it('should return 403 if trying to delete another users goal', async () => {
      const existingGoal = { id: 1, title: 'Learn React', user_id: 2 }; // Different user
      mockReq.params.id = '1';

      Goal.findById.mockResolvedValue(existingGoal);

      await goalController.deleteGoal(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: 'Not authorized to delete this goal'
      });
      expect(Goal.delete).not.toHaveBeenCalled();
    });
  });
});
