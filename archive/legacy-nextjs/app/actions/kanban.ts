"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { requireAuth, requireProjectAccess } from "@/lib/server-utils";
import type { ActionResponse } from "@/lib/types/action-response";
import { serializeData } from "@/lib/serialize";

export type { ActionResponse };

export async function getKanbanColumns(projectId?: string): Promise<ActionResponse> {
    try {
        if (!projectId) {
            await requireAuth();
            return { ok: true, success: true, data: [] };
        }

        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        let columns = await prisma.projectKanbanColumn.findMany({
            where: { projectId },
            orderBy: { order: 'asc' }
        });

        // Inicializa colunas padrão do projeto se nenhuma existir (tolerância a falhas)
        if (columns.length === 0) {
            console.log(`INITIALIZING KANBAN: Criando colunas padrão para o projeto ${projectId}...`);
            await prisma.projectKanbanColumn.createMany({
                data: [
                    { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId },
                    { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId },
                    { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId },
                    { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId }
                ]
            });

            columns = await prisma.projectKanbanColumn.findMany({
                where: { projectId },
                orderBy: { order: 'asc' }
            });
        }

        return { ok: true, success: true, data: columns };
    } catch (error: any) {
        console.error("Failed to fetch kanban columns:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao carregar colunas do Kanban: " + error.message };
    }
}

// BUG 7: Assinatura explícita — projectId e title são obrigatórios.
// Removido o bloco de fallback que buscava o primeiro projeto ativo.
export async function createKanbanColumn(
    projectId: string,
    title: string,
    color?: string
): Promise<ActionResponse> {
    try {
        if (!projectId || !title) {
            return { ok: false, success: false, error: "projectId e title são obrigatórios", message: "projectId e title são obrigatórios" };
        }

        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);

        const lastColumn = await prisma.projectKanbanColumn.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' }
        });
        const order = lastColumn ? lastColumn.order + 1 : 0;

        const column = await prisma.projectKanbanColumn.create({
            data: {
                title,
                color: color || 'bg-blue-500',
                order,
                projectId
            }
        });

        // BUG 9: Caminhos padronizados com /dashboard/
        revalidatePath("/dashboard/projects");
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { ok: true, success: true, data: column, message: "Coluna criada com sucesso" };
    } catch (error: any) {
        console.error("Failed to create column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar coluna do Kanban: " + error.message };
    }
}

export async function updateKanbanColumn(id: string, data: { title?: string, color?: string, order?: number }): Promise<ActionResponse> {
    try {
        await requireAuth();

        const existing = await prisma.projectKanbanColumn.findUnique({ where: { id } });
        if (existing) {
            await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR]);
        }

        const column = await prisma.projectKanbanColumn.update({
            where: { id },
            data
        });

        // BUG 9: Caminhos padronizados com /dashboard/
        revalidatePath("/dashboard/projects");
        revalidatePath(`/dashboard/projects/${column.projectId}`);

        return { ok: true, success: true, data: column, message: "Coluna atualizada com sucesso" };
    } catch (error: any) {
        console.error("Failed to update column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar coluna do Kanban: " + error.message };
    }
}

export async function deleteKanbanColumn(id: string): Promise<ActionResponse> {
    try {
        await requireAuth();
        const column = await prisma.projectKanbanColumn.findUnique({ where: { id } });
        if (!column) {
            return { ok: false, success: false, error: "Coluna não encontrada", message: "Coluna não encontrada" };
        }

        const projectId = column.projectId;
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);

        // Move os projetos que estavam com o status apontado para essa coluna para a primeira disponível do projeto
        const firstColumn = await prisma.projectKanbanColumn.findFirst({
            where: {
                projectId,
                id: { not: id }
            },
            orderBy: { order: 'asc' }
        });

        if (firstColumn) {
            await prisma.project.updateMany({
                where: {
                    currentColumnId: id
                },
                data: { currentColumnId: firstColumn.id }
            });
        }

        await prisma.projectKanbanColumn.delete({ where: { id } });

        // BUG 9: Caminhos padronizados com /dashboard/
        revalidatePath("/dashboard/projects");
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { ok: true, success: true, message: "Coluna excluída com sucesso" };
    } catch (error: any) {
        console.error("Failed to delete column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir coluna do Kanban: " + error.message };
    }
}

export async function updateProjectStatus(projectId: string, statusId: string): Promise<ActionResponse> {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);

        let targetColumnId = statusId;
        const canonicalTitles: Record<string, string> = {
            PLANNING: 'Planejamento',
            IN_PROGRESS: 'Em Andamento',
            ON_HOLD: 'Pausado',
            COMPLETED: 'Concluído',
            CANCELLED: 'Cancelado'
        };

        const targetTitle = canonicalTitles[statusId];
        if (targetTitle) {
            const column = await prisma.projectKanbanColumn.findFirst({
                where: { projectId, title: targetTitle }
            });
            if (column) {
                targetColumnId = column.id;
            }
        }

        const project = await prisma.project.update({
            where: { id: projectId },
            data: { currentColumnId: targetColumnId }
        });

        // BUG 9: Caminhos padronizados com /dashboard/
        revalidatePath("/dashboard/projects");
        revalidatePath(`/dashboard/projects/${projectId}`);

        return { ok: true, success: true, data: serializeData(project), message: "Status do projeto atualizado com sucesso" };
    } catch (error: any) {
        console.error("Failed to update project status:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar status do projeto: " + error.message };
    }
}
