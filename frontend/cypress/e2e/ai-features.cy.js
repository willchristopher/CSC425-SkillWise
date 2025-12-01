/**
 * E2E Tests for AI Features
 * Stories 3.1-3.6: AI Challenge Generation and Feedback Workflow
 */

describe('AI Features Workflow', () => {
  beforeEach(() => {
    // Intercept API calls to mock responses
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        user: { id: 1, email: 'testuser@example.com', username: 'testuser' },
        accessToken: 'mock-access-token',
      },
    }).as('login');

    cy.intercept('POST', '/api/ai/generateChallenge', {
      statusCode: 200,
      body: {
        success: true,
        challenge: {
          title: 'Build a REST API',
          description: 'Create a RESTful API for a todo application',
          difficulty_level: 'intermediate',
          category: 'backend',
          requirements: [
            'Implement CRUD operations',
            'Use proper HTTP methods',
          ],
          hints: ['Start with Express setup', 'Use middleware'],
          estimated_time_minutes: 60,
        },
        prompt: 'Generate a coding challenge...',
        rawResponse: '{"title": "Build a REST API"...}',
      },
    }).as('generateChallenge');

    cy.intercept('POST', '/api/ai/submitForFeedback', {
      statusCode: 200,
      body: {
        success: true,
        feedback: {
          overall_score: 85,
          strengths: ['Good code structure', 'Proper error handling'],
          improvements: ['Add more comments', 'Consider edge cases'],
          suggestions: ['Use async/await', 'Add unit tests'],
          feedback_summary: 'Great job! Your solution is well-structured.',
          next_steps: ['Practice more algorithms', 'Learn testing'],
        },
        prompt: 'Challenge: Build a REST API...',
        response: '{"overall_score": 85...}',
      },
    }).as('submitForFeedback');

    cy.intercept('GET', '/api/challenges*', {
      statusCode: 200,
      body: {
        challenges: [
          {
            id: 1,
            title: 'Sample Challenge',
            description: 'A sample challenge for testing',
            difficulty_level: 'beginner',
          },
        ],
      },
    }).as('getChallenges');
  });

  describe('Story 3.1: Generate Challenge Button', () => {
    it('should display the Generate AI Challenge button on challenges page', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      // Check for the AI generate button
      cy.contains('Generate AI Challenge').should('exist');
    });

    it('should open modal when Generate AI Challenge button is clicked', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      cy.contains('Generate AI Challenge').click();

      // Modal should appear
      cy.get('.ai-generate-modal').should('be.visible');
      cy.contains('AI Challenge Generator').should('exist');
    });
  });

  describe('Story 3.2: /ai/generateChallenge Endpoint', () => {
    it('should call /ai/generateChallenge when form is submitted', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      cy.contains('Generate AI Challenge').click();

      // Fill in the form
      cy.get('input[placeholder*="topic"], select[name="topic"]')
        .first()
        .type('JavaScript fundamentals');
      cy.get('select[name="difficulty"]').select('intermediate');

      // Submit the form
      cy.get('.ai-generate-modal').within(() => {
        cy.contains('Generate').click();
      });

      // Verify API was called
      cy.wait('@generateChallenge').its('request.body').should('include', {
        difficulty: 'intermediate',
      });
    });

    it('should display generated challenge after API response', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      cy.contains('Generate AI Challenge').click();

      cy.get('input[placeholder*="topic"], input[name="topic"]')
        .first()
        .type('JavaScript');
      cy.get('select[name="difficulty"]').select('intermediate');

      cy.get('.ai-generate-modal').within(() => {
        cy.contains('Generate').click();
      });

      cy.wait('@generateChallenge');

      // Verify the challenge is displayed
      cy.contains('Build a REST API').should('exist');
    });
  });

  describe('Story 3.4: Submission Form for AI Feedback', () => {
    it('should have submission form with text input', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      // Look for the AI feedback form or button
      cy.contains('Submit for AI Feedback').should('exist');
    });
  });

  describe('Story 3.5: /ai/submitForFeedback Endpoint', () => {
    it('should call /ai/submitForFeedback when submission is sent', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      // Find and click the AI feedback button/form
      cy.contains('Submit for AI Feedback').click();

      // Fill in submission
      cy.get('textarea[name="submissionText"], textarea.submission-input')
        .first()
        .type('function solution() { return true; }');

      // Submit for feedback
      cy.contains('Get AI Feedback').click();

      cy.wait('@submitForFeedback');

      // Verify feedback is displayed
      cy.contains('85').should('exist'); // The score
      cy.contains('Great job!').should('exist');
    });
  });

  describe('Story 3.8: Sentry Error Tracking', () => {
    it('should handle errors gracefully', () => {
      // Override the intercept to return an error
      cy.intercept('POST', '/api/ai/generateChallenge', {
        statusCode: 500,
        body: { error: 'AI service unavailable' },
      }).as('generateChallengeError');

      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      cy.contains('Generate AI Challenge').click();

      cy.get('input[placeholder*="topic"], input[name="topic"]')
        .first()
        .type('JavaScript');
      cy.get('select[name="difficulty"]').select('intermediate');

      cy.get('.ai-generate-modal').within(() => {
        cy.contains('Generate').click();
      });

      cy.wait('@generateChallengeError');

      // Should show error message to user
      cy.contains('error').should('exist');
    });
  });

  describe('Full AI Workflow', () => {
    it('should complete full AI challenge generation and feedback flow', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type('testuser@example.com');
      cy.get('input[name="password"]').type('password');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.visit('/challenges');

      // Step 1: Generate a challenge
      cy.contains('Generate AI Challenge').click();
      cy.get('input[placeholder*="topic"], input[name="topic"]')
        .first()
        .type('JavaScript arrays');
      cy.get('select[name="difficulty"]').select('beginner');

      cy.get('.ai-generate-modal').within(() => {
        cy.contains('Generate').click();
      });

      cy.wait('@generateChallenge');
      cy.contains('Build a REST API').should('exist');

      // Step 2: Submit for feedback
      cy.contains('Submit for AI Feedback').click();
      cy.get('textarea[name="submissionText"], textarea.submission-input')
        .first()
        .type('const arr = [1, 2, 3]; console.log(arr.map(x => x * 2));');
      cy.contains('Get AI Feedback').click();

      cy.wait('@submitForFeedback');

      // Step 3: Verify feedback displayed
      cy.contains('85').should('exist');
      cy.contains('Good code structure').should('exist');
    });
  });
});
