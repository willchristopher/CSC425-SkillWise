/* eslint-env cypress/globals */
/* eslint-disable no-undef */
// ***********************************************
// Custom commands for Cypress tests
// ***********************************************

// API Login command - more reliable than UI login
Cypress.Commands.add(
  'loginViaAPI',
  (email = 'test@example.com', password = 'TestPassword123!') => {
    cy.request({
      method: 'POST',
      url: 'http://localhost:3001/api/auth/login',
      body: { email, password },
      failOnStatusCode: false,
    }).then((response) => {
      if (
        response.status === 200 &&
        response.body.data &&
        response.body.data.accessToken
      ) {
        window.localStorage.setItem(
          'accessToken',
          response.body.data.accessToken
        );
      }
    });
  }
);

// UI Login command (for tests that need to verify login UI)
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard', { timeout: 10000 });
});

// Create goal command with API intercept
Cypress.Commands.add('createGoal', (goalData) => {
  // Intercept the API call
  cy.intercept('POST', '/api/goals').as('createGoal');

  cy.visit('/goals');
  cy.contains('Create New Goal', { timeout: 10000 }).click();

  cy.get('input[name="title"]', { timeout: 5000 }).clear().type(goalData.title);
  if (goalData.description) {
    cy.get('textarea[name="description"]').clear().type(goalData.description);
  }
  if (goalData.type) {
    cy.get('select[name="type"]').select(goalData.type);
  }
  if (goalData.target_date) {
    cy.get('input[name="target_date"]').type(goalData.target_date);
  }

  cy.get('button[type="submit"]')
    .contains(/Create Goal|Save/i)
    .click();

  // Wait for API response
  cy.wait('@createGoal', { timeout: 10000 });
});

// Create goal via API (for faster test setup)
Cypress.Commands.add('createGoalViaAPI', (goalData) => {
  const token = window.localStorage.getItem('accessToken');

  cy.request({
    method: 'POST',
    url: 'http://localhost:3001/api/goals',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: goalData,
  }).then((response) => {
    return response.body.data;
  });
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Logout').click();
  cy.url().should('include', '/login');
});
