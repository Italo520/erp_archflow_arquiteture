// ***********************************************************
// This example support/e2e.ts is processed and loaded automatically before your test files.
// ***********************************************************

import "./commands";

// Prevent Cypress from failing tests when Next.js hydration or unhandled exceptions occur
Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("Minified React error") ||
    err.message.includes("NEXT_REDIRECT")
  ) {
    return false;
  }
  return false;
});
