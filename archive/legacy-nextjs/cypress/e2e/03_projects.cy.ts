describe("Módulo de Gestão de Projetos Arquitetônicos (US-005 / US-006)", () => {
  beforeEach(() => {
    cy.setMockSession();
    cy.visit("/projects");
  });

  it("deve carregar a página de projetos com visualização em Grid/Kanban", () => {
    cy.contains(/projetos/i).should("be.visible");
    cy.contains(/novo projeto/i).should("be.exist");
  });

  it("deve navegar para a tela de criação de projeto ao clicar em 'Novo Projeto'", () => {
    cy.get('a[href="/projects/new"]').first().click();
    cy.url().should("include", "/projects/new");
    cy.get('h1').contains(/novo projeto/i).should("be.visible");
  });

  it("deve exibir filtros de status e busca de projetos", () => {
    cy.get('input[placeholder*="Buscar"]').should("be.exist");
  });
});
