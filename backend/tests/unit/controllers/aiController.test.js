/**
 * Jest Unit Tests for AI Controller
 * Story 3.7: Tests for AI endpoints
 */

const aiController = require('../../../src/controllers/aiController');
const aiService = require('../../../src/services/aiService');

// Mock dependencies
jest.mock('../../../src/services/aiService');
jest.mock('../../../src/database/connection', () => ({
  query: jest.fn(),
}));

const db = require('../../../src/database/connection');

describe('AI Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 1, username: 'testuser' },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    mockNext = jest.fn();
  });

  describe('generateChallenge', () => {
    it('should generate a challenge successfully', async () => {
      const mockChallenge = {
        title: 'Test Challenge',
        description: 'A test challenge description',
        difficulty_level: 'intermediate',
        requirements: ['req1', 'req2'],
        hints: ['hint1'],
        generated_at: new Date().toISOString(),
        generated_by_ai: true,
      };

      aiService.generateChallenge.mockResolvedValueOnce(mockChallenge);

      mockReq.body = {
        skill: 'javascript',
        difficulty: 'intermediate',
        category: 'backend',
      };

      await aiController.generateChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Object),
        })
      );
    });

    it('should use default values if parameters not provided', async () => {
      const mockChallenge = {
        title: 'Default Challenge',
        generated_at: new Date().toISOString(),
      };

      aiService.generateChallenge.mockResolvedValueOnce(mockChallenge);

      mockReq.body = {};

      await aiController.generateChallenge(mockReq, mockRes, mockNext);

      expect(aiService.generateChallenge).toHaveBeenCalledWith({
        skill: 'JavaScript',
        difficulty: 'medium',
        category: 'Programming',
        topic: 'General',
      });
    });

    it('should handle AI service errors', async () => {
      aiService.generateChallenge.mockRejectedValueOnce(new Error('AI Error'));

      mockReq.body = {
        skill: 'javascript',
        difficulty: 'intermediate',
      };

      await aiController.generateChallenge(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('response structure should match snapshot', async () => {
      const mockChallenge = {
        title: 'Build a REST API',
        description: 'Create a RESTful API',
        difficulty_level: 'intermediate',
        requirements: ['CRUD operations', 'Error handling'],
        hints: ['Use Express'],
        estimated_time_minutes: 60,
        generated_at: '2024-01-01T00:00:00.000Z',
        generated_by_ai: true,
      };

      aiService.generateChallenge.mockResolvedValueOnce(mockChallenge);

      mockReq.body = {
        skill: 'javascript',
        difficulty: 'intermediate',
      };

      await aiController.generateChallenge(mockReq, mockRes, mockNext);

      expect(mockRes.json.mock.calls[0][0]).toMatchSnapshot();
    });
  });

  describe('submitForFeedback', () => {
    it('should return 400 if submissionText is missing', async () => {
      mockReq.body = {
        challengeContext: { title: 'Test' },
      };

      await aiController.submitForFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: 'submissionText is required',
        })
      );
    });

    it('should return 400 if challengeContext is missing', async () => {
      mockReq.body = {
        submissionText: 'function test() {}',
      };

      await aiController.submitForFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
        })
      );
    });

    it('should submit for feedback successfully without saving to DB', async () => {
      const mockFeedback = {
        overall_score: 85,
        strengths: ['Good structure'],
        improvements: ['Add comments'],
        feedback_summary: 'Well done!',
      };

      aiService.submitForFeedback.mockResolvedValueOnce(mockFeedback);

      mockReq.body = {
        submissionText: 'function test() { return true; }',
        challengeContext: {
          title: 'Test Challenge',
          description: 'Test description',
        },
        // No submissionId - so no DB save
      };

      await aiController.submitForFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            feedback: expect.any(Object),
          }),
        })
      );
    });

    it('should save feedback to database when submissionId provided (Story 3.5)', async () => {
      const mockFeedback = {
        overall_score: 90,
        feedback_summary: 'Excellent!',
        strengths: ['Good'],
        improvements: ['Better'],
        suggestions: ['Try this'],
      };

      aiService.submitForFeedback.mockResolvedValueOnce(mockFeedback);

      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, submission_id: 123 }],
      });

      mockReq.body = {
        submissionId: 123,
        submissionText: 'function test() {}',
        challengeContext: { title: 'Test', description: 'Test desc' },
      };

      await aiController.submitForFeedback(mockReq, mockRes, mockNext);

      // Verify database was called with prompt and response
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO ai_feedback'),
        expect.any(Array)
      );
    });
  });

  describe('generateFeedback', () => {
    it('should return 400 if submissionText is missing', async () => {
      mockReq.body = {
        challengeContext: { title: 'Test' },
      };

      await aiController.generateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should generate feedback for a submission', async () => {
      const mockFeedback = {
        feedback: { score: 80, comments: 'Good job' },
        overall_score: 80,
      };

      aiService.generateFeedback.mockResolvedValueOnce(mockFeedback);

      mockReq.body = {
        submissionText: 'console.log("hello")',
        challengeContext: { title: 'Test', description: 'Test desc' },
      };

      await aiController.generateFeedback(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
        })
      );
    });
  });

  describe('getHints', () => {
    it('should return 400 if challenge details are missing', async () => {
      // Controller checks for challenge in body, not challengeId
      mockReq.params = { challengeId: '1' };
      mockReq.query = {};
      mockReq.body = {}; // Missing challenge object

      await aiController.getHints(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Challenge details'),
        })
      );
    });

    it('should generate hints for a challenge', async () => {
      const mockHints = {
        hints: [
          { level: 1, hint: 'Think step by step' },
          { level: 2, hint: 'Consider data structures' },
        ],
      };

      aiService.generateHints.mockResolvedValueOnce(mockHints);

      mockReq.params = { challengeId: '1' };
      mockReq.query = { attempts: '0' };
      mockReq.body = {
        challenge: {
          title: 'Test Challenge',
          description: 'Test description',
          difficulty: 'beginner',
        },
      };

      await aiController.getHints(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            challengeId: '1',
            hints: expect.any(Object),
          }),
        })
      );
    });
  });
});
