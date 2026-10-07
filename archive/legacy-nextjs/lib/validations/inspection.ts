import { z } from "zod";

export const createInspectionSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  date: z.string().optional().or(z.date().optional()),
  weatherCondition: z.string().optional().nullable(),
  generalNotes: z.string().optional().nullable()
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

export const punchListItemSchema = z.object({
  environment: z.string().min(2, "Ambiente é obrigatório"),
  contractorTrade: z.string().min(2, "Especialidade é obrigatória"),
  contractorName: z.string().optional().nullable(),
  description: z.string().min(3, "Descrição é obrigatória"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable()
});

export type PunchListItemInput = z.infer<typeof punchListItemSchema>;

export const resolvePunchListItemSchema = z.object({
  resolutionNotes: z.string().min(2, "Observação de resolução é obrigatória")
});

export type ResolvePunchListItemInput = z.infer<typeof resolvePunchListItemSchema>;
