describe("Módulo de CRM e Gestão de Clientes (US-003 / US-004)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/clients");
  });

  it("deve carregar a página de clientes com cabeçalho, botões e filtros", () => {
    cy.contains(/clientes/i).should("be.visible");
    cy.contains(/novo cliente/i).should("be.visible");
    cy.get('input[placeholder="Buscar clientes..."]').should("be.exist");
  });

  it("deve navegar para a tela de cadastro de novo cliente ao clicar em 'Novo Cliente'", () => {
    cy.contains(/novo cliente/i).click();
    cy.url().should("include", "/clients/new");
    cy.contains(/novo cliente/i).should("be.visible");
  });

  it("deve exibir campo para busca de clientes", () => {
    cy.get('input[placeholder="Buscar clientes..."]').should("be.visible");
  });

  it("deve permitir exportação da lista de clientes", () => {
    cy.get('button').contains(/exportar/i).should("be.exist");
  });
});
