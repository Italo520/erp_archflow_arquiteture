/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via UI
       */
      login(email?: string, password?: string): Chainable<void>;
      /**
       * Custom command to inject authenticated session state
       */
      setMockSession(user?: { name: string; email: string; role: string; id: string }): Chainable<void>;
    }
  }
}

Cypress.Commands.add("login", (email = "admin@archflow.local", password = "password123") => {
  cy.visit("/login");
  cy.get('input#email, input[name="email"]').type(email);
  cy.get('input#password, input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add("setMockSession", (user = {
  name: "Italo Sampaio",
  email: "admin@archflow.local",
  role: "OWNER",
  id: "user-test-owner"
}) => {
  cy.intercept('GET', '/api/auth/session', {
    statusCode: 200,
    body: {
      user: {
        id: user.id || "user-test-owner",
        name: user.name || "Italo Sampaio",
        email: user.email || "admin@archflow.local",
        role: user.role || "OWNER"
      },
      expires: new Date(Date.now() + 24 * 3600 * 1000).toISOString()
    }
  });

  cy.setCookie('authjs.session-token', 'mock-session-token-archflow', { path: '/' });
  cy.setCookie('next-auth.session-token', 'mock-session-token-archflow', { path: '/' });
});

export {};
