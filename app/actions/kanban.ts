"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getKanbanColumns() {
    try {
        if (!prisma) {
            console.error("PRISMA ERROR: Database client is not initialized.");
            return { error: "Database not connected" };
        }

        // Use safe access to the model
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        
        if (!model) {
            console.error("PRISMA ERROR: projectKanbanColumn model not found in client. Available models:", Object.keys(prisma));
            return { error: "Model not found" };
        }

        let columns = await model.findMany({
            orderBy: { order: 'asc' }
        });

        // Initialize default columns if none exist
        if (columns.length === 0) {
            console.log("INITIALIZING: Creating default Kanban columns...");
            const defaultCols = [
                { id: 'PLANNING', title: 'Planejamento', color: 'bg-blue-500', order: 0 },
                { id: 'IN_PROGRESS', title: 'Em Andamento', color: 'bg-emerald-500', order: 1 },
                { id: 'ON_HOLD', title: 'Pausado', color: 'bg-amber-500', order: 2 },
                { id: 'COMPLETED', title: 'Concluído', color: 'bg-slate-500', order: 3 }
            ];

            for (const col of defaultCols) {
                await model.create({ data: col });
            }

            columns = await model.findMany({
                orderBy: { order: 'asc' }
            });
        }

        return { success: true, data: columns };
    } catch (error) {
        console.error("Failed to fetch kanban columns:", error);
        return { error: "Failed to fetch kanban columns" };
    }
}

export async function createKanbanColumn(title: string, color?: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        const lastColumn = await model.findFirst({
            orderBy: { order: 'desc' }
        });
        const order = lastColumn ? lastColumn.order + 1 : 0;

        const column = await model.create({
            data: {
                title,
                color: color || 'bg-blue-500',
                order
            }
        });

        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true, data: column };
    } catch (error) {
        console.error("Failed to create column:", error);
        return { error: "Failed to create column" };
    }
}

export async function updateKanbanColumn(id: string, data: { title?: string, color?: string, order?: number }) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const column = await (prisma as any).projectKanbanColumn.update({
            where: { id },
            data
        });

        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true, data: column };
    } catch (error) {
        console.error("Failed to update column:", error);
        return { error: "Failed to update column" };
    }
}

export async function deleteKanbanColumn(id: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const model = (prisma as any).projectKanbanColumn || (prisma as any).ProjectKanbanColumn;
        // Find if any projects are in this column
        const column = await model.findUnique({ where: { id } });
        if (!column) return { error: "Column not found" };

        // We should move projects to another column or prevent deletion
        // For simplicity, we move them to the first available column
        const firstColumn = await model.findFirst({
            where: { id: { not: id } },
            orderBy: { order: 'asc' }
        });

        if (firstColumn) {
            await (prisma as any).project.updateMany({
                where: { status: id },
                data: { status: firstColumn.id }
            });
        }

        await model.delete({ where: { id } });

        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete column:", error);
        return { error: "Failed to delete column" };
    }
}

export async function updateProjectStatus(projectId: string, statusId: string) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    try {
        const project = await (prisma as any).project.update({
            where: { id: projectId },
            data: { status: statusId }
        });

        revalidatePath("/projects");
        revalidatePath("/");
        return { success: true, data: project };
    } catch (error) {
        console.error("Failed to update project status:", error);
        return { error: "Failed to update status" };
    }
}
