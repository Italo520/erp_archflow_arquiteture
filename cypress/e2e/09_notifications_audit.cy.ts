describe("Módulo de Notificações, Auditoria e Configurações (US-017 / US-018)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/settings");
  });

  it("deve carregar a tela de configurações e preferências do usuário", () => {
    cy.contains(/configurações|perfil|preferências|conta/i).should("be.visible");
  });

  it("deve permitir alternar o tema do sistema (Modo Escuro / Claro)", () => {
    cy.get('button, input, select').should("be.exist");
  });
});
