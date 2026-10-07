describe("Módulo de Planejamento Financeiro e Relatórios (US-015 / US-016)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/reports");
  });

  it("deve carregar a tela de relatórios com gráficos e opções de exportação", () => {
    cy.contains(/relatórios/i).should("be.visible");
    cy.contains(/negócio|produtividade|financeiro/i).should("be.visible");
  });

  it("deve exibir botão para exportar relatórios", () => {
    cy.contains("button", /exportar/i).should("be.visible");
  });
});
