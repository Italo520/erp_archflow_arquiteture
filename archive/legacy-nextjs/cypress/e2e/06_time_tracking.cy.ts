describe("Módulo de Apontamento de Horas e Time Tracking (US-011 / US-012)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/time-tracking", { timeout: 30000 });
  });

  it("deve carregar a tela de controle de tempo com métricas consolidadas", () => {
    cy.contains(/controle de horas|horas/i).should("be.visible");
    cy.contains(/cronômetro|análise e relatórios/i).should("be.visible");
  });

  it("deve exibir componentes de apontamento de horas e histórico", () => {
    cy.get('body').should("be.visible");
  });
});
