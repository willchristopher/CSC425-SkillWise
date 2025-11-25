const { buildFeedbackPrompts, buildChallengePrompts } = require('../../src/services/aiPromptTemplates');

describe('AI Prompt Templates', () => {
  test('buildFeedbackPrompts generates expected prompt structure', () => {
    const prompts = buildFeedbackPrompts({
      title: 'Sum Two Numbers',
      description: 'Write a function that returns sum of two numbers',
      submissionText: 'function sum(a, b) { return a + b }',
    });

    expect(prompts).toMatchSnapshot();
  });

  test('buildChallengePrompts generates challenge prompt with defaults and custom values', () => {
    const defaultPrompts = buildChallengePrompts();
    expect(defaultPrompts).toMatchSnapshot();

    const customPrompts = buildChallengePrompts({ topic: 'arrays', difficulty: 'easy' });
    expect(customPrompts).toMatchSnapshot();
  });
});
