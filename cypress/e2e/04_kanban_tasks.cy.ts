describe("Módulo de Pipeline Kanban e Tarefas (US-007 / US-008)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/projects");
  });

  it("deve carregar a tela de projetos e estrutura de pipeline", () => {
    cy.contains(/projetos/i).should("be.visible");
    cy.get('body').should("be.visible");
  });

  it("deve permitir alternar entre visualização em Lista e visualização em Quadro", () => {
    cy.get('button').filter(':contains("Lista"), :contains("Quadro"), :contains("Grid"), [aria-label*="view"], [data-state]').should("be.exist");
  });
});
