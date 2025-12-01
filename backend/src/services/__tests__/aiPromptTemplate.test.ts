// __tests__/aiPromptTemplate.test.ts
const { buildGenerateChallengePrompt } = require('../aiPromptTemplate');

describe('buildGenerateChallengePrompt', () => {
  it('includes topic and difficulty in the prompt', () => {
    const prompt = buildGenerateChallengePrompt({ topic: 'sorting', difficulty: 'easy' });
    expect(prompt).toContain('Topic: sorting');
    expect(prompt).toContain('Difficulty: easy');
  });

  it('includes the example JSON structure', () => {
    const prompt = buildGenerateChallengePrompt({ topic: 'graphs', difficulty: 'hard' });
    expect(prompt).toContain('"title": "Reverse Pairs"');
    expect(prompt).toContain('"hints": [');
    expect(prompt).toContain('Example output:');
  });

  it('uses provided example if given', () => {
    const example = {
      title: 'Sum of Two',
      description: 'Given two numbers, return their sum.',
      difficulty: 'easy',
      hints: ['Add the numbers'],
    };
    const prompt = buildGenerateChallengePrompt({ topic: 'math', difficulty: 'easy', examples: [example] });
    expect(prompt).toContain('Sum of Two');
    expect(prompt).toContain('Add the numbers');
  });
});
