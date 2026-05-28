"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { projectSchema, updateProjectSchema, projectPhaseSchema } from "@/lib/validations";
import { Role } from "@prisma/client";
import { canCreateProject, canDeleteProject } from "@/lib/permissions";

export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade do frontend
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade do frontend
  errors?: Record<string, string[]> | string;
  format?: string; // Suporte para exportProjectData
}

// --- CORE CRUD ---

export async function createProject(data: z.infer<typeof projectSchema>): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canCreateProject(userRole)) {
        return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para criar projetos" };
    }

    const result = projectSchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        // 1. Cria o projeto inicialmente com status temporário
        const project = await (prisma as any).project.create({
            data: {
                ...result.data,
                status: 'PLANNING',
                ownerId: session.user.id,
                phases: result.data.phases as any, // Cast JSON
            },
        });

        // 2. Instancia as 4 colunas Kanban padrão dedicadas e isoladas para este projeto
        const modelCol = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        const colPlanning = await modelCol.create({
            data: { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId: project.id }
        });
        await modelCol.create({
            data: { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId: project.id }
        });
        await modelCol.create({
            data: { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId: project.id }
        });
        await modelCol.create({
            data: { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId: project.id }
        });

        // 3. Atualiza o status do projeto recém-criado para apontar para a sua coluna real de Planejamento
        const updatedProject = await (prisma as any).project.update({
            where: { id: project.id },
            data: { status: colPlanning.id }
        });

        revalidatePath("/dashboard/projects");
        if (data.clientId) revalidatePath(`/dashboard/clients/${data.clientId}`);

        return { ok: true, success: true, data: updatedProject, message: "Projeto criado com sucesso" };
    } catch (error: any) {
        console.error("Failed to create project:", error.message);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar projeto: " + error.message };
    }
}

export async function getProjectById(id: string) {
    try {
        const project = await (prisma as any).project.findUnique({
            where: { id },
            include: {
                client: true,
                stages: {
                    include: { tasks: true },
                    orderBy: { order: 'asc' }
                },
                members: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true }
                        }
                    }
                },
                owner: true,
                _count: {
                    select: { tasks: true, deliverables: true, timeLogs: true },
                },
            },
        });
        return project;
    } catch (error) {
        console.error("Failed to get project:", error);
        return null;
    }
}

export async function updateProject(id: string, data: z.infer<typeof updateProjectSchema>): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canCreateProject(userRole)) {
        return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para editar projetos" };
    }

    const result = updateProjectSchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const project = await (prisma as any).project.update({
            where: { id },
            data: {
                ...result.data,
                phases: result.data.phases ? (result.data.phases as any) : undefined,
            },
        });

        revalidatePath("/dashboard/projects");
        revalidatePath(`/dashboard/projects/${id}`);
        
        return { ok: true, success: true, data: project, message: "Projeto atualizado com sucesso" };
    } catch (error: any) {
        console.error("Failed to update project:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar projeto: " + error.message };
    }
}

export async function deleteProject(id: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    const userRole = (session.user.role as Role) || Role.VIEWER;
    if (!canDeleteProject(userRole)) {
        return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para excluir projetos" };
    }

    try {
        const project = await (prisma as any).project.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        
        revalidatePath("/dashboard/projects");
        return { ok: true, success: true, data: project, message: "Projeto excluído com sucesso (deleção lógica)" };
    } catch (error: any) {
        console.error("Failed to delete project:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir projeto: " + error.message };
    }
}

export async function listProjects(filters?: { clientId?: string; status?: string }): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const where: any = { deletedAt: null };
        if (filters?.clientId) where.clientId = filters.clientId;
        if (filters?.status) where.status = filters.status;

        const projects = await (prisma as any).project.findMany({
            where,
            orderBy: { updatedAt: "desc" },
            include: {
                client: { select: { name: true } },
                owner: { select: { fullName: true } }
            }
        });
        return { ok: true, success: true, data: projects };
    } catch (error: any) {
        console.error("Failed to list projects:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao listar projetos: " + error.message };
    }
}

// --- PHASES MANAGEMENT ---

export async function updateProjectPhase(projectId: string, phases: z.infer<typeof projectPhaseSchema>[]): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: phases as any }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { ok: true, success: true, data: project, message: "Etapas do projeto atualizadas com sucesso" };
    } catch (error: any) {
        console.error("Failed to update phases:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar etapas: " + error.message };
    }
}

export async function addProjectPhase(projectId: string, phase: any): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        const currentPhases = (project.phases as any[]) || [];
        const newPhase = { ...phase, status: "PENDING" };
        const updatedPhases = [...currentPhases, newPhase];

        const updatedProject = await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: updatedPhases }
        });

        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, data: updatedProject, message: "Etapa adicionada com sucesso" };
    } catch (error: any) {
        console.error("Failed to add phase:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao adicionar etapa: " + error.message };
    }
}

export async function completeProjectPhase(projectId: string, phaseName: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        const currentPhases = (project.phases as any[]) || [];
        const updatedPhases = currentPhases.map(p =>
            p.name === phaseName ? { ...p, status: "COMPLETED", endDate: new Date() } : p
        );

        const updatedProject = await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: updatedPhases }
        });

        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, data: updatedProject, message: "Etapa concluída com sucesso" };
    } catch (error: any) {
        console.error("Failed to complete phase:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao concluir etapa: " + error.message };
    }
}

// --- DOCUMENTS ---

export async function uploadProjectDocument(projectId: string, fileUrl: string, name: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        const currentDocs = (project.attachedDocuments as any[]) || [];
        const newDoc = { name, url: fileUrl, uploadedAt: new Date() };
        const updatedDocs = [...currentDocs, newDoc];

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { attachedDocuments: updatedDocs }
        });

        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, data: updatedDocs, message: "Documento anexado com sucesso" };
    } catch (error: any) {
        console.error("Failed to upload document:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao anexar documento: " + error.message };
    }
}

export async function listProjectDocuments(projectId: string): Promise<ActionResponse> {
    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        return { ok: true, success: true, data: project?.attachedDocuments || [] };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha ao listar documentos: " + error.message };
    }
}

export async function deleteProjectDocument(projectId: string, docUrl: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        const currentDocs = (project.attachedDocuments as any[]) || [];
        const updatedDocs = currentDocs.filter((d: any) => d.url !== docUrl);

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { attachedDocuments: updatedDocs }
        });

        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, message: "Documento excluído com sucesso" };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir documento: " + error.message };
    }
}

// --- TEAM ---

export async function associateArchitect(projectId: string, userId: string, role: string = "VIEWER"): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        await (prisma as any).projectMember.create({
            data: {
                projectId,
                userId,
                role: role as any
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, message: "Membro associado ao projeto com sucesso" };
    } catch (error: any) {
        console.error("Failed to associate architect:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao associar membro: " + error.message };
    }
}

export const associateArchitectToProject = associateArchitect;

export async function removeArchitect(projectId: string, userId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        await (prisma as any).projectMember.deleteMany({
            where: {
                projectId,
                userId
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { ok: true, success: true, message: "Membro removido do projeto com sucesso" };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha ao remover membro: " + error.message };
    }
}

export const removeArchitectFromProject = removeArchitect;

// --- ANALYTICS & TIMELINE ---

export async function getProjectMetrics(projectId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const [project, timeLogs, budget] = await Promise.all([
            (prisma as any).project.findUnique({ where: { id: projectId } }),
            (prisma as any).timeLog.groupBy({
                by: ['category'],
                where: { projectId },
                _sum: { duration: true }
            }),
            (prisma as any).budget.findUnique({ where: { projectId } })
        ]);

        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        const totalHours = timeLogs.reduce((acc: any, curr: any) => acc + (curr._sum.duration || 0), 0);

        return {
            ok: true,
            success: true,
            data: {
                totalHours,
                budgetSpent: budget?.spentAmount || 0,
                totalBudget: budget?.totalBudget || 0,
                progress: calculateProgress(project.phases as any),
                timeDistribution: timeLogs
            }
        };
    } catch (error: any) {
        console.error("Failed to get metrics:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao obter métricas: " + error.message };
    }
}

export async function getProjectTimeline(projectId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            select: { phases: true, startDate: true, estimatedEndDate: true }
        });

        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        return { ok: true, success: true, data: project };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha ao obter linha do tempo: " + error.message };
    }
}

export async function getProjectBudgetStatus(projectId: string): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const [project, budget] = await Promise.all([
            (prisma as any).project.findUnique({
                where: { id: projectId },
                select: { plannedCost: true, actualCost: true }
            }),
            (prisma as any).budget.findUnique({ where: { projectId } })
        ]);

        if (!project) return { ok: false, success: false, error: "Projeto não encontrado", message: "Projeto não encontrado" };

        return {
            ok: true,
            success: true,
            data: {
                plannedCost: project.plannedCost,
                actualCost: project.actualCost,
                budgetRecord: budget
            }
        };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha ao obter orçamento: " + error.message };
    }
}

export async function updateProjectProgress(projectId: string, progress: number): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }
    return { ok: true, success: true, message: "O progresso é calculated automaticamente com base nas etapas." };
}

// --- UTILITIES ---

export async function duplicateProject(projectId: string, newName: string, options?: { keepPhases?: boolean; keepTasks?: boolean }): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", message: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const original = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: {
                stages: {
                    include: { tasks: true }
                }
            }
        });

        if (!original) return { ok: false, success: false, error: "Original não encontrado", message: "Projeto original não encontrado" };

        const { id, createdAt, updatedAt, ...data } = original;

        // 1. Cria o projeto duplicado
        const newProject = await (prisma as any).project.create({
            data: {
                ...data,
                name: newName,
                status: "PLANNING",
                phases: options?.keepPhases ? data.phases : [],
                stages: undefined,
            }
        });

        // 2. Clona de forma inteligente as colunas Kanban específicas do projeto original
        const originalColumns = await (prisma as any).projectKanbanColumn.findMany({
            where: { projectId },
            orderBy: { order: 'asc' }
        });

        const colMapping: Record<string, string> = {};
        const modelCol = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        let newStatus = 'PLANNING';

        if (originalColumns.length > 0) {
            for (const col of originalColumns) {
                const newCol = await modelCol.create({
                    data: {
                        title: col.title,
                        color: col.color,
                        order: col.order,
                        projectId: newProject.id
                    }
                });
                colMapping[col.id] = newCol.id;
            }

            // Mapeia o status do novo projeto para a nova coluna correspondente
            if (original.status && colMapping[original.status]) {
                newStatus = colMapping[original.status];
            } else if (originalColumns[0] && colMapping[originalColumns[0].id]) {
                newStatus = colMapping[originalColumns[0].id];
            }

            await (prisma as any).project.update({
                where: { id: newProject.id },
                data: { status: newStatus }
            });
        } else {
            // Fallback: cria colunas padrão locais
            const colPlanning = await modelCol.create({
                data: { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId: newProject.id }
            });
            await modelCol.create({
                data: { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId: newProject.id }
            });
            await modelCol.create({
                data: { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId: newProject.id }
            });
            await modelCol.create({
                data: { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId: newProject.id }
            });

            await (prisma as any).project.update({
                where: { id: newProject.id },
                data: { status: colPlanning.id }
            });
        }

        // 3. Clona opcionalmente os estágios (stages) e as tarefas (tasks) correspondentes
        if (options?.keepTasks && original.stages.length > 0) {
            for (const origStage of original.stages) {
                const newStage = await (prisma as any).stage.create({
                    data: {
                        name: origStage.name,
                        order: origStage.order,
                        projectId: newProject.id
                    }
                });

                if (origStage.tasks && origStage.tasks.length > 0) {
                    for (const origTask of origStage.tasks) {
                        const { id: _, createdAt: _c, updatedAt: _u, projectId: _p, stageId: _s, status: _st, ...taskData } = origTask as any;
                        
                        const mappedStatus = origTask.status && colMapping[origTask.status] 
                            ? colMapping[origTask.status] 
                            : newStatus;

                        await (prisma as any).task.create({
                            data: {
                                ...taskData,
                                status: mappedStatus,
                                projectId: newProject.id,
                                stageId: newStage.id
                            }
                        });
                    }
                }
            }
        }

        revalidatePath("/dashboard/projects");
        return { ok: true, success: true, data: newProject, message: "Projeto duplicado com sucesso" };
    } catch (error: any) {
        console.error("Failed to duplicate project:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao duplicar projeto: " + error.message };
    }
}

export async function bulkUpdateProjects(filters: any, updates: any): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.clientId) where.clientId = filters.clientId;

        const result = await (prisma as any).project.updateMany({
            where,
            data: updates
        });

        revalidatePath("/projects");
        return { ok: true, success: true, data: result.count, message: `Atualização em massa concluída para ${result.count} projetos.` };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha na atualização em massa: " + error.message };
    }
}

export async function exportProjectData(projectId: string, format: string = "json"): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, success: false, error: "Não autorizado", errors: "Unauthorized" };
    }

    try {
        const project = await getProjectById(projectId);
        if (!project) return { ok: false, success: false, error: "Não encontrado", message: "Projeto não encontrado" };

        return { ok: true, success: true, data: project, format };
    } catch (error: any) {
        return { ok: false, success: false, error: error.message, message: "Falha na exportação de dados: " + error.message };
    }
}

function calculateProgress(phases: any[]): number {
    if (!phases || !Array.isArray(phases) || phases.length === 0) return 0;
    const completed = phases.filter(p => p.status === 'COMPLETED').length;
    return Math.round((completed / phases.length) * 100);
}
