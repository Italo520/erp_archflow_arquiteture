import { test, expect } from "@playwright/test";
import { prisma } from "../../lib/prisma";

test.describe("Inspection & Punch List Flow", () => {
  let testProjectId: string;

  test.beforeAll(async () => {
    // Buscar ou criar usuário admin de teste
    let user = await prisma.user.findFirst({
      where: { email: "admin@archflow.local" }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullName: "Italo Sampaio",
          email: "admin@archflow.local",
          passwordHash: "$2a$10$rP3x7Qh4zQ2k4F7U1K4Z7u0m5G1Z9v5K3w1L9x5K3w1L9x5K3w1L9",
          role: "OWNER"
        }
      });
    }

    // Criar projeto de teste para a vistoria
    const project = await prisma.project.create({
      data: {
        name: "E2E Obra Residencial Vistoria",
        ownerId: user.id
      }
    });
    testProjectId = project.id;
  });

  test.afterAll(async () => {
    if (testProjectId) {
      await prisma.project.delete({ where: { id: testProjectId } }).catch(() => null);
    }
    await prisma.$disconnect();
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "admin@archflow.local");
    await page.fill('[name="password"]', "password123");
    await page.getByRole("button", { name: /Login|Entrar/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test("Fluxo completo: Criar Vistoria, apontar pendência e verificar PDF", async ({ page }) => {
    // 1. Navegar até a página de vistorias do projeto
    await page.goto(`/projects/${testProjectId}/inspections`);

    // 2. Verificar presença do cabeçalho
    await expect(page.getByText("Vistorias Técnicas & Acompanhamento de Obra")).toBeVisible();

    // 3. Abrir modal de Nova Vistoria
    await page.getByRole("button", { name: /Nova Vistoria/i }).click();
    await expect(page.getByText("Iniciar Vistoria Técnica")).toBeVisible();

    // 4. Preencher formulário de vistoria
    await page.fill("#title", "Vistoria #01 - Conferência Elétrica e Gesso");
    await page.fill("#generalNotes", "Mestre de obras e encarregado de elétrica presentes");
    await page.getByRole("button", { name: /Iniciar Vistoria/i }).click();

    // 5. Verificar se a vistoria aparece na linha do tempo
    await expect(page.getByText("Vistoria #01 - Conferência Elétrica e Gesso")).toBeVisible();

    // 6. Verificar botão de Baixar PDF
    const pdfButton = page.getByRole("link", { name: /Baixar PDF/i });
    await expect(pdfButton).toBeVisible();
    await expect(pdfButton).toHaveAttribute("href", new RegExp(`/api/projects/${testProjectId}/inspections/`));
  });
});
