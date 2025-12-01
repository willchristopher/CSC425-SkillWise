/**
 * Jest Snapshot Tests for AI Service
 * Story 3.7: Tests run with sample prompts; snapshots pass
 */

describe('AI Service', () => {
  let aiService;
  let mockGenerateContent;

  beforeEach(() => {
    jest.resetModules();

    // Create mock function
    mockGenerateContent = jest.fn();

    // Mock the module before requiring aiService
    jest.doMock('@google/generative-ai', () => ({
      GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue({
          generateContent: mockGenerateContent,
        }),
      })),
    }));

    process.env.GEMINI_API_KEY = 'test-api-key';

    // Now require the service
    aiService = require('../../../src/services/aiService');
  });

  afterEach(() => {
    jest.resetModules();
  });

  describe('PROMPT_TEMPLATES', () => {
    it('should have all required prompt templates', () => {
      expect(aiService.PROMPT_TEMPLATES).toBeDefined();
      expect(aiService.PROMPT_TEMPLATES.GENERATE_CHALLENGE).toBeDefined();
      expect(aiService.PROMPT_TEMPLATES.SUBMIT_FEEDBACK).toBeDefined();
      expect(aiService.PROMPT_TEMPLATES.GENERATE_HINTS).toBeDefined();
    });

    it('should have system and user prompts in GENERATE_CHALLENGE template', () => {
      const template = aiService.PROMPT_TEMPLATES.GENERATE_CHALLENGE;
      expect(template.system).toBeDefined();
      expect(template.user).toBeDefined();
      expect(template.user).toContain('{{DIFFICULTY}}');
      expect(template.user).toContain('{{SKILL}}');
    });

    it('should have placeholders in SUBMIT_FEEDBACK template', () => {
      const template = aiService.PROMPT_TEMPLATES.SUBMIT_FEEDBACK;
      expect(template.system).toBeDefined();
      expect(template.user).toBeDefined();
      expect(template.user).toContain('{{CHALLENGE_TITLE}}');
      expect(template.user).toContain('{{CHALLENGE_DESCRIPTION}}');
      expect(template.user).toContain('{{SUBMISSION_TEXT}}');
    });

    it('should have placeholders in GENERATE_HINTS template', () => {
      const template = aiService.PROMPT_TEMPLATES.GENERATE_HINTS;
      expect(template.system).toBeDefined();
      expect(template.user).toBeDefined();
      expect(template.user).toContain('{{CHALLENGE_TITLE}}');
      expect(template.user).toContain('{{CHALLENGE_DESCRIPTION}}');
    });

    it('PROMPT_TEMPLATES structure should match snapshot', () => {
      expect(aiService.PROMPT_TEMPLATES).toMatchSnapshot();
    });
  });

  describe('generateChallenge', () => {
    const mockChallengeResponse = {
      title: 'Build a REST API',
      description: 'Create a RESTful API for a todo application.',
      difficulty: 'intermediate',
      category: 'backend',
      questions: [
        {
          type: 'mcq',
          question: 'What HTTP method is used to create resources?',
          options: ['GET', 'POST', 'PUT', 'DELETE'],
          correctAnswer: 1,
          explanation: 'POST is used to create new resources',
        },
      ],
      tips: ['Start with a simple server setup'],
      estimatedTime: '60 minutes',
    };

    it('should generate a challenge successfully', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockChallengeResponse),
        },
      });

      const result = await aiService.generateChallenge({
        category: 'programming',
        topic: 'REST APIs',
        difficulty: 'intermediate',
        questionTypes: ['mcq', 'short-answer'],
        numQuestions: 5,
      });

      expect(result).toBeDefined();
      expect(result.title).toBe('Build a REST API');
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('should include metadata in generated challenge', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockChallengeResponse),
        },
      });

      const result = await aiService.generateChallenge({
        category: 'programming',
        topic: 'REST APIs',
        difficulty: 'intermediate',
        questionTypes: ['mcq'],
        numQuestions: 3,
      });

      expect(result.generatedAt).toBeDefined();
      expect(result.questionTypes).toEqual(['mcq']);
      expect(result.categoryId).toBe('programming');
    });

    it('generated challenge response structure should match snapshot', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockChallengeResponse),
        },
      });

      const result = await aiService.generateChallenge({
        category: 'programming',
        topic: 'JavaScript basics',
        difficulty: 'beginner',
      });

      const { generatedAt, ...resultWithoutTimestamp } = result;
      expect(resultWithoutTimestamp).toMatchSnapshot();
      expect(generatedAt).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      mockGenerateContent.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        aiService.generateChallenge({
          category: 'programming',
          topic: 'JavaScript',
          difficulty: 'intermediate',
        })
      ).rejects.toThrow('AI generation failed');
    });
  });

  describe('submitForFeedback', () => {
    const mockFeedbackResponse = {
      score: 85,
      feedback: 'Great job!',
      strengths: ['Clean code structure'],
      improvements: ['Add comments'],
      nextSteps: ['Practice algorithms'],
    };

    it('should submit for feedback successfully', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockFeedbackResponse),
        },
      });

      const result = await aiService.submitForFeedback({
        challenge: { title: 'Test Challenge', description: 'Test desc' },
        submission: 'function test() { return true; }',
        questionType: 'code-challenge',
      });

      expect(result).toBeDefined();
      expect(result.score).toBe(85);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('feedback response structure should match snapshot', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockFeedbackResponse),
        },
      });

      const result = await aiService.submitForFeedback({
        challenge: {
          title: 'Array Manipulation',
          description: 'Find duplicates',
        },
        submission: 'function findDupes(arr) { return [...new Set(arr)]; }',
        questionType: 'code-challenge',
      });

      expect(result).toMatchSnapshot();
    });
  });

  describe('generateFeedback (legacy)', () => {
    const mockFeedback = {
      overall_score: 90,
      feedback_summary: 'Excellent work!',
      strengths: ['Efficient algorithm'],
      improvements: ['Add unit tests'],
    };

    it('should generate feedback for a submission', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockFeedback),
        },
      });

      const result = await aiService.generateFeedback('function test() {}', {
        title: 'Test Challenge',
        description: 'Test description',
      });

      expect(result).toBeDefined();
      expect(result.overall_score).toBe(90);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('generateFeedback response should match snapshot', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockFeedback),
        },
      });

      const result = await aiService.generateFeedback('function test() {}', {
        title: 'Test',
        description: 'Test desc',
      });

      const { generated_at, ...resultWithoutTimestamp } = result;
      expect(resultWithoutTimestamp).toMatchSnapshot();
      expect(generated_at).toBeDefined();
    });
  });

  describe('generateHints', () => {
    const mockHints = {
      hints: [
        { level: 1, hint: 'Think step by step' },
        { level: 2, hint: 'Consider using a hash map' },
        { level: 3, hint: 'Handle edge cases' },
      ],
    };

    it('should generate hints for a challenge', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockHints),
        },
      });

      const result = await aiService.generateHints(
        {
          title: 'Find Duplicates',
          description: 'Find all duplicates',
          difficulty: 'intermediate',
        },
        { attempts: 2 }
      );

      expect(result).toBeDefined();
      expect(result.hints).toHaveLength(3);
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it('generateHints response should match snapshot', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => JSON.stringify(mockHints),
        },
      });

      const result = await aiService.generateHints(
        {
          title: 'Find Duplicates',
          description: 'Find all duplicates',
          difficulty: 'intermediate',
        },
        { attempts: 2 }
      );

      expect(result).toMatchSnapshot();
    });
  });

  describe('validateAnswer', () => {
    it('should validate MCQ answers correctly', () => {
      const question = {
        type: 'mcq',
        correctAnswer: 2,
        options: ['A', 'B', 'C', 'D'],
        explanation: 'C is correct',
      };

      const correct = aiService.validateAnswer(question, 2);
      expect(correct.isCorrect).toBe(true);

      const incorrect = aiService.validateAnswer(question, 0);
      expect(incorrect.isCorrect).toBe(false);
    });

    it('should validate true-false answers correctly', () => {
      const question = {
        type: 'true-false',
        correctAnswer: true,
        explanation: 'This is true',
      };

      const correct = aiService.validateAnswer(question, true);
      expect(correct.isCorrect).toBe(true);

      const incorrect = aiService.validateAnswer(question, false);
      expect(incorrect.isCorrect).toBe(false);
    });

    it('should return null for non-auto-gradeable types', () => {
      const question = { type: 'long-response', prompt: 'Write an essay' };
      const result = aiService.validateAnswer(question, 'Some response');
      expect(result).toBeNull();
    });
  });

  describe('QUESTION_STRUCTURES', () => {
    it('should have all question type structures defined', () => {
      expect(aiService.QUESTION_STRUCTURES).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES.mcq).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES['fill-blank']).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES['true-false']).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES.matching).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES['short-answer']).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES['long-response']).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES['code-challenge']).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES.practical).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES.flashcard).toBeDefined();
      expect(aiService.QUESTION_STRUCTURES.ordering).toBeDefined();
    });
  });

  describe('API Response Formatting', () => {
    it('should handle malformed JSON responses by throwing error', async () => {
      mockGenerateContent.mockResolvedValueOnce({
        response: {
          text: () => 'This is not valid JSON',
        },
      });

      await expect(
        aiService.generateChallenge({
          category: 'programming',
          topic: 'JavaScript',
          difficulty: 'intermediate',
        })
      ).rejects.toThrow('AI generation failed');
    });
  });
});
