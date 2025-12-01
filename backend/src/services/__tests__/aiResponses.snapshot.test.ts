// aiResponses.snapshot.test.ts
const { buildGenerateChallengePrompt } = require('../aiPromptTemplate');
const aiService = require('../aiService');

describe('AI Response Parsing Snapshots', () => {
  // Sample prompt and response
  const prompt = buildGenerateChallengePrompt({ topic: 'arrays', difficulty: 'medium' });
  const sampleOpenAIResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            title: 'Reverse Pairs',
            description: 'Given an array of integers, count the number of pairs (i,j) where i<j and nums[i] > nums[j]. Provide O(n log n) solution.',
            difficulty: 'medium',
            hints: ['Use merge sort pattern', 'Count cross inversions'],
          }),
        },
      },
    ],
  };

  it('parses OpenAI response and matches snapshot', () => {
    // Simulate what aiService.parseChallengeResponse expects (string content)
    const content = sampleOpenAIResponse.choices[0].message.content;
    const parsed = aiService.parseChallengeResponse(content);
    expect(parsed.title).toMatchSnapshot('challenge-title');
    expect(parsed).toMatchSnapshot('challenge-object');
  });

  it('prompt template includes required fields', () => {
    expect(prompt).toContain('title');
    expect(prompt).toContain('description');
    expect(prompt).toContain('difficulty');
    expect(prompt).toContain('hints');
    expect(prompt).toMatchSnapshot('prompt-template');
  });
});

/**
 * To update snapshots after legitimate changes, run:
 *   jest src/services/__tests__/aiResponses.snapshot.test.ts -u
 * Only update if you have reviewed and approved the new output shape/content.
 */
