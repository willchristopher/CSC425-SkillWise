describe('Challenge workflow', () => {
  it('logs in, creates goal, adds challenge, marks complete', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('testuser@example.com');
    cy.get('input[name="password"]').type('password');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Add Goal').click();
    cy.get('input[name="title"]').type('My Goal');
    cy.get('textarea[name="description"]').type('Goal description');
    cy.get('button[type="submit"]').click();
    cy.contains('Add Challenge').click();
    cy.get('input[name="title"]').type('My Challenge');
    cy.get('textarea[name="description"]').type('Challenge description');
    cy.get('button[type="submit"]').click();
    cy.contains('Mark Complete').click();
    cy.contains('Completed').should('exist');
  });
});
