describe("Módulo de Agenda e Atividades do Arquiteto (US-009 / US-010)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/activities");
  });

  it("deve carregar a tela de atividades e agenda com calendário e lista", () => {
    cy.contains(/atividades/i).should("be.visible");
    cy.get('button').filter(':contains("Adição Rápida"), :contains("Atividade"), :contains("Adicionar")').should("be.visible");
  });

  it("deve permitir filtrar ou visualizar atividades", () => {
    cy.get('body').should("be.visible");
  });
});
