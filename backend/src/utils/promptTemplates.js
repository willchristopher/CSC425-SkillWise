/**
 * AI Prompt Templates for SkillWise
 *
 * This module contains reusable prompt templates with placeholders
 * for consistent AI-generated content across the application.
 */

const promptTemplates = {
  /**
   * Challenge Generation Template
   * Placeholders: {{category}}, {{difficulty}}, {{topic}}, {{requirements}}
   */
  generateChallenge: {
    systemPrompt: `You are an expert educator creating engaging learning challenges across all subjects.
Generate well-structured, clear, and engaging challenges that help students learn effectively.
Challenges can be in any subject: programming, mathematics, science, history, language arts, music, art, etc.
Each challenge should have a clear goal, specific requirements, and appropriate difficulty level.
IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or explanatory text.`,

    userPrompt: `Create a learning challenge with the following parameters:
- Category: {{category}}
- Difficulty: {{difficulty}}
{{#if topic}}- Topic/Focus: {{topic}}{{/if}}
{{#if requirements}}- Additional Requirements: {{requirements}}{{/if}}

Generate a complete challenge as a JSON object (no markdown, no code blocks, just raw JSON) with these exact fields:
{
  "title": "A clear, concise title (max 100 characters)",
  "description": "A detailed description of what needs to be accomplished (2-3 paragraphs)",
  "instructions": "Step-by-step instructions or requirements (bullet points or numbered list)",
  "category": "{{category}}",
  "difficulty_level": "{{difficulty}}",
  "estimated_time_minutes": <realistic time estimate as a number>,
  "points_reward": <appropriate points based on difficulty (easy: 10-20, medium: 25-40, hard: 45-60)>,
  "learning_objectives": ["objective 1", "objective 2", "objective 3"],
  "tags": ["tag1", "tag2", "tag3"],
  "starter_code": "Optional starter material, template, or boilerplate if applicable (can be for any subject)",
  "test_cases": ["Example test case or success criteria 1", "Example test case or success criteria 2"],
  "hints": ["Hint 1", "Hint 2"]
}

Make sure the challenge is educational, engaging, appropriate for {{difficulty}} level, and suited to the {{category}} subject.
Return ONLY the JSON object, no other text.`,

    config: {
      maxOutputTokens: 4000,
      temperature: 0.9,
    },

    expectedResponseFormat: {
      type: 'json',
      requiredFields: [
        'title',
        'description',
        'instructions',
        'category',
        'difficulty_level',
        'estimated_time_minutes',
        'points_reward',
        'learning_objectives',
        'tags',
      ],
    },
  },

  /**
   * Code Feedback Template
   * Placeholders: {{submissionText}}, {{challengeTitle}}, {{challengeDescription}}
   */
  generateFeedback: {
    systemPrompt: `You are an experienced programming mentor providing constructive feedback on student code submissions.
Focus on both what was done well and areas for improvement. Be encouraging, specific, and educational.`,

    userPrompt: `Challenge: {{challengeTitle}}

Description: {{challengeDescription}}

Student's Submission:
\`\`\`
{{submissionText}}
\`\`\`

Please provide detailed feedback covering:
1. What the student did well
2. Areas for improvement
3. Specific suggestions for optimization or best practices
4. Encouragement and next steps

Keep the feedback constructive, clear, and actionable.`,

    config: {
      maxOutputTokens: 1500,
      temperature: 0.7,
    },

    expectedResponseFormat: {
      type: 'text',
      minLength: 100,
      maxLength: 10000,
    },
  },

  /**
   * Hint Generation Template
   * Placeholders: {{challengeTitle}}, {{challengeDescription}}, {{userProgress}}
   */
  generateHints: {
    systemPrompt: `You are a helpful tutor providing strategic hints without giving away the complete solution.
Guide students toward discovering the answer themselves through thoughtful questions and gentle nudges.
Work across any subject area: programming, mathematics, science, writing, history, language arts, etc.`,

    userPrompt: `Challenge: {{challengeTitle}}

Description: {{challengeDescription}}

Student Progress: {{userProgress}}

Provide 2-3 progressive hints that:
1. Start with conceptual guidance
2. Move toward implementation strategy
3. Give specific pointers (but not the complete solution)

Format each hint on a new line starting with "💡 Hint: "`,

    config: {
      maxOutputTokens: 800,
      temperature: 0.8,
    },

    expectedResponseFormat: {
      type: 'text',
      pattern: /💡 Hint:/,
      minHints: 2,
      maxHints: 3,
    },
  },

  /**
   * Challenge Suggestions Template
   * Placeholders: {{skillLevel}}, {{completedCount}}, {{preferredCategories}}, {{weakAreas}}
   */
  generateSuggestions: {
    systemPrompt: `You are a personalized learning advisor recommending challenges based on student progress.
Suggest challenges that are appropriately challenging while building on existing skills.
Consider all subject areas including programming, mathematics, science, history, languages, arts, and more.`,

    userPrompt: `Student Profile:
- Skill Level: {{skillLevel}}
- Completed Challenges: {{completedCount}}
- Preferred Categories: {{preferredCategories}}
- Areas Needing Practice: {{weakAreas}}

Recommend 3-5 specific challenge topics that would benefit this student's learning journey.
For each suggestion, briefly explain why it would be beneficial for their learning journey.`,

    config: {
      maxOutputTokens: 1000,
      temperature: 0.8,
    },

    expectedResponseFormat: {
      type: 'text',
      minLength: 200,
      maxLength: 2000,
    },
  },

  /**
   * Progress Analysis Template
   * Placeholders: {{completedChallenges}}, {{successRate}}, {{strongAreas}}, {{weakAreas}},
   *              {{avgTimePerChallenge}}, {{streak}}, {{recentActivity}}
   */
  analyzeProgress: {
    systemPrompt: `You are an educational data analyst. Analyze student learning patterns across all subjects and provide 
actionable insights to help them improve their learning journey. Be specific and encouraging.
Students may be learning programming, mathematics, languages, sciences, arts, or any other subject area.`,

    userPrompt: `Student Learning Data:
- Total challenges completed: {{completedChallenges}}
- Success rate: {{successRate}}%
- Strong areas: {{strongAreas}}
- Areas needing work: {{weakAreas}}
- Average time per challenge: {{avgTimePerChallenge}} minutes
- Learning streak: {{streak}} days
- Recent activity: {{recentActivity}}

Please analyze this learning pattern and provide:
1. Key strengths observed
2. Areas that need attention
3. Specific recommendations for improvement
4. Suggested learning strategies`,

    config: {
      maxOutputTokens: 1200,
      temperature: 0.7,
    },

    expectedResponseFormat: {
      type: 'text',
      minLength: 300,
      maxLength: 2500,
    },
  },
};

/**
 * Template variable replacer
 * Replaces {{placeholder}} with actual values
 * Supports conditional blocks: {{#if variable}}content{{/if}}
 */
const fillTemplate = (template, variables) => {
  let result = template;

  // Handle conditional blocks first
  const conditionalRegex = /\{\{#if\s+(\w+)\}\}(.*?)\{\{\/if\}\}/gs;
  result = result.replace(conditionalRegex, (match, variable, content) => {
    return variables[variable] ? content : '';
  });

  // Replace simple placeholders
  Object.keys(variables).forEach((key) => {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    const value =
      variables[key] !== undefined && variables[key] !== null
        ? variables[key]
        : '';
    result = result.replace(placeholder, value);
  });

  return result;
};

/**
 * Get a filled prompt template
 * @param {string} templateName - Name of the template to use
 * @param {object} variables - Variables to fill in the template
 * @returns {object} Object with systemPrompt, userPrompt, and config
 */
const getPrompt = (templateName, variables = {}) => {
  const template = promptTemplates[templateName];

  if (!template) {
    throw new Error(`Template '${templateName}' not found`);
  }

  return {
    systemPrompt: fillTemplate(template.systemPrompt, variables),
    userPrompt: fillTemplate(template.userPrompt, variables),
    config: template.config,
    expectedFormat: template.expectedResponseFormat,
  };
};

/**
 * Validate if a response matches the expected format
 * @param {string} templateName - Name of the template used
 * @param {any} response - Response to validate
 * @returns {object} Validation result { valid: boolean, errors: string[] }
 */
const validateResponse = (templateName, response) => {
  const template = promptTemplates[templateName];

  if (!template) {
    return { valid: false, errors: [`Template '${templateName}' not found`] };
  }

  const errors = [];
  const expectedFormat = template.expectedResponseFormat;

  if (!response) {
    errors.push('Response is empty or null');
    return { valid: false, errors };
  }

  // Validate based on expected type
  if (expectedFormat.type === 'json') {
    try {
      const parsed =
        typeof response === 'string' ? JSON.parse(response) : response;

      // Check required fields
      if (expectedFormat.requiredFields) {
        expectedFormat.requiredFields.forEach((field) => {
          if (!(field in parsed)) {
            errors.push(`Missing required field: ${field}`);
          }
        });
      }
    } catch (e) {
      errors.push(`Invalid JSON: ${e.message}`);
    }
  } else if (expectedFormat.type === 'text') {
    const text = String(response);

    // Check length constraints
    if (expectedFormat.minLength && text.length < expectedFormat.minLength) {
      errors.push(
        `Response too short (${text.length} < ${expectedFormat.minLength})`
      );
    }
    if (expectedFormat.maxLength && text.length > expectedFormat.maxLength) {
      errors.push(
        `Response too long (${text.length} > ${expectedFormat.maxLength})`
      );
    }

    // Check pattern match
    if (expectedFormat.pattern && !expectedFormat.pattern.test(text)) {
      errors.push('Response does not match expected pattern');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

module.exports = {
  promptTemplates,
  getPrompt,
  fillTemplate,
  validateResponse,
};
