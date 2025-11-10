const challengeService = require('../../../src/services/challengeService');
const pool = require('../../../src/database/connection');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Mock dependencies
jest.mock('../../../src/database/connection');
jest.mock('@google/generative-ai');

describe('ChallengeService', () => {
  let mockQuery;
  let mockGenerateContent;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = jest.fn();
    pool.query = mockQuery;

    // Mock Gemini AI
    mockGenerateContent = jest.fn();
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    // Set environment variable
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'gemini-2.5-flash';
  });

  describe('getChallenges', () => {
    test('should generate challenges from user goals', async () => {
      const userId = 1;
      const mockGoals = [
        {
          id: 1,
          title: 'Learn React',
          description: 'Master React hooks and components',
          category: 'web-development',
          difficulty_level: 'medium',
          progress_percentage: 0
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockGoals });

      const mockAIResponse = {
        response: {
          text: () => `---CHALLENGE START---
Title: Build a Counter Component
Description: Create a React counter with hooks
Instructions: Use useState to manage counter state
Difficulty: medium
Category: web-development
EstimatedTime: 30
Points: 200
StarterCode: import React from 'react';
SuccessCriteria: Counter increments and decrements correctly
---CHALLENGE END---`
        }
      };

      mockGenerateContent.mockResolvedValueOnce(mockAIResponse);

      const challenges = await challengeService.getChallenges(userId);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, title, description'),
        [userId]
      );
      expect(challenges).toHaveLength(1);
      expect(challenges[0].title).toBe('Build a Counter Component');
      expect(challenges[0].goal_id).toBe(1);
    });

    test('should return empty array when no goals exist', async () => {
      const userId = 1;
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const challenges = await challengeService.getChallenges(userId);

      expect(challenges).toEqual([]);
    });

    test('should apply difficulty filter', async () => {
      const userId = 1;
      const mockGoals = [
        {
          id: 1,
          title: 'Learn React',
          description: 'Master React',
          category: 'web-development',
          difficulty_level: 'easy',
          progress_percentage: 0
        }
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockGoals });

      const mockAIResponse = {
        response: {
          text: () => `---CHALLENGE START---
Title: Easy Challenge
Description: Simple task
Instructions: Follow steps
Difficulty: easy
Category: web-development
EstimatedTime: 15
Points: 100
StarterCode: // code
SuccessCriteria: Complete task
---CHALLENGE END---

---CHALLENGE START---
Title: Hard Challenge
Description: Complex task
Instructions: Advanced steps
Difficulty: hard
Category: web-development
EstimatedTime: 60
Points: 300
StarterCode: // code
SuccessCriteria: Complete advanced task
---CHALLENGE END---`
        }
      };

      mockGenerateContent.mockResolvedValueOnce(mockAIResponse);

      const challenges = await challengeService.getChallenges(userId, { difficulty: 'easy' });

      expect(challenges).toHaveLength(1);
      expect(challenges[0].difficulty_level).toBe('easy');
    });
  });

  describe('getChallengeById', () => {
    test('should return specific challenge by ID', async () => {
      const userId = 1;
      const challengeId = '1-1';
      
      const mockGoal = {
        id: 1,
        title: 'Learn React',
        description: 'Master React',
        category: 'web-development',
        difficulty_level: 'medium',
        progress_percentage: 0
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockGoal] });

      const mockAIResponse = {
        response: {
          text: () => `---CHALLENGE START---
Title: Build Counter
Description: Create counter component
Instructions: Use useState hook
Difficulty: medium
Category: web-development
EstimatedTime: 30
Points: 200
StarterCode: import React from 'react';
SuccessCriteria: Counter works
---CHALLENGE END---`
        }
      };

      mockGenerateContent.mockResolvedValueOnce(mockAIResponse);

      const challenge = await challengeService.getChallengeById(challengeId, userId);

      expect(challenge.id).toBe('1-1');
      expect(challenge.title).toBe('Build Counter');
      expect(challenge.goal_id).toBe(1);
    });

    test('should throw error for invalid challenge ID', async () => {
      const userId = 1;
      const challengeId = 'invalid-id';

      await expect(challengeService.getChallengeById(challengeId, userId))
        .rejects
        .toThrow('Invalid challenge ID format');
    });

    test('should throw error when goal not found', async () => {
      const userId = 1;
      const challengeId = '99-1';

      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(challengeService.getChallengeById(challengeId, userId))
        .rejects
        .toThrow('Goal not found or already completed');
    });
  });

  describe('startChallenge', () => {
    test('should create submission for new challenge', async () => {
      const userId = 1;
      const challengeId = '1-1';

      const mockGoal = {
        id: 1,
        title: 'Learn React',
        description: 'Master React',
        category: 'web-development',
        difficulty_level: 'medium',
        progress_percentage: 0
      };

      const mockAIResponse = {
        response: {
          text: () => `---CHALLENGE START---
Title: Build Counter
Description: Create counter
Instructions: Use hooks
Difficulty: medium
Category: web-development
EstimatedTime: 30
Points: 200
StarterCode: // starter code
SuccessCriteria: Works correctly
---CHALLENGE END---`
        }
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockGoal] }) // Get goal
        .mockResolvedValueOnce({ rows: [] }) // Check existing submission
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Insert submission

      mockGenerateContent.mockResolvedValueOnce(mockAIResponse);

      const result = await challengeService.startChallenge(challengeId, userId);

      expect(result.message).toBe('Challenge started successfully');
      expect(result.submissionId).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO submissions'),
        expect.arrayContaining([challengeId, userId])
      );
    });

    test('should return existing submission if already started', async () => {
      const userId = 1;
      const challengeId = '1-1';

      const mockGoal = {
        id: 1,
        title: 'Learn React',
        description: 'Master React',
        category: 'web-development',
        difficulty_level: 'medium',
        progress_percentage: 0
      };

      const mockAIResponse = {
        response: {
          text: () => `---CHALLENGE START---
Title: Build Counter
Description: Create counter
Instructions: Use hooks
Difficulty: medium
Category: web-development
EstimatedTime: 30
Points: 200
StarterCode: // code
SuccessCriteria: Works
---CHALLENGE END---`
        }
      };

      mockQuery
        .mockResolvedValueOnce({ rows: [mockGoal] })
        .mockResolvedValueOnce({ rows: [{ id: 5, status: 'in_progress' }] });

      mockGenerateContent.mockResolvedValueOnce(mockAIResponse);

      const result = await challengeService.startChallenge(challengeId, userId);

      expect(result.message).toBe('Challenge already started');
      expect(result.submissionId).toBe(5);
      expect(result.status).toBe('in_progress');
    });
  });
});

module.exports = {};
