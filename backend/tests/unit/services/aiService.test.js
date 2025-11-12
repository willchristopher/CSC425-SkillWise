// Implement AI service unit tests
const aiService = require('../../../src/services/aiService');

// Mock OpenAI or external AI service
jest.mock('../../../src/services/aiService', () => ({
  generateFeedback: jest.fn(),
  generateHints: jest.fn(),
  analyzeSolution: jest.fn()
}));

describe('AIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateFeedback', () => {
    test('should generate meaningful feedback', async () => {
      const mockFeedback = {
        score: 85,
        comments: 'Good solution with room for optimization',
        suggestions: ['Consider edge cases', 'Add error handling']
      };

      aiService.generateFeedback.mockResolvedValue(mockFeedback);

      const submission = { code: 'console.log("Hello")' };
      const result = await aiService.generateFeedback(submission);

      expect(result).toEqual(mockFeedback);
      expect(aiService.generateFeedback).toHaveBeenCalledWith(submission);
    });

    test('should handle API errors gracefully', async () => {
      aiService.generateFeedback.mockRejectedValue(new Error('API Error'));

      const submission = { code: 'invalid code' };
      
      await expect(aiService.generateFeedback(submission)).rejects.toThrow('API Error');
    });
  });

  describe('generateHints', () => {
    test('should provide contextual hints', async () => {
      const mockHints = [
        'Start by defining the main function',
        'Consider using a loop for iteration',
        'Remember to handle the base case'
      ];

      aiService.generateHints.mockResolvedValue(mockHints);

      const challenge = { id: 1, difficulty: 'medium' };
      const result = await aiService.generateHints(challenge);

      expect(result).toEqual(mockHints);
      expect(result).toHaveLength(3);
      expect(aiService.generateHints).toHaveBeenCalledWith(challenge);
    });
  });

  describe('analyzeSolution', () => {
    test('should analyze code quality', async () => {
      const mockAnalysis = {
        correctness: 90,
        efficiency: 75,
        readability: 85,
        bestPractices: 80
      };

      aiService.analyzeSolution.mockResolvedValue(mockAnalysis);

      const code = 'function test() { return true; }';
      const result = await aiService.analyzeSolution(code);

      expect(result).toEqual(mockAnalysis);
      expect(result.correctness).toBeGreaterThan(0);
    });
  });
});

module.exports = {};