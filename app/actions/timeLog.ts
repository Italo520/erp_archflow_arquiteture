"use server";

import { prisma } from "@/lib/prisma";
import { timeLogSchema, updateTimeLogSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth, requireProjectAccess } from "@/lib/server-utils";
import { TimeLogCategory, Role } from "@prisma/client";

// Interface oficial de resposta para Server Actions
export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade
  errors?: Record<string, string[]> | string;
}

// Schema para iniciar um timer - exclui a obrigatoriedade de duration
const startTimeLogSchema = z.object({
    projectId: z.string().uuid(),
    taskId: z.string().uuid().optional().nullable(),
    clientId: z.string().uuid().optional().nullable(),
    category: z.nativeEnum(TimeLogCategory),
    description: z.string().optional(),
    billable: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
});

export async function createTimeLog(data: z.infer<typeof timeLogSchema>): Promise<ActionResponse> {
    const result = timeLogSchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const session = await requireProjectAccess(data.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        const timeLog = await prisma.timeLog.create({
            data: {
                ...result.data,
                userId: session.user.id,
            },
        });

        revalidatePath("/dashboard/time-tracking");
        if (result.data.clientId) revalidatePath(`/dashboard/clients/${result.data.clientId}`);
        return { ok: true, success: true, data: timeLog, message: "Log de tempo criado com sucesso" };
    } catch (error: any) {
        console.error("Failed to create time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar log de tempo." };
    }
}

export async function startTimeLog(data: z.infer<typeof startTimeLogSchema>): Promise<ActionResponse> {
    const result = startTimeLogSchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const session = await requireProjectAccess(data.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        const timeLog = await prisma.timeLog.create({
            data: {
                ...result.data,
                userId: session.user.id,
                date: new Date(),
                startTime: new Date(),
                duration: 0,
            },
        });
        revalidatePath("/dashboard/time-tracking");
        if (result.data.clientId) revalidatePath(`/dashboard/clients/${result.data.clientId}`);
        return { ok: true, success: true, data: timeLog, message: "Cronômetro iniciado com sucesso" };
    } catch (error: any) {
        console.error("Failed to start time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao iniciar cronômetro." };
    }
}

export async function stopTimeLog(id: string): Promise<ActionResponse> {
    try {
        const log = await prisma.timeLog.findUnique({ where: { id } });
        if (!log) return { ok: false, success: false, error: "Time log not found", message: "Log de tempo não encontrado" };
        
        await requireProjectAccess(log.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
        if (log.endTime) return { ok: false, success: false, error: "Timer already stopped", message: "O cronômetro já está parado" };
        if (!log.startTime) return { ok: false, success: false, error: "No start time set for this log", message: "Sem horário de início para este log" };

        const endTime = new Date();
        const startTime = new Date(log.startTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);

        const updatedLog = await prisma.timeLog.update({
            where: { id },
            data: {
                endTime,
                duration: durationHours,
            },
        });

        revalidatePath("/dashboard/time-tracking");
        if (updatedLog.clientId) revalidatePath(`/dashboard/clients/${updatedLog.clientId}`);
        return { ok: true, success: true, data: updatedLog, message: "Cronômetro parado com sucesso" };
    } catch (error: any) {
        console.error("Failed to stop time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao parar cronômetro." };
    }
}

export async function getTimeLogById(id: string): Promise<ActionResponse> {
    try {
        const timeLog = await prisma.timeLog.findUnique({
            where: { id },
        });
        if (!timeLog) return { ok: false, success: false, error: "Time log not found", message: "Log de tempo não encontrado" };
        
        await requireProjectAccess(timeLog.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
        return { ok: true, success: true, data: timeLog };
    } catch (error: any) {
        console.error("Failed to get time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao obter log de tempo." };
    }
}

export async function updateTimeLog(id: string, data: z.infer<typeof updateTimeLogSchema>): Promise<ActionResponse> {
    try {
        const existing = await prisma.timeLog.findUnique({ where: { id } });
        if (!existing) return { ok: false, success: false, error: "Not found", message: "Log não encontrado" };
        
        await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        const result = updateTimeLogSchema.safeParse({ ...data, id });
        if (!result.success) {
            const errs = result.error.flatten().fieldErrors;
            return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
        }

        const timeLog = await prisma.timeLog.update({
            where: { id },
            data: result.data,
        });

        revalidatePath("/dashboard/time-tracking");
        if (timeLog.clientId) revalidatePath(`/dashboard/clients/${timeLog.clientId}`);
        return { ok: true, success: true, data: timeLog, message: "Log de tempo atualizado com sucesso" };
    } catch (error: any) {
        console.error("Failed to update time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar log de tempo." };
    }
}

export async function deleteTimeLog(id: string): Promise<ActionResponse> {
    try {
        const existing = await prisma.timeLog.findUnique({ where: { id } });
        if (!existing) return { ok: false, success: false, error: "Not found", message: "Log não encontrado" };
        
        await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        const timeLog = await prisma.timeLog.delete({
            where: { id },
        });
        revalidatePath("/dashboard/time-tracking");
        if (timeLog.clientId) revalidatePath(`/dashboard/clients/${timeLog.clientId}`);
        return { ok: true, success: true, message: "Log de tempo excluído com sucesso" };
    } catch (error: any) {
        console.error("Failed to delete time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir log de tempo." };
    }
}

export async function listTimeLogs(
    page: number = 1,
    limit: number = 20,
    filters?: { projectId?: string; clientId?: string; startDate?: string; endDate?: string }
): Promise<ActionResponse> {
    try {
        const session = await requireAuth();
        const skip = (page - 1) * limit;
        const where: any = { userId: session.user.id };

        if (filters?.projectId) where.projectId = filters.projectId;
        if (filters?.clientId) where.clientId = filters.clientId;
        if (filters?.startDate && filters?.endDate) {
            where.date = {
                gte: new Date(filters.startDate),
                lte: new Date(filters.endDate),
            };
        }

        const [logs, total] = await prisma.$transaction([
            prisma.timeLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: "desc" },
                include: {
                    project: { select: { name: true } },
                    client: { select: { name: true } },
                },
            }),
            prisma.timeLog.count({ where }),
        ]);

        return {
            ok: true,
            success: true,
            data: {
                logs,
                metadata: { total, page, totalPages: Math.ceil(total / limit) },
            }
        };
    } catch (error: any) {
        console.error("Failed to list time logs:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao listar logs de tempo." };
    }
}

export async function calculateBillableHours(projectId: string): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);

        const aggregation = await prisma.timeLog.aggregate({
            _sum: {
                duration: true,
            },
            where: {
                projectId,
                billable: true,
            },
        });

        return { ok: true, success: true, data: { totalBillableHours: aggregation._sum.duration || 0 } };
    } catch (error: any) {
        console.error("Failed to calculate billable hours:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao calcular horas faturáveis." };
    }
}

export async function getRunningTimeLog(): Promise<ActionResponse> {
    try {
        const session = await requireAuth();

        const timeLog = await prisma.timeLog.findFirst({
            where: {
                userId: session.user.id,
                endTime: null,
            },
            include: {
                project: { select: { name: true, id: true } },
                client: { select: { name: true, id: true } },
            },
        });

        if (!timeLog) return { ok: true, success: true, data: null };
        return { ok: true, success: true, data: timeLog };
    } catch (error: any) {
        console.error("Failed to get running time log:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao obter cronômetro ativo." };
    }
}
