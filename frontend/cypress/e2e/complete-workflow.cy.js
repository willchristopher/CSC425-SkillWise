// Comprehensive E2E test covering complete workflow:
// Login → Create Goal → Add Challenge → Mark Complete
describe('Complete User Workflow', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';
  const goalTitle = 'Learn React Advanced Patterns';
  const goalDescription = 'Master React hooks, context, and performance optimization';
  const challengeTitle = 'Build a Custom Hook';
  const challengeDescription = 'Create a reusable custom hook for data fetching';

  beforeEach(() => {
    // Clear cookies and local storage before each test
    cy.clearCookies();
    cy.clearLocalStorage();
  });

  it('should complete the full workflow: signup → login → create goal → add challenge → mark complete', () => {
    // Step 1: Sign up a new user
    cy.visit('http://localhost:3002/signup');
    cy.get('input[id="firstName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').contains('Sign Up').click();

    // Step 2: Verify redirect to dashboard after signup
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    cy.contains('Welcome back').should('be.visible');

    // Step 3: Navigate to Goals page
    cy.contains('Goals').click();
    cy.url().should('include', '/goals');

    // Step 4: Create a new goal
    cy.contains('Create New Goal').click();
    cy.get('input[id="title"]').type(goalTitle);
    cy.get('textarea[id="description"]').type(goalDescription);
    cy.get('select[id="category"]').select('programming');
    cy.get('select[id="difficulty_level"]').select('medium');
    cy.get('input[id="points_reward"]').clear().type('50');
    cy.get('button[type="submit"]').contains(/create|save/i).click();

    // Step 5: Verify goal appears in the list
    cy.contains(goalTitle, { timeout: 10000 }).should('be.visible');
    cy.contains(goalDescription).should('be.visible');

    // Step 6: Navigate to Challenges page
    cy.contains('Challenges').click();
    cy.url().should('include', '/challenges');

    // Step 7: Create a new challenge
    cy.contains('Create New Challenge').click();
    cy.get('input[id="title"]').type(challengeTitle);
    cy.get('textarea[id="description"]').type(challengeDescription);
    cy.get('select[id="category"]').select('programming');
    cy.get('select[id="difficulty_level"]').select('easy');
    cy.get('input[id="points_reward"]').clear().type('25');
    cy.get('button[type="submit"]').contains(/create|save/i).click();

    // Step 8: Verify challenge appears
    cy.contains(challengeTitle, { timeout: 10000 }).should('be.visible');

    // Step 9: Mark challenge as complete (or update progress)
    cy.contains(challengeTitle).parents('.challenge-card').within(() => {
      // Try to find a complete button or status toggle
      cy.get('button').contains(/complete|finish|done/i).click({ force: true });
    });

    // Step 10: Verify completion status
    cy.contains(challengeTitle).parents('.challenge-card').within(() => {
      cy.contains(/completed|done/i).should('be.visible');
    });

    // Step 11: Navigate to Progress page to verify updates
    cy.contains('Progress').click();
    cy.url().should('include', '/progress');

    // Step 12: Verify progress bars are visible and showing data
    cy.get('.circular-progress, .linear-progress, .progress-bar').should('be.visible');
    cy.contains(/completed|progress/i).should('be.visible');

    // Step 13: Verify dashboard shows updated stats
    cy.contains('Overview').click();
    cy.url().should('include', '/dashboard');
    cy.contains(goalTitle).should('be.visible');
  });

  it('should allow user to logout and login again', () => {
    // Create a user first
    cy.visit('http://localhost:3002/signup');
    cy.get('input[id="firstName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').contains('Sign Up').click();

    cy.url().should('include', '/dashboard', { timeout: 10000 });

    // Logout
    cy.contains('Logout').click();
    cy.url().should('include', '/login');

    // Login again
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('button[type="submit"]').contains(/sign in|login/i).click();

    // Verify successful login
    cy.url().should('include', '/dashboard', { timeout: 10000 });
    cy.contains('Welcome back').should('be.visible');
  });

  it('should handle goal editing and deletion', () => {
    // Login
    cy.visit('http://localhost:3002/signup');
    cy.get('input[id="firstName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').contains('Sign Up').click();

    cy.url().should('include', '/dashboard', { timeout: 10000 });

    // Go to goals and create one
    cy.contains('Goals').click();
    cy.contains('Create New Goal').click();
    cy.get('input[id="title"]').type('Goal to Edit');
    cy.get('textarea[id="description"]').type('This goal will be edited');
    cy.get('select[id="category"]').select('programming');
    cy.get('button[type="submit"]').contains(/create|save/i).click();

    // Edit the goal
    cy.contains('Goal to Edit').parents('.goal-card').within(() => {
      cy.get('button').contains('⋯').click();
      cy.contains('Edit').click();
    });

    cy.get('input[id="title"]').clear().type('Edited Goal Title');
    cy.get('button[type="submit"]').contains(/save|update/i).click();

    // Verify edit
    cy.contains('Edited Goal Title').should('be.visible');

    // Delete the goal
    cy.contains('Edited Goal Title').parents('.goal-card').within(() => {
      cy.get('button').contains('⋯').click();
      cy.contains('Delete').click();
    });

    // Confirm deletion if there's a confirmation dialog
    cy.on('window:confirm', () => true);

    // Verify deletion
    cy.contains('Edited Goal Title').should('not.exist');
  });
});
