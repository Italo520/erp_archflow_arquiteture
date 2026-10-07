import { createInspectionSchema, punchListItemSchema, resolvePunchListItemSchema } from "@/lib/validations/inspection";

describe("Inspection Zod Schemas", () => {
  it("valida criacao de vistoria com dados validos", () => {
    const validData = {
      title: "Vistoria #01 - Conferência Elétrica",
      date: new Date().toISOString(),
      weatherCondition: "Ensolarado",
      generalNotes: "Obra dentro do cronograma"
    };
    const result = createInspectionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejeita titulo vazio na vistoria", () => {
    const invalidData = { title: "" };
    const result = createInspectionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("valida criacao de item de pendencia", () => {
    const validItem = {
      environment: "Cozinha",
      contractorTrade: "Marmoraria",
      contractorName: "Marmoraria Estrela",
      description: "Saia da bancada desnivelada",
      severity: "HIGH"
    };
    const result = punchListItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("valida resolucao de pendencia", () => {
    const validResolve = {
      resolutionNotes: "Bancada repolida e nivelada"
    };
    const result = resolvePunchListItemSchema.safeParse(validResolve);
    expect(result.success).toBe(true);
  });
});
