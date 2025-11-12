// ***********************************************
// Custom commands for Cypress
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('button[type="submit"]').contains(/sign in|login/i).click();
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// Signup command
Cypress.Commands.add('signup', (firstName, lastName, email, password) => {
  cy.visit('/signup');
  cy.get('input[id="firstName"]').type(firstName);
  cy.get('input[id="lastName"]').type(lastName);
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('input[id="confirmPassword"]').type(password);
  cy.get('button[type="submit"]').contains('Sign Up').click();
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// Create goal command
Cypress.Commands.add('createGoal', (title, description, category = 'programming') => {
  cy.contains('Goals').click();
  cy.contains('Create New Goal').click();
  cy.get('input[id="title"]').type(title);
  cy.get('textarea[id="description"]').type(description);
  cy.get('select[id="category"]').select(category);
  cy.get('button[type="submit"]').contains(/create|save/i).click();
  cy.contains(title, { timeout: 10000 }).should('be.visible');
});

// Create challenge command
Cypress.Commands.add('createChallenge', (title, description, category = 'programming') => {
  cy.contains('Challenges').click();
  cy.contains('Create New Challenge').click();
  cy.get('input[id="title"]').type(title);
  cy.get('textarea[id="description"]').type(description);
  cy.get('select[id="category"]').select(category);
  cy.get('button[type="submit"]').contains(/create|save/i).click();
  cy.contains(title, { timeout: 10000 }).should('be.visible');
});
