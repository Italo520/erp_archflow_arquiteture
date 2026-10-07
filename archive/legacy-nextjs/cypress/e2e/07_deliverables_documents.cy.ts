describe("Módulo de Entregáveis e Documentos Arquitetônicos (US-013 / US-014)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/documents");
  });

  it("deve carregar a tela de documentos e entregáveis com opções de upload e filtros", () => {
    cy.contains(/documentos/i).should("be.visible");
    cy.get('button').filter(':contains("Adicionar"), :contains("Lixeira")').should("be.visible");
  });

  it("deve exibir estados de aprovação e versionamento de arquivos", () => {
    cy.contains(/arquivos|aprovados|revisão/i).should("be.visible");
  });
});
