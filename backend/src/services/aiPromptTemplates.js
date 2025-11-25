// Reusable AI prompt templates and helper to apply placeholders

const templates = {
  feedbackSystem: `You are an expert programming tutor providing constructive feedback on student code submissions.\nBe encouraging, specific, and educational. Point out both strengths and areas for improvement. Focus on code quality, best practices, and learning opportunities.`,

  feedbackUser: ({ title, description, submissionText }) => `Challenge: ${title}\n\nDescription: ${description}\n\nStudent's Submission:\n${submissionText}\n\nPlease provide detailed, constructive feedback on this submission. Include:\n1. What was done well\n2. Areas for improvement\n3. Specific suggestions for better implementation\n4. Any best practices or concepts the student should learn`,

  challengeSystem: `You are an educational content writer creating concise programming challenges. Output a short title and a clear description with requirements and example input/output when appropriate. Keep the difficulty level consistent with the requested difficulty.`,

  challengeUser: ({ topic, difficulty }) => `Please create one programming challenge about: ${topic}\nDifficulty: ${difficulty}\n\nProvide a short title on the first line, then a clear description, requirements, and one example (input -> output) if applicable. Do not include extraneous commentary.`,
};

const buildFeedbackPrompts = ({ title, description, submissionText }) => {
  return {
    systemPrompt: templates.feedbackSystem,
    userPrompt: templates.feedbackUser({ title, description, submissionText }),
  };
};

const buildChallengePrompts = ({ topic = 'algorithms', difficulty = 'medium' } = {}) => ({
  systemPrompt: templates.challengeSystem,
  userPrompt: templates.challengeUser({ topic, difficulty }),
});

module.exports = {
  templates,
  buildFeedbackPrompts,
  buildChallengePrompts,
};
