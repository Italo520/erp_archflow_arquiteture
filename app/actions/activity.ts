"use server";

import { prisma } from "@/lib/prisma";
import { activitySchema, updateActivitySchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/server-utils";
import { ActivityStatus } from "@prisma/client";

// Interface oficial unificada
export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade
  errors?: Record<string, string[]> | string;
}

export async function createActivity(data: z.infer<typeof activitySchema>): Promise<ActionResponse> {
    const result = activitySchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const session = await requireAuth();
        const activity = await prisma.activity.create({
            data: {
                ...result.data,
                createdById: session.user.id,
            },
        });

        // Reatividade: atualiza o engajamento do cliente
        if (result.data.clientId) {
            await prisma.client.update({
                where: { id: result.data.clientId },
                data: { lastInteractionAt: new Date() }
            });
            revalidatePath(`/dashboard/clients/${result.data.clientId}`);
        }

        revalidatePath("/dashboard/activities");
        return { ok: true, success: true, data: activity, message: "Atividade criada com sucesso" };
    } catch (error: any) {
        console.error("Failed to create activity:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar atividade." };
    }
}

export async function getActivityById(id: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const activity = await prisma.activity.findUnique({
            where: { id },
            include: {
                client: true,
                project: true,
                createdBy: { select: { id: true, fullName: true, email: true } },
            },
        });
        if (!activity) return { ok: false, success: false, error: "Activity not found", message: "Atividade não encontrada" };
        return { ok: true, success: true, data: activity };
    } catch (error: any) {
        console.error("Failed to get activity:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao carregar atividade." };
    }
}

export async function updateActivity(id: string, data: z.infer<typeof updateActivitySchema>): Promise<ActionResponse> {
    const result = updateActivitySchema.safeParse({ ...data, id });
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        await requireAuth();
        const activity = await prisma.activity.update({
            where: { id },
            data: result.data,
        });

        // Reatividade: atualiza o engajamento do cliente
        if (activity.clientId) {
            await prisma.client.update({
                where: { id: activity.clientId },
                data: { lastInteractionAt: new Date() }
            });
            revalidatePath(`/dashboard/clients/${activity.clientId}`);
        }

        revalidatePath("/dashboard/activities");
        return { ok: true, success: true, data: activity, message: "Atividade atualizada com sucesso" };
    } catch (error: any) {
        console.error("Failed to update activity:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar atividade." };
    }
}

export async function deleteActivity(id: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const activity = await prisma.activity.delete({
            where: { id },
        });
        revalidatePath("/dashboard/activities");
        if (activity.clientId) revalidatePath(`/dashboard/clients/${activity.clientId}`);
        return { ok: true, success: true, message: "Atividade excluída com sucesso" };
    } catch (error: any) {
        console.error("Failed to delete activity:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir atividade." };
    }
}

export async function completeActivity(id: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const activity = await prisma.activity.update({
            where: { id },
            data: { status: ActivityStatus.COMPLETED },
        });

        // Reatividade: atualiza o engajamento do cliente
        if (activity.clientId) {
            await prisma.client.update({
                where: { id: activity.clientId },
                data: { lastInteractionAt: new Date() }
            });
            revalidatePath(`/dashboard/clients/${activity.clientId}`);
        }

        revalidatePath("/dashboard/activities");
        return { ok: true, success: true, data: activity, message: "Atividade concluída com sucesso" };
    } catch (error: any) {
        console.error("Failed to complete activity:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao marcar atividade como concluída." };
    }
}

export async function addParticipant(id: string, participantName: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const activity = await prisma.activity.findUnique({ where: { id }, select: { participants: true } });
        if (!activity) return { ok: false, success: false, error: "Activity not found", message: "Atividade não encontrada" };

        const updatedParticipants = [...(activity.participants || []), participantName];
        const uniqueParticipants = Array.from(new Set(updatedParticipants));

        const updatedActivity = await prisma.activity.update({
            where: { id },
            data: { participants: uniqueParticipants },
        });

        revalidatePath("/dashboard/activities");
        return { ok: true, success: true, data: updatedActivity, message: "Participante adicionado com sucesso" };
    } catch (error: any) {
        console.error("Failed to add participant:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao adicionar participante." };
    }
}

export async function removeParticipant(id: string, participantName: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const activity = await prisma.activity.findUnique({ where: { id }, select: { participants: true } });
        if (!activity) return { ok: false, success: false, error: "Activity not found", message: "Atividade não encontrada" };

        const updatedParticipants = (activity.participants || []).filter(p => p !== participantName);

        const updatedActivity = await prisma.activity.update({
            where: { id },
            data: { participants: updatedParticipants },
        });

        revalidatePath("/dashboard/activities");
        return { ok: true, success: true, data: updatedActivity, message: "Participante removido com sucesso" };
    } catch (error: any) {
        console.error("Failed to remove participant:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao remover participante." };
    }
}

export async function listActivities(
    filters?: { clientId?: string; projectId?: string; type?: string; date?: string },
    page: number = 1,
    limit: number = 20
): Promise<ActionResponse> {
    try {
        await requireAuth();
        const skip = (page - 1) * limit;

        const where: any = {};
        if (filters?.clientId) where.clientId = filters.clientId;
        if (filters?.projectId) where.projectId = filters.projectId;
        if (filters?.type) where.type = filters.type;
        if (filters?.date) {
            const date = new Date(filters.date);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            where.startTime = {
                gte: date,
                lt: nextDate,
            };
        }

        const [activities, total] = await prisma.$transaction([
            prisma.activity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { startTime: "desc" },
                include: {
                    client: { select: { id: true, name: true } },
                    project: { select: { id: true, name: true } },
                    createdBy: { select: { fullName: true } },
                },
            }),
            prisma.activity.count({ where }),
        ]);

        return {
            ok: true,
            success: true,
            data: activities,
            metadata: { total, page, totalPages: Math.ceil(total / limit) }
        } as any;
    } catch (error: any) {
        console.error("Failed to list activities:", error);
        return { ok: false, success: false, error: error.message, message: "Failed to list activities." };
    }
}
