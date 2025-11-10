// ***********************************************
// Custom commands for Cypress E2E tests
// ***********************************************

// Custom command to login
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"], input[type="email"]').type(email);
  cy.get('input[name="password"], input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for navigation after login
  cy.url().should('not.include', '/login');
});

// Custom command to register a new user
Cypress.Commands.add('register', (userData) => {
  cy.visit('/signup');
  cy.get('input[name="firstName"]').type(userData.firstName);
  cy.get('input[name="lastName"]').type(userData.lastName);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  cy.get('input[name="confirmPassword"]').type(userData.confirmPassword);
  cy.get('button[type="submit"]').click();
  
  // Wait for successful registration
  cy.url().should('not.include', '/signup');
});

// Custom command to logout
Cypress.Commands.add('logout', () => {
  cy.get('button').contains(/logout|sign out/i).click();
  cy.url().should('include', '/login');
});

// Custom command to create a goal
Cypress.Commands.add('createGoal', (goalData) => {
  cy.visit('/goals');
  cy.contains('button', /create|new goal/i).click();
  
  // Fill out goal form
  cy.get('input[name="title"]').type(goalData.title);
  if (goalData.description) {
    cy.get('textarea[name="description"], input[name="description"]').type(goalData.description);
  }
  if (goalData.category) {
    cy.get('select[name="category"]').select(goalData.category);
  }
  if (goalData.difficulty) {
    cy.get('select[name="difficulty"]').select(goalData.difficulty);
  }
  
  cy.get('button[type="submit"]').contains(/create|save/i).click();
  
  // Wait for goal creation
  cy.contains(goalData.title).should('be.visible');
});

// Custom command to intercept API calls
Cypress.Commands.add('interceptAPI', (method, url, alias, response) => {
  cy.intercept(method, url, response).as(alias);
});

// Custom command to wait for API call
Cypress.Commands.add('waitForAPI', (alias) => {
  cy.wait(`@${alias}`);
});
