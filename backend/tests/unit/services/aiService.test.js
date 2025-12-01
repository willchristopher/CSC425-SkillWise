/**
 * Jest Snapshot Tests for AI Service
 * Story 3.7: Tests run with sample prompts; snapshots pass
 */

const aiService = require('../../../src/services/aiService');

// Mock axios to prevent real API calls
jest.mock('axios', () => ({
  post: jest.fn(),
}));

const axios = require('axios');

describe('AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up environment variable for tests
    process.env.GEMINI_API_KEY = 'test-api-key';
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
      description:
        'Create a RESTful API for a todo application using Node.js and Express.',
      difficulty_level: 'intermediate',
      category: 'backend',
      requirements: [
        'Implement CRUD operations',
        'Use proper HTTP methods',
        'Add input validation',
        'Handle errors gracefully',
      ],
      hints: [
        'Start with a simple server setup',
        'Use middleware for common operations',
      ],
      estimated_time_minutes: 120,
    };

    it('should generate a challenge successfully', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockChallengeResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.generateChallenge({
        skill: 'javascript',
        difficulty: 'intermediate',
        category: 'backend',
        topic: 'REST APIs',
      });

      expect(result).toBeDefined();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should use correct parameters in API call', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockChallengeResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      await aiService.generateChallenge({
        skill: 'python',
        difficulty: 'beginner',
        category: 'algorithms',
        topic: 'sorting',
      });

      const callArgs = axios.post.mock.calls[0];
      const requestBody = callArgs[1];
      const prompt = requestBody.contents[0].parts[0].text;

      expect(prompt).toContain('python');
      expect(prompt).toContain('beginner');
    });

    it('generated challenge response structure should match snapshot', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockChallengeResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.generateChallenge({
        skill: 'javascript',
        difficulty: 'intermediate',
      });
      // Remove timestamp for snapshot comparison (timestamps change each run)
      const { generated_at, ...resultWithoutTimestamp } = result;
      expect(resultWithoutTimestamp).toMatchSnapshot();
      expect(generated_at).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        aiService.generateChallenge({
          skill: 'javascript',
          difficulty: 'intermediate',
        })
      ).rejects.toThrow();
    });
  });

  describe('submitForFeedback', () => {
    const mockFeedbackResponse = {
      overall_score: 85,
      strengths: [
        'Clean code structure',
        'Good variable naming',
        'Proper error handling',
      ],
      improvements: [
        'Consider adding more comments',
        'Could optimize the loop performance',
      ],
      suggestions: [
        'Try using array methods like map() and filter()',
        'Consider edge cases in your validation',
      ],
      feedback_summary:
        'Great job! Your solution demonstrates a solid understanding.',
      next_steps: ['Practice more algorithms', 'Learn about time complexity'],
    };

    const mockChallengeContext = {
      title: 'Array Manipulation',
      description: 'Write a function to find duplicates in an array',
    };

    const mockSubmissionText =
      'function findDuplicates(arr) { return arr.filter((item, index) => arr.indexOf(item) !== index); }';

    it('should submit for feedback successfully', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFeedbackResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      // Note: submitForFeedback takes (submissionText, challengeContext)
      const result = await aiService.submitForFeedback(
        mockSubmissionText,
        mockChallengeContext
      );

      expect(result).toBeDefined();
      expect(axios.post).toHaveBeenCalled();
    });

    it('should include challenge context in the prompt', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFeedbackResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      await aiService.submitForFeedback(
        mockSubmissionText,
        mockChallengeContext
      );

      const callArgs = axios.post.mock.calls[0];
      const requestBody = callArgs[1];
      const prompt = requestBody.contents[0].parts[0].text;

      expect(prompt).toContain(mockChallengeContext.title);
      expect(prompt).toContain(mockChallengeContext.description);
      expect(prompt).toContain(mockSubmissionText);
    });

    it('feedback response structure should match snapshot', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFeedbackResponse),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.submitForFeedback(
        mockSubmissionText,
        mockChallengeContext
      );
      // Remove timestamp for snapshot comparison (timestamps change each run)
      const { generated_at, ...resultWithoutTimestamp } = result;
      expect(resultWithoutTimestamp).toMatchSnapshot();
      expect(generated_at).toBeDefined();
    });

    it('should handle API errors gracefully', async () => {
      axios.post.mockRejectedValueOnce(new Error('API Error'));

      await expect(
        aiService.submitForFeedback(mockSubmissionText, mockChallengeContext)
      ).rejects.toThrow();
    });
  });

  describe('generateFeedback', () => {
    const mockFeedback = {
      overall_score: 90,
      feedback_summary: 'Excellent work on this solution!',
      strengths: ['Efficient algorithm', 'Good code organization'],
      improvements: ['Add unit tests', 'Consider edge cases'],
    };

    it('should generate feedback for a submission', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFeedback),
                  },
                ],
              },
            },
          ],
        },
      });

      // generateFeedback wraps submitForFeedback with (submissionText, challengeContext)
      const result = await aiService.generateFeedback('function test() {}', {
        title: 'Test',
        description: 'Test desc',
      });

      expect(result).toBeDefined();
      expect(axios.post).toHaveBeenCalled();
    });

    it('generateFeedback response should match snapshot', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockFeedback),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.generateFeedback('function test() {}', {
        title: 'Test',
        description: 'Test desc',
      });
      // Remove timestamp for snapshot comparison (timestamps change each run)
      const { generated_at, ...resultWithoutTimestamp } = result;
      expect(resultWithoutTimestamp).toMatchSnapshot();
      expect(generated_at).toBeDefined();
    });
  });

  describe('generateHints', () => {
    const mockHints = {
      hints: [
        { level: 1, hint: 'Think about the problem step by step' },
        { level: 2, hint: 'Consider using a hash map for O(1) lookups' },
        { level: 3, hint: "Don't forget to handle edge cases" },
      ],
    };

    const mockChallenge = {
      title: 'Find Duplicates',
      description: 'Find all duplicates in an array',
      difficulty: 'intermediate',
    };

    const mockUserProgress = {
      attempts: 2,
    };

    it('should generate hints for a challenge', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockHints),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.generateHints(
        mockChallenge,
        mockUserProgress
      );

      expect(result).toBeDefined();
      expect(axios.post).toHaveBeenCalled();
    });

    it('generateHints response should match snapshot', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify(mockHints),
                  },
                ],
              },
            },
          ],
        },
      });

      const result = await aiService.generateHints(
        mockChallenge,
        mockUserProgress
      );
      expect(result).toMatchSnapshot();
    });
  });

  describe('API Response Formatting', () => {
    it('should handle malformed JSON responses by throwing error', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: 'This is not valid JSON but still a valid response',
                  },
                ],
              },
            },
          ],
        },
      });

      // generateChallenge throws when JSON parsing fails
      await expect(
        aiService.generateChallenge({
          skill: 'javascript',
          difficulty: 'intermediate',
        })
      ).rejects.toThrow('Failed to parse AI-generated challenge');
    });

    it('should handle empty API responses', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          candidates: [],
        },
      });

      await expect(
        aiService.generateChallenge({
          skill: 'javascript',
          difficulty: 'intermediate',
        })
      ).rejects.toThrow();
    });
  });
});
