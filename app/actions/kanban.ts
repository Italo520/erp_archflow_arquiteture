"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade
  errors?: Record<string, string[]> | string;
}

export async function getKanbanColumns(projectId?: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    if (!projectId) {
        return { ok: true, success: true, data: [] };
    }

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        
        let columns = await model.findMany({
            where: { projectId },
            orderBy: { order: 'asc' }
        });

        // Inicializa colunas padrão do projeto se nenhuma existir (tolerância a falhas)
        if (columns.length === 0) {
            console.log(`INITIALIZING KANBAN: Criando colunas padrão para o projeto ${projectId}...`);
            const defaultCols = [
                { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId },
                { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId },
                { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId },
                { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId }
            ];

            for (const col of defaultCols) {
                await model.create({ data: col });
            }

            columns = await model.findMany({
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

export async function createKanbanColumn(projectIdOrTitle: string, title?: string, color?: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    let projectId: string;
    let columnTitle: string;

    if (title === undefined) {
        // Chamada antiga com 1 argumento do frontend legil: createKanbanColumn(title)
        columnTitle = projectIdOrTitle;
        // Tenta obter o primeiro projeto ativo no banco de dados para associar
        const firstProj = await (prisma as any).project.findFirst({ where: { deletedAt: null } });
        if (!firstProj) {
            return { ok: false, success: false, error: "Nenhum projeto ativo encontrado para associar esta coluna", message: "Nenhum projeto ativo encontrado para associar esta coluna" };
        }
        projectId = firstProj.id;
    } else {
        // Chamada nova com 2-3 argumentos: createKanbanColumn(projectId, title, color)
        projectId = projectIdOrTitle;
        columnTitle = title;
    }

    if (!projectId || !columnTitle) {
        return { ok: false, success: false, error: "ID do projeto e título são obrigatórios", message: "ID do projeto e título da coluna são obrigatórios" };
    }

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        
        const lastColumn = await model.findFirst({
            where: { projectId },
            orderBy: { order: 'desc' }
        });
        const order = lastColumn ? lastColumn.order + 1 : 0;

        const column = await model.create({
            data: {
                title: columnTitle,
                color: color || 'bg-blue-500',
                order,
                projectId
            }
        });

        revalidatePath("/projects");
        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/");
        
        return { ok: true, success: true, data: column, message: "Coluna criada com sucesso" };
    } catch (error: any) {
        console.error("Failed to create column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar coluna do Kanban: " + error.message };
    }
}

export async function updateKanbanColumn(id: string, data: { title?: string, color?: string, order?: number }): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        const column = await model.update({
            where: { id },
            data
        });

        revalidatePath("/projects");
        revalidatePath(`/projects/${column.projectId}`);
        revalidatePath("/");
        
        return { ok: true, success: true, data: column, message: "Coluna atualizada com sucesso" };
    } catch (error: any) {
        console.error("Failed to update column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar coluna do Kanban: " + error.message };
    }
}

export async function deleteKanbanColumn(id: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        const column = await model.findUnique({ where: { id } });
        if (!column) {
            return { ok: false, success: false, error: "Coluna não encontrada", message: "Coluna não encontrada" };
        }

        const projectId = column.projectId;

        // Move os projetos que estavam com o status apontado para essa coluna para a primeira disponível do projeto
        const firstColumn = await model.findFirst({
            where: { 
                projectId,
                id: { not: id } 
            },
            orderBy: { order: 'asc' }
        });

        if (firstColumn) {
            await (prisma as any).project.updateMany({
                where: { 
                    id: projectId,
                    status: id 
                },
                data: { status: firstColumn.id }
            });
        }

        await model.delete({ where: { id } });

        revalidatePath("/projects");
        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/");
        
        return { ok: true, success: true, message: "Coluna excluída com sucesso" };
    } catch (error: any) {
        console.error("Failed to delete column:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir coluna do Kanban: " + error.message };
    }
}

export async function updateProjectStatus(projectId: string, statusId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const projectModel = (prisma as any).project || (prisma as any).Project;
        const project = await projectModel.update({
            where: { id: projectId },
            data: { status: statusId }
        });

        revalidatePath("/projects");
        revalidatePath(`/projects/${projectId}`);
        revalidatePath("/");
        
        return { ok: true, success: true, data: project, message: "Status do projeto atualizado com sucesso" };
    } catch (error: any) {
        console.error("Failed to update project status:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar status do projeto: " + error.message };
    }
}
