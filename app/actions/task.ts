'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { Priority, Role } from "@prisma/client"
import { requireProjectAccess } from "@/lib/server-utils"

const TaskSchema = z.object({
    title: z.string().min(1, "Título obrigatório"),
    description: z.string().optional(),
    priority: z.nativeEnum(Priority).optional(),
    dueDate: z.coerce.date().optional(),
    projectId: z.string(),
    stageId: z.string(),
    assigneeId: z.string().optional().nullable(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(z.object({
        id: z.string(),
        name: z.string(),
        url: z.string(),
        type: z.string().optional()
    })).optional().default([]),
    checklist: z.array(z.object({
        id: z.string(),
        text: z.string(),
        checked: z.boolean()
    })).optional().default([]),
})

interface HistoryItem {
    date: string;
    userId: string;
    userName: string;
    type: string;
    details: string;
}

export async function createTask(data: z.input<typeof TaskSchema>) {
    const validated = TaskSchema.safeParse(data);
    if (!validated.success) {
        return { success: false, error: "Dados inválidos: " + JSON.stringify(validated.error.flatten().fieldErrors) };
    }

    try {
        const session = await requireProjectAccess(validated.data.projectId, [Role.OWNER, Role.EDITOR]);
        
        const { title, description, priority, dueDate, projectId, stageId, assigneeId, tags, attachments, checklist } = validated.data;
        const user = session.user;
        const history: HistoryItem[] = [
            {
                date: new Date().toISOString(),
                userId: user.id,
                userName: user.name || user.email || "Unknown",
                type: "CREATED",
                details: "Tarefa criada"
            }
        ];

        // Get current max position in this stage
        const lastTask = await prisma.task.findFirst({
            where: { stageId },
            orderBy: { position: 'desc' },
            select: { position: true }
        });

        const newPosition = (lastTask?.position ?? -1) + 1;

        const task = await prisma.task.create({
            data: {
                title,
                description,
                priority: priority || "MEDIUM",
                dueDate,
                projectId,
                stageId,
                assigneeId: assigneeId || null,
                tags: tags || [],
                historico: history as any,
                checklist: checklist || [],
                attachments: attachments || [],
                comments: [],
                position: newPosition
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, data: task };
    } catch (error: any) {
        console.error("Failed to create task:", error);
        return { success: false, error: "Falha ao criar tarefa: " + error.message };
    }
}

export async function updateTaskStage(taskId: string, newStageId: string, projectId: string) {
    try {
        const session = await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        const stage = await prisma.stage.findUnique({ where: { id: newStageId } });
        if (!stage) {
            return { success: false, error: "Etapa não encontrada" };
        }

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            return { success: false, error: "Tarefa não encontrada" };
        }

        // History
        let currentHistory = (task.historico as unknown as HistoryItem[]) || [];
        const user = session.user;
        currentHistory.push({
            date: new Date().toISOString(),
            userId: user.id,
            userName: user.name || user.email || "Unknown",
            type: "STATUS_CHANGED",
            details: `Status alterado para ${stage.name}`
        });

        await prisma.task.update({
            where: { id: taskId },
            data: {
                stageId: newStageId,
                historico: currentHistory as any
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update task stage:", error);
        return { success: false, error: "Falha ao atualizar etapa da tarefa: " + error.message };
    }
}

export async function updateTask(taskId: string, projectId: string, data: Partial<z.infer<typeof TaskSchema>>) {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        await prisma.task.update({
            where: { id: taskId },
            data: {
                ...data,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined
            }
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update task:", error);
        return { success: false, error: "Falha ao atualizar tarefa: " + error.message };
    }
}

export async function deleteTask(taskId: string, projectId: string) {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        await prisma.task.delete({ where: { id: taskId } });
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete task:", error);
        return { success: false, error: "Falha ao excluir tarefa: " + error.message };
    }
}

export async function updateTaskPositions(projectId: string, updates: { id: string; position: number; stageId: string }[]) {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
        
        await prisma.$transaction(
            updates.map(u => prisma.task.update({
                where: { id: u.id },
                data: { position: u.position, stageId: u.stageId }
            }))
        );
        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update task positions", error);
        return { success: false, error: "Falha ao atualizar posições das tarefas: " + error.message };
    }
}
