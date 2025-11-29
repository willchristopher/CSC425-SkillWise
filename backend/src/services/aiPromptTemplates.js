// Enhanced AI prompt templates with consistent placeholders for SkillWise

const templates = {
  // Challenge Generation Templates
  challengeSystem: `You are an expert programming instructor creating educational coding challenges. Create engaging, educational challenges that help students learn effectively. Always respond with valid JSON format.`,

  challengeUser: ({ topic = 'programming', difficulty = 'medium', category = 'algorithms' }) => 
    `Create a ${difficulty}-level programming challenge about ${topic} in the ${category} category.

Requirements:
- Provide a clear, engaging title
- Write a detailed description explaining what to implement
- Include specific requirements/constraints
- Add example inputs/outputs if applicable
- Ensure the challenge is appropriate for ${difficulty} skill level
- Make it educational and practical

Format your response as a JSON object with this structure:
{
  "title": "Challenge Title",
  "description": "Detailed description of what to build/solve",
  "difficulty": "${difficulty}",
  "requirements": ["List of specific requirements"],
  "examples": [{"input": "example input", "output": "expected output"}],
  "hints": ["Helpful hints without giving away the solution"],
  "tags": ["relevant", "tags"],
  "estimatedTime": "estimated completion time"
}`,

  // Code Feedback Templates
  feedbackSystem: `You are an expert programming mentor providing constructive, encouraging feedback on student code submissions. Focus on being educational, specific, and positive while identifying areas for improvement.`,

  feedbackUser: ({ title, description, submissionText, requirements = [] }) => 
    `Challenge: ${title}
Description: ${description}
Requirements: ${requirements.join(', ')}

Student's Code Submission:
\`\`\`
${submissionText}
\`\`\`

Please provide comprehensive feedback including:

✅ **Strengths:**
- What the student did well
- Correct implementations
- Good programming practices demonstrated

🔧 **Areas for Improvement:**
- Code quality issues
- Logic problems
- Missing requirements

💡 **Suggestions:**
- Specific recommendations for improvement
- Alternative approaches to consider
- Best practices to adopt

📚 **Learning Opportunities:**
- Concepts to study further
- Resources or topics to explore
- Advanced techniques to consider

Keep feedback encouraging and educational. Focus on helping the student learn and grow.`,

  // Hint Generation Templates
  hintsSystem: `You are a helpful programming tutor providing hints without giving away solutions directly. Gradually increase hint specificity based on student progress.`,

  hintsUser: ({ title, description, difficulty, attemptCount = 0, lastAttempt = '' }) =>
    `Challenge: ${title}
Description: ${description}
Difficulty: ${difficulty}
Student Attempts: ${attemptCount}
${lastAttempt ? `Last Attempt Summary: ${lastAttempt}` : ''}

Provide helpful hints that:
- Don't reveal the complete solution
- Guide thinking in the right direction
- Are appropriate for attempt number ${attemptCount}
- Help break down the problem into smaller parts
- Suggest relevant concepts or approaches

Format as a friendly, encouraging response with numbered hints.`,

  // Personalized Suggestions Templates
  suggestionsSystem: `You are an AI learning advisor creating personalized challenge recommendations based on student progress and interests.`,

  suggestionsUser: ({ skillLevel, completedCount, interests = [], goals = '', recentTopics = [], preferredDifficulty = 'medium' }) =>
    `Student Profile:
- Skill Level: ${skillLevel}
- Completed Challenges: ${completedCount}
- Interests: ${interests.join(', ')}
- Learning Goals: ${goals}
- Recent Topics: ${recentTopics.join(', ')}
- Preferred Difficulty: ${preferredDifficulty}

Based on this profile, recommend 3-5 specific programming challenges or topics that would:
1. Match their current skill level
2. Align with their interests and goals
3. Provide appropriate progression from recent work
4. Include variety in challenge types

Format as a friendly response with specific recommendations and reasoning.`,

  // Progress Analysis Templates
  progressSystem: `You are an AI learning analytics expert analyzing student progress to provide insights and recommendations.`,

  progressUser: ({ userId, completedChallenges = [], successRate = 0, timeSpent = 0, strengths = [], weaknesses = [] }) =>
    `Student Learning Analytics:
- User ID: ${userId}
- Completed Challenges: ${completedChallenges.length}
- Success Rate: ${Math.round(successRate * 100)}%
- Time Spent Learning: ${Math.round(timeSpent / 60)} hours
- Identified Strengths: ${strengths.join(', ')}
- Areas for Growth: ${weaknesses.join(', ')}

Recent Challenges:
${completedChallenges.slice(-5).map(c => `- ${c.title} (${c.difficulty}) - ${c.status}`).join('\n')}

Provide a comprehensive learning analysis including:
1. Overall progress assessment
2. Skill development trends
3. Recommended focus areas
4. Suggested learning path
5. Motivational insights

Format as an encouraging, data-driven analysis with specific recommendations.`
};

// Template builders with consistent interfaces
const buildChallengePrompts = ({ topic = 'algorithms', difficulty = 'medium', category = 'programming' } = {}) => ({
  systemPrompt: templates.challengeSystem,
  userPrompt: templates.challengeUser({ topic, difficulty, category }),
});

const buildFeedbackPrompts = ({ title, description, submissionText, requirements = [] }) => ({
  systemPrompt: templates.feedbackSystem,
  userPrompt: templates.feedbackUser({ title, description, submissionText, requirements }),
});

const buildHintsPrompts = ({ title, description, difficulty, attemptCount = 0, lastAttempt = '' }) => ({
  systemPrompt: templates.hintsSystem,
  userPrompt: templates.hintsUser({ title, description, difficulty, attemptCount, lastAttempt }),
});

const buildSuggestionsPrompts = (userProfile) => ({
  systemPrompt: templates.suggestionsSystem,
  userPrompt: templates.suggestionsUser(userProfile),
});

const buildProgressPrompts = (analyticsData) => ({
  systemPrompt: templates.progressSystem,
  userPrompt: templates.progressUser(analyticsData),
});

// Test harness for verifying prompt responses
const testPromptTemplates = async (aiServiceFunction) => {
  const testCases = [
    {
      name: 'Challenge Generation',
      prompts: buildChallengePrompts({ topic: 'arrays', difficulty: 'easy' }),
      expectedFields: ['title', 'description', 'difficulty', 'requirements']
    },
    {
      name: 'Feedback Generation',  
      prompts: buildFeedbackPrompts({
        title: 'Array Sum',
        description: 'Calculate sum of array elements',
        submissionText: 'function sum(arr) { return arr.reduce((a,b) => a+b, 0); }'
      }),
      expectedContent: ['strengths', 'improvement', 'suggestions']
    },
    {
      name: 'Hints Generation',
      prompts: buildHintsPrompts({
        title: 'Binary Search',
        description: 'Implement binary search algorithm',
        difficulty: 'medium',
        attemptCount: 1
      }),
      expectedContent: ['hint', 'approach', 'think']
    }
  ];

  const results = [];
  for (const testCase of testCases) {
    try {
      const response = await aiServiceFunction(testCase.prompts.systemPrompt, testCase.prompts.userPrompt);
      results.push({
        name: testCase.name,
        success: true,
        response: response.substring(0, 100) + '...',
        hasExpectedContent: testCase.expectedContent ? 
          testCase.expectedContent.some(term => response.toLowerCase().includes(term.toLowerCase())) : true
      });
    } catch (error) {
      results.push({
        name: testCase.name,
        success: false,
        error: error.message
      });
    }
  }
  return results;
};

module.exports = {
  templates,
  buildChallengePrompts,
  buildFeedbackPrompts, 
  buildHintsPrompts,
  buildSuggestionsPrompts,
  buildProgressPrompts,
  testPromptTemplates
};
