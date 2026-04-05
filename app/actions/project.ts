"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { projectSchema, updateProjectSchema, projectPhaseSchema } from "@/lib/validations";


// --- CORE CRUD ---

export async function createProject(data: z.infer<typeof projectSchema>) {
    console.log("SERVER ACTION: createProject started", JSON.stringify(data));
    const session = await auth();
    console.log("SERVER ACTION: session user", session?.user?.id);
    if (!session?.user?.id) return { error: "Unauthorized" };

    const result = projectSchema.safeParse(data);
    if (!result.success) {
        console.log("SERVER ACTION: validation failed", JSON.stringify(result.error.flatten()));
        return { error: result.error.flatten().fieldErrors };
    }

    try {
        console.log("SERVER ACTION: fetching first kanban column...");
        const firstColumn = await (prisma as any).projectKanbanColumn.findFirst({
            orderBy: { order: 'asc' }
        });

        console.log("SERVER ACTION: creating project in DB...");
        const project = await (prisma as any).project.create({
            data: {
                ...result.data,
                status: result.data.status || firstColumn?.id || 'PLANNING',
                ownerId: session.user.id,
                phases: result.data.phases as any, // Cast JSON
            },
        });
        console.log("SERVER ACTION: project created successfully", project.id);

        revalidatePath("/dashboard/projects");
        if (data.clientId) revalidatePath(`/dashboard/clients/${data.clientId}`);

        const response = { success: true, data: project };
        console.log("SERVER ACTION: returning response", JSON.stringify(response));
        return response;
    } catch (error: any) {
        console.error("SERVER ACTION: DATABASE ERROR", error.message);
        return { error: "Failed to create project: " + error.message };
    }
}

export async function getProjectById(id: string) {
    console.log("SERVER ACTION: getProjectById", id);
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
                owner: true, // Also include owner for display
                _count: {
                    select: { tasks: true, deliverables: true, timeLogs: true },
                },
            },
        });
        console.log("SERVER ACTION: returning project", !!project);
        return project;
    } catch (error) {
        console.error("SERVER ACTION: Failed to get project:", error);
        return null;
    }
}

export async function updateProject(id: string, data: z.infer<typeof updateProjectSchema>) {
    console.log("SERVER ACTION: updateProject", id, data);
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const result = updateProjectSchema.safeParse(data);
    if (!result.success) return { error: result.error.flatten().fieldErrors };

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
        const response = { success: true, data: project };
        console.log("SERVER ACTION: returning", response);
        return response;
    } catch (error) {
        console.error("SERVER ACTION: Failed to update project:", error);
        return { error: "Failed to update project." };
    }
}

export async function deleteProject(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await (prisma as any).project.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
        revalidatePath("/dashboard/projects");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete project:", error);
        return { error: "Failed to delete project." };
    }
}

export async function listProjects(filters?: { clientId?: string; status?: string }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

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
        return { success: true, data: projects };
    } catch (error) {
        console.error("Failed to list projects:", error);
        return { error: "Failed to list projects." };
    }
}


// --- PHASES MANAGEMENT ---

export async function updateProjectPhase(projectId: string, phases: z.infer<typeof projectPhaseSchema>[]) {
    // This action updates ALL phases or duplicates what we had before.
    // Keeping for compatibility but favoring granular actions.
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: phases as any }
        });
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true, data: project };
    } catch (error) {
        console.error("Failed to update phases:", error);
        return { error: "Failed to update phases" };
    }
}

export async function addProjectPhase(projectId: string, phase: any) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { error: "Project not found" };

        const currentPhases = (project.phases as any[]) || [];
        const newPhase = { ...phase, status: "PENDING" };
        const updatedPhases = [...currentPhases, newPhase];

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: updatedPhases }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, data: updatedPhases };
    } catch (error) {
        console.error("Failed to add phase:", error);
        return { error: "Failed to add phase" };
    }
}

export async function completeProjectPhase(projectId: string, phaseName: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { error: "Project not found" };

        const currentPhases = (project.phases as any[]) || [];
        const updatedPhases = currentPhases.map(p =>
            p.name === phaseName ? { ...p, status: "COMPLETED", endDate: new Date() } : p
        );

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { phases: updatedPhases }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to complete phase:", error);
        return { error: "Failed to complete phase" };
    }
}


// --- DOCUMENTS ---

export async function uploadProjectDocument(projectId: string, fileUrl: string, name: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { error: "Project not found" };

        const currentDocs = (project.attachedDocuments as any[]) || [];
        const newDoc = { name, url: fileUrl, uploadedAt: new Date() };
        const updatedDocs = [...currentDocs, newDoc];

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { attachedDocuments: updatedDocs }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, data: updatedDocs };
    } catch (error) {
        console.error("Failed to upload document:", error);
        return { error: "Failed to upload document" };
    }
}

export async function listProjectDocuments(projectId: string) {
    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        return { data: project?.attachedDocuments || [] };
    } catch (error) {
        return { error: "Failed to list documents" };
    }
}

export async function deleteProjectDocument(projectId: string, docUrl: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.findUnique({ where: { id: projectId } });
        if (!project) return { error: "Project not found" };

        const currentDocs = (project.attachedDocuments as any[]) || [];
        const updatedDocs = currentDocs.filter((d: any) => d.url !== docUrl);

        await (prisma as any).project.update({
            where: { id: projectId },
            data: { attachedDocuments: updatedDocs }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete document" };
    }
}


// --- TEAM ---

export async function associateArchitect(projectId: string, userId: string, role: string = "VIEWER") {
    // Alias for associateArchitectToProject
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await (prisma as any).projectMember.create({
            data: {
                projectId,
                userId,
                role: role as any
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to associate architect:", error);
        return { error: "Failed to associate architect" };
    }
}

export const associateArchitectToProject = associateArchitect;

export async function removeArchitect(projectId: string, userId: string) {
    // Alias for removeArchitectFromProject
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        await (prisma as any).projectMember.deleteMany({
            where: {
                projectId,
                userId
            }
        });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to remove architect" };
    }
}

export const removeArchitectFromProject = removeArchitect;


// --- ANALYTICS & TIMELINE ---

export async function getProjectMetrics(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

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

        if (!project) return { error: "Project not found" };

        const totalHours = timeLogs.reduce((acc: any, curr: any) => acc + (curr._sum.duration || 0), 0);

        return {
            success: true,
            data: {
                totalHours,
                budgetSpent: budget?.spentAmount || 0,
                totalBudget: budget?.totalBudget || 0,
                progress: calculateProgress(project.phases as any),
                timeDistribution: timeLogs
            }
        };
    } catch (error) {
        console.error("Failed to get metrics:", error);
        return { error: "Failed to get metrics" };
    }
}

export async function getProjectTimeline(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.findUnique({
            where: { id: projectId },
            select: { phases: true, startDate: true, estimatedEndDate: true }
        });

        if (!project) return { error: "Project not found" };

        return { success: true, data: project };
    } catch (error) {
        return { error: "Failed to get timeline" };
    }
}

export async function getProjectBudgetStatus(projectId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const [project, budget] = await Promise.all([
            (prisma as any).project.findUnique({
                where: { id: projectId },
                select: { plannedCost: true, actualCost: true }
            }),
            (prisma as any).budget.findUnique({ where: { projectId } })
        ]);

        if (!project) return { error: "Project not found" };

        return {
            success: true,
            data: {
                plannedCost: project.plannedCost,
                actualCost: project.actualCost,
                budgetRecord: budget // If detailed record exists
            }
        };
    } catch (error) {
        return { error: "Failed to get budget status" };
    }
}

export async function updateProjectProgress(projectId: string, progress: number) {
    // Projects calculate progress from phases, but maybe we want to store a manual override/cache
    // Since schema has no progress field, we will assume this might trigger a recalculation or no-op 
    // unless we store it in metadata.
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // For now, no-op or return calculated
    return { success: true, message: "Progress is calculated automatically from phases." };
}


// --- UTILITIES ---

export async function duplicateProject(projectId: string, newName: string, options?: { keepPhases?: boolean; keepTasks?: boolean }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const original = await (prisma as any).project.findUnique({
            where: { id: projectId },
            include: {
                stages: {
                    include: { tasks: true }
                }
            }
        });

        if (!original) return { error: "Original project not found" };

        const { id, createdAt, updatedAt, ...data } = original;

        const newProject = await (prisma as any).project.create({
            data: {
                ...data,
                name: newName,
                status: "PLANNING",
                phases: options?.keepPhases ? data.phases : [],
                stages: undefined, // Explicitly exclude stages to avoid relation create error
            }
        });

        revalidatePath("/dashboard/projects");
        return { success: true, data: newProject };
    } catch (error) {
        console.error("Failed to duplicate project:", error);
        return { error: "Failed to duplicate project" };
    }
}

export async function bulkUpdateProjects(filters: any, updates: any) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        // Basic implementation
        const where: any = {};
        if (filters.status) where.status = filters.status;
        if (filters.clientId) where.clientId = filters.clientId;

        const result = await (prisma as any).project.updateMany({
            where,
            data: updates
        });

        revalidatePath("/projects");
        return { success: true, count: result.count };
    } catch (error) {
        return { error: "Failed to bulk update" };
    }
}

export async function exportProjectData(projectId: string, format: string = "json") {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await getProjectById(projectId);
        if (!project) return { error: "Not found" };

        // Return data for client to handle file creation
        return { success: true, data: project, format };
    } catch (error) {
        return { error: "Export failed" };
    }
}

function calculateProgress(phases: any[]): number {
    if (!phases || !Array.isArray(phases) || phases.length === 0) return 0;
    const completed = phases.filter(p => p.status === 'COMPLETED').length;
    return Math.round((completed / phases.length) * 100);
}
