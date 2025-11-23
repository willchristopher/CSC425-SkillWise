const axios = require('axios');
const aiService = require('../../src/services/aiService');

jest.mock('axios');

describe('AI service snapshots', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('generateChallenge produces stable output (snapshot)', async () => {
    const fakeText = 'Title: Sum of Two Numbers\n\nDescription: Given two numbers, return their sum.\nRequirements: simple input parsing.\nExample:\nInput: 1 2 -> Output: 3';

    axios.post.mockResolvedValue({
      data: {
        candidates: [
          { content: { parts: [{ text: fakeText }] } }
        ]
      }
    });

    const result = await aiService.generateChallenge({ topic: 'numbers', difficulty: 'easy' });
    expect(result).toMatchSnapshot();
  });

  test('generateFeedback produces stable feedback (snapshot)', async () => {
    const fakeFeedback = 'Strengths:\n- Clear variable names\nImprovements:\n- Consider edge cases.';

    axios.post.mockResolvedValue({
      data: {
        candidates: [
          { content: { parts: [{ text: fakeFeedback }] } }
        ]
      }
    });

    const feedback = await aiService.generateFeedback('print(1+1)', { title: 'Add', description: 'Add numbers' });
    expect(feedback).toMatchSnapshot();
  });
});
