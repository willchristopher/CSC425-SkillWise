// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

// Login command
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Create goal command
Cypress.Commands.add('createGoal', (goalData) => {
  cy.visit('/goals');
  cy.contains('Create New Goal').click();
  cy.get('input[name="title"]').type(goalData.title);
  if (goalData.description) {
    cy.get('textarea[name="description"]').type(goalData.description);
  }
  if (goalData.type) {
    cy.get('select[name="type"]').select(goalData.type);
  }
  if (goalData.target_date) {
    cy.get('input[name="target_date"]').type(goalData.target_date);
  }
  cy.get('button[type="submit"]').click();
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});
