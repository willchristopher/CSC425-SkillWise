const aiService = require('../../../src/services/aiService');
const { testPromptTemplates } = require('../../../src/services/aiPromptTemplates');

// Mock the Gemini API calls for consistent testing
jest.mock('../../../src/services/aiService', () => {
  const originalModule = jest.requireActual('../../../src/services/aiService');
  return {
    ...originalModule,
    generateFeedback: jest.fn(),
    generateChallenge: jest.fn(),
    generateHints: jest.fn(),
  };
});

describe('AI Service Snapshot Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AI Feedback Generation', () => {
    it('should generate consistent feedback for code submissions', async () => {
      const mockFeedback = `✅ **Strengths:**
- Clean and readable code structure
- Proper use of array reduce method
- Good variable naming

🔧 **Areas for Improvement:**
- Consider adding input validation
- Could benefit from error handling
- Add comments for clarity

💡 **Suggestions:**
- Use TypeScript for better type safety
- Consider edge cases like empty arrays
- Add unit tests for the function

📚 **Learning Opportunities:**
- Study functional programming concepts
- Learn about error handling patterns
- Explore advanced array methods`;

      aiService.generateFeedback.mockResolvedValue(mockFeedback);

      const result = await aiService.generateFeedback(
        'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        {
          title: 'Array Sum Calculator',
          description: 'Write a function that calculates the sum of all numbers in an array',
          requirements: ['Function should accept an array of numbers', 'Return the sum']
        }
      );

      expect(result).toMatchSnapshot();
      expect(aiService.generateFeedback).toHaveBeenCalledWith(
        'function sum(arr) { return arr.reduce((a, b) => a + b, 0); }',
        expect.objectContaining({
          title: 'Array Sum Calculator',
          description: expect.any(String)
        })
      );
    });

    it('should generate consistent feedback for different difficulty levels', async () => {
      const scenarios = [
        {
          name: 'beginner_code',
          code: 'let sum = 0; for(let i = 0; i < arr.length; i++) { sum += arr[i]; } return sum;',
          challenge: { title: 'Basic Loop Sum', description: 'Use a loop to sum array elements' }
        },
        {
          name: 'intermediate_code', 
          code: 'const sum = arr.reduce((acc, curr) => acc + curr, 0);',
          challenge: { title: 'Functional Sum', description: 'Use array methods to sum elements' }
        },
        {
          name: 'advanced_code',
          code: 'const sum = arr.filter(n => typeof n === "number").reduce((a, b) => a + b, 0);',
          challenge: { title: 'Robust Sum', description: 'Sum with input validation' }
        }
      ];

      for (const scenario of scenarios) {
        const mockResponse = `Feedback for ${scenario.name}: Good implementation with appropriate complexity.`;
        aiService.generateFeedback.mockResolvedValue(mockResponse);
        
        const result = await aiService.generateFeedback(scenario.code, scenario.challenge);
        expect(result).toMatchSnapshot(`feedback-${scenario.name}`);
      }
    });
  });

  describe('AI Challenge Generation', () => {
    it('should generate consistent challenge structures', async () => {
      const mockChallenge = {
        title: "Binary Tree Traversal",
        description: "Implement in-order, pre-order, and post-order traversal for a binary tree",
        difficulty: "medium",
        requirements: [
          "Implement TreeNode class with left and right properties",
          "Create three traversal methods: inOrder, preOrder, postOrder", 
          "Return arrays of node values in correct order"
        ],
        examples: [
          {
            input: "tree with nodes [1,2,3,4,5]",
            output: "inOrder: [4,2,5,1,3], preOrder: [1,2,4,5,3], postOrder: [4,5,2,3,1]"
          }
        ],
        hints: [
          "Recursion is key for tree traversal",
          "Think about when to process the current node vs. children"
        ],
        tags: ["trees", "recursion", "data-structures"],
        estimatedTime: "45-60 minutes"
      };

      aiService.generateChallenge.mockResolvedValue(mockChallenge);

      const result = await aiService.generateChallenge({ 
        topic: 'data-structures', 
        difficulty: 'medium' 
      });
      
      expect(result).toMatchSnapshot('challenge-data-structures-medium');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('requirements');
    });

    it('should handle invalid JSON responses gracefully', async () => {
      const invalidResponse = "This is not valid JSON but still a useful challenge description...";
      aiService.generateChallenge.mockResolvedValue(invalidResponse);

      const result = await aiService.generateChallenge({ topic: 'arrays', difficulty: 'easy' });
      
      expect(result).toMatchSnapshot('challenge-fallback-format');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('difficulty');
      expect(result).toHaveProperty('requirements');
    });
  });

  describe('AI Hints Generation', () => {
    it('should generate progressive hints based on attempt count', async () => {
      const challenge = {
        title: 'Two Sum Problem',
        description: 'Find two numbers in array that add up to target',
        difficulty: 'medium'
      };

      const hintsByAttempt = [
        "Start by understanding what the problem is asking...",
        "Consider using a hash map to store values you've seen...", 
        "Think about the complement of each number relative to the target...",
        "The key insight is that for each number x, you need to find (target - x)..."
      ];

      for (let attempt = 0; attempt < hintsByAttempt.length; attempt++) {
        aiService.generateHints.mockResolvedValue(hintsByAttempt[attempt]);
        
        const result = await aiService.generateHints(challenge, { attempts: attempt });
        expect(result).toMatchSnapshot(`hints-attempt-${attempt}`);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const apiError = new Error('Gemini API rate limit exceeded');
      aiService.generateFeedback.mockRejectedValue(apiError);

      await expect(aiService.generateFeedback('test code', { title: 'Test' }))
        .rejects.toThrow('Gemini API rate limit exceeded');
    });
  });
});

// Integration test with real prompt templates  
describe('AI Prompt Integration Tests', () => {
  it('should generate valid prompts for all template types', () => {
    const { 
      buildChallengePrompts, 
      buildFeedbackPrompts, 
      buildHintsPrompts 
    } = require('../../../src/services/aiPromptTemplates');

    const challengePrompts = buildChallengePrompts({ 
      topic: 'arrays', 
      difficulty: 'medium' 
    });
    expect(challengePrompts).toMatchSnapshot('challenge-prompts-arrays-medium');

    const feedbackPrompts = buildFeedbackPrompts({
      title: 'Test Challenge',
      description: 'Test description', 
      submissionText: 'console.log("hello");'
    });
    expect(feedbackPrompts).toMatchSnapshot('feedback-prompts-basic');

    const hintsPrompts = buildHintsPrompts({
      title: 'Binary Search',
      description: 'Implement binary search algorithm',
      difficulty: 'medium',
      attemptCount: 2
    });
    expect(hintsPrompts).toMatchSnapshot('hints-prompts-binary-search');
  });

  it('should validate prompt template test harness', async () => {
    // Mock a simple AI function for testing
    const mockAIFunction = async (systemPrompt, userPrompt) => {
      return `Response for: ${userPrompt.substring(0, 30)}...`;
    };

    const testResults = await testPromptTemplates(mockAIFunction);
    
    expect(testResults).toMatchSnapshot('prompt-template-test-results');
    expect(testResults).toHaveLength(3); // Should test 3 different prompt types
    expect(testResults.every(result => result.success)).toBe(true);
  });
});

module.exports = {};
