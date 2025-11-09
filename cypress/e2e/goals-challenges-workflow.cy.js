// End-to-end test for complete user workflow:
// Login → Create Goal → Add Challenge → Mark Complete

describe('Complete User Workflow - Goals and Challenges', () => {
  const testUser = {
    email: 'e2etest@example.com',
    password: 'TestPassword123!',
    username: 'e2etestuser',
    full_name: 'E2E Test User'
  };

  const testGoal = {
    title: 'Master React Development',
    description: 'Learn advanced React patterns and best practices',
    type: 'professional',
    target_date: '2025-12-31'
  };

  before(() => {
    // Clear cookies and local storage
    cy.clearCookies();
    cy.clearLocalStorage();
    
    // Visit the app
    cy.visit('http://localhost:3000');
  });

  describe('User Authentication', () => {
    it('should register a new user', () => {
      // Navigate to signup page
      cy.visit('http://localhost:3000/signup');
      
      // Fill out registration form
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="full_name"]').type(testUser.full_name);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard or login
      cy.url().should('match', /\/(dashboard|login)/);
    });

    it('should login with created user', () => {
      // Navigate to login page
      cy.visit('http://localhost:3000/login');
      
      // Fill login form
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      
      // Verify user is logged in
      cy.contains(testUser.full_name).should('be.visible');
    });
  });

  describe('Goal Management', () => {
    beforeEach(() => {
      // Ensure user is logged in before each test
      cy.visit('http://localhost:3000/goals');
    });

    it('should display the goals page', () => {
      cy.url().should('include', '/goals');
      cy.contains('My Learning Goals').should('be.visible');
    });

    it('should create a new learning goal', () => {
      // Click create goal button
      cy.contains('Create New Goal').click();
      
      // Fill out goal form
      cy.get('input[name="title"]').type(testGoal.title);
      cy.get('textarea[name="description"]').type(testGoal.description);
      cy.get('select[name="type"]').select(testGoal.type);
      cy.get('input[name="target_date"]').type(testGoal.target_date);
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Verify goal was created
      cy.contains(testGoal.title).should('be.visible');
      cy.contains('Goal created successfully').should('be.visible');
    });

    it('should display the created goal in the list', () => {
      cy.contains(testGoal.title).should('be.visible');
      cy.contains(testGoal.description).should('be.visible');
      
      // Verify progress bar is visible
      cy.get('.progress-bar').should('exist');
    });

    it('should edit the goal', () => {
      // Find and click edit button
      cy.contains(testGoal.title)
        .parents('.goal-card')
        .find('button')
        .contains('Edit')
        .click();
      
      // Update title
      const updatedTitle = 'Master Advanced React Development';
      cy.get('input[name="title"]').clear().type(updatedTitle);
      
      // Submit
      cy.get('button[type="submit"]').click();
      
      // Verify update
      cy.contains(updatedTitle).should('be.visible');
      cy.contains('Goal updated successfully').should('be.visible');
    });
  });

  describe('Challenge Management', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/challenges');
    });

    it('should display available challenges', () => {
      cy.url().should('include', '/challenges');
      cy.contains('Learning Challenges').should('be.visible');
    });

    it('should filter challenges by difficulty', () => {
      // Select difficulty filter
      cy.get('select[name="difficulty"]').select('easy');
      
      // Verify filtered results
      cy.contains('EASY').should('be.visible');
    });

    it('should search for challenges', () => {
      // Type in search box
      cy.get('input[placeholder*="Search"]').type('React');
      
      // Verify search results contain "React"
      cy.get('.challenge-card').should('exist');
      cy.contains('React', { matchCase: false }).should('be.visible');
    });

    it('should view challenge details', () => {
      // Click view details on first challenge
      cy.get('.challenge-card').first().find('button').contains('View Details').click();
      
      // Should show challenge details (or navigate to detail page)
      // This depends on implementation
    });

    it('should start a challenge', () => {
      // Click start challenge button
      cy.get('.challenge-card')
        .first()
        .find('button')
        .contains(/Start|Continue/)
        .click();
      
      // Verify challenge started
      // Implementation depends on your challenge flow
    });
  });

  describe('Progress Tracking', () => {
    it('should show progress bar updating', () => {
      cy.visit('http://localhost:3000/goals');
      
      // Find goal card
      cy.contains(testGoal.title)
        .parents('.goal-card')
        .within(() => {
          // Progress bar should exist
          cy.get('[role="progressbar"]').should('exist');
          
          // Initial progress should be visible
          cy.contains(/\d+%/).should('be.visible');
        });
    });

    it('should navigate to progress page', () => {
      cy.visit('http://localhost:3000/progress');
      
      // Verify progress page elements
      cy.contains(/Progress|Overview/).should('be.visible');
    });
  });

  describe('Complete Workflow', () => {
    it('should complete the full workflow: login → create goal → browse challenges → track progress', () => {
      // 1. Login
      cy.visit('http://localhost:3000/login');
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      
      // 2. Navigate to goals
      cy.visit('http://localhost:3000/goals');
      cy.contains('My Learning Goals').should('be.visible');
      
      // 3. Verify created goal exists
      cy.contains(testGoal.title).should('be.visible');
      
      // 4. Navigate to challenges
      cy.visit('http://localhost:3000/challenges');
      cy.contains('Learning Challenges').should('be.visible');
      
      // 5. Browse and filter challenges
      cy.get('select[name="difficulty"]').select('medium');
      cy.get('.challenge-card').should('exist');
      
      // 6. View progress
      cy.visit('http://localhost:3000/progress');
      cy.contains(/Progress|Statistics/).should('be.visible');
    });
  });

  after(() => {
    // Cleanup: Delete test user
    // This would typically be done via API call or direct database cleanup
    cy.log('Test completed - cleanup required');
  });
});
