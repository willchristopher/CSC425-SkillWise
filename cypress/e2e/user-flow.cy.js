describe('Complete User Flow - Goals and Challenges', () => {
  const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123',
    firstName: 'Test',
    lastName: 'User',
  };

  const testGoal = {
    title: 'Learn React Advanced Patterns',
    description: 'Master hooks, context, and performance optimization in React',
    target_date: '2025-12-31',
    category: 'programming',
  };

  const testChallenge = {
    title: 'Build a Custom Hook',
    description: 'Create a reusable custom hook for form handling',
    difficulty_level: 'medium',
    points_reward: 150,
  };

  let createdGoalId;
  let createdChallengeId;

  before(() => {
    // Setup: Register and login
    cy.visit('/signup');
    
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('input[name="firstName"]').type(testUser.firstName);
    cy.get('input[name="lastName"]').type(testUser.lastName);
    
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard after successful signup
    cy.url().should('include', '/dashboard');
  });

  it('should complete the full workflow: login → create goal → add challenge → mark complete', () => {
    // Step 1: Verify user is logged in and on dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(testUser.firstName).should('be.visible');

    // Step 2: Create a new goal
    cy.visit('/goals');
    cy.contains('Create').click(); // Assuming there's a "Create Goal" button

    cy.get('input[name="title"]').type(testGoal.title);
    cy.get('textarea[name="description"]').type(testGoal.description);
    cy.get('input[name="target_date"]').type(testGoal.target_date);
    cy.get('select[name="category"]').select(testGoal.category);
    
    cy.get('button[type="submit"]').click();

    // Verify goal was created and redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains(testGoal.title).should('be.visible');

    // Store goal ID for later use
    cy.get('[data-testid="goal-card"]')
      .first()
      .invoke('attr', 'data-goal-id')
      .then((id) => {
        createdGoalId = id;
      });

    // Step 3: Add a challenge to the goal
    cy.contains(testGoal.title).click(); // Click on the goal card
    cy.contains('Add Challenge').click();

    cy.get('input[name="title"]').type(testChallenge.title);
    cy.get('textarea[name="description"]').type(testChallenge.description);
    cy.get('select[name="difficulty_level"]').select(testChallenge.difficulty_level);
    
    cy.get('button[type="submit"]').click();

    // Verify challenge was created
    cy.contains(testChallenge.title).should('be.visible');

    // Store challenge ID for later use
    cy.get('[data-testid="challenge-card"]')
      .first()
      .invoke('attr', 'data-challenge-id')
      .then((id) => {
        createdChallengeId = id;
      });

    // Step 4: Mark the challenge as complete
    cy.contains(testChallenge.title)
      .parents('[data-testid="challenge-card"]')
      .within(() => {
        cy.contains('Mark Complete').click();
      });

    // Verify challenge is marked as completed
    cy.contains(testChallenge.title)
      .parents('[data-testid="challenge-card"]')
      .should('contain', 'Completed');

    // Verify progress bar updated
    cy.get('[data-testid="progress-bar"]')
      .should('contain', '100%');

    // Step 5: Verify on dashboard that goal shows progress
    cy.visit('/dashboard');
    cy.contains(testGoal.title)
      .parents('[data-testid="goal-card"]')
      .should('contain', '100%');
  });

  it('should persist data after logout and login', () => {
    // Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');

    // Login again
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // Verify goal and challenge still exist
    cy.url().should('include', '/dashboard');
    cy.contains(testGoal.title).should('be.visible');
    
    cy.contains(testGoal.title).click();
    cy.contains(testChallenge.title).should('be.visible');
    cy.contains('Completed').should('be.visible');
  });

  after(() => {
    // Cleanup: Delete test data via API
    cy.request({
      method: 'DELETE',
      url: `/api/challenges/${createdChallengeId}`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      },
      failOnStatusCode: false,
    });

    cy.request({
      method: 'DELETE',
      url: `/api/goals/${createdGoalId}`,
      headers: {
        Authorization: `Bearer ${window.localStorage.getItem('accessToken')}`,
      },
      failOnStatusCode: false,
    });
  });
});
