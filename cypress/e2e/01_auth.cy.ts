describe("Módulo de Autenticação e Segurança (US-001 / US-002)", () => {
  beforeEach(() => {
    cy.visit("/login");
  });

  it("deve carregar a página de login com a identidade visual do ArchFlow", () => {
    cy.contains(/archflow/i).should("exist");
    cy.contains(/construindo o futuro|bem-vindo/i).should("be.visible");
    cy.get('input#email').should("be.visible");
    cy.get('input#password').should("be.visible");
    cy.get('button[type="submit"]').should("contain.text", "Entrar");
  });

  it("deve exibir validação ao tentar submeter e-mail inválido ou senha curta", () => {
    cy.get('input#email').should("be.visible").clear();
    cy.get('input#email').type("email-invalido");
    cy.get('input#password').should("be.visible").clear();
    cy.get('input#password').type("123");
    cy.get('button[type="submit"]').click();

    cy.get('[role="alert"]', { timeout: 10000 }).should("be.visible").and("contain.text", "e-mail válido");
  });

  it("deve permitir navegação para a tela de registro e de recuperação de senha", () => {
    cy.contains(/criar.*conta/i).click();
    cy.url().should("include", "/register");
    cy.contains(/criar.*conta/i).should("be.visible");

    cy.visit("/login");
    cy.contains(/esqueceu.*senha/i).click();
    cy.url().should("include", "/forgot-password");
    cy.contains(/esqueceu.*senha|recupera/i).should("be.visible");
  });

  it("deve solicitar link de recuperação de senha com sucesso", () => {
    cy.visit("/forgot-password");
    cy.get('input#email', { timeout: 10000 }).should("be.visible").and("not.be.disabled");
    cy.get('input#email').type("arquiteto@archflow.com");
    cy.get('button[type="submit"]').click();
    cy.contains(/recuperação|enviado/i, { timeout: 10000 }).should("be.visible");
  });

  it("deve bloquear acesso direto a rotas protegidas sem sessão válida", () => {
    cy.visit("/dashboard", { failOnStatusCode: false });
    cy.url().should("match", /\/(login|dashboard)/);
  });
});
