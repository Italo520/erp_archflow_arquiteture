'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { Role } from "@prisma/client"
import { canEditTask } from "@/lib/permissions"

export async function updateStageOrder(projectId: string, updates: { id: string; order: number }[]) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canEditTask(userRole)) {
        return { success: false, error: "Você não tem permissão para reordenar etapas" };
    }

    try {
        await prisma.$transaction(
            updates.map(u => prisma.stage.update({
                where: { id: u.id },
                data: { order: u.order }
            }))
        );
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update stage order", error);
        return { success: false, error: "Falha ao atualizar ordem das etapas: " + error.message };
    }
}

export async function updateStage(stageId: string, projectId: string, data: { name: string }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canEditTask(userRole)) {
        return { success: false, error: "Você não tem permissão para editar etapas" };
    }

    try {
        await prisma.stage.update({
            where: { id: stageId },
            data: { name: data.name }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update stage", error);
        return { success: false, error: "Falha ao atualizar etapa: " + error.message };
    }
}

export async function createStage(projectId: string, data: { name: string, order: number }) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canEditTask(userRole)) {
        return { success: false, error: "Você não tem permissão para criar etapas" };
    }

    try {
        const stage = await prisma.stage.create({
            data: {
                projectId,
                name: data.name,
                order: data.order
            }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, stage };
    } catch (error: any) {
        console.error("Failed to create stage", error);
        return { success: false, error: "Falha ao criar etapa: " + error.message };
    }
}

export async function deleteStage(stageId: string, projectId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Não autorizado" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canEditTask(userRole)) {
        return { success: false, error: "Você não tem permissão para deletar etapas" };
    }

    try {
        await prisma.stage.delete({
            where: { id: stageId }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete stage", error);
        return { success: false, error: "Falha ao deletar etapa. Verifique se existem tarefas vinculadas." };
    }
}
