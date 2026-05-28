"use server";

import { prisma } from "@/lib/prisma";
import { deliverableSchema, updateDeliverableSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { DeliverableStatus, Role } from "@prisma/client";
import { requireProjectAccess } from "@/lib/server-utils";
import nodeCrypto from "crypto";
import { logAudit } from "@/app/actions/audit";

// Interface unificada oficial
export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade
  errors?: Record<string, string[]> | string;
}

export async function createDeliverable(data: z.infer<typeof deliverableSchema>): Promise<ActionResponse> {
    const result = deliverableSchema.safeParse(data);
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const session = await requireProjectAccess(data.projectId, [Role.OWNER, Role.EDITOR]);
        const deliverable = await prisma.deliverable.create({
            data: {
                ...result.data,
                status: DeliverableStatus.DRAFT,
                version: 1,
                revisionCount: 0,
                createdById: session.user.id,
                reviewComments: [] as any,
            },
        });

        await logAudit({
            action: 'CREATE',
            entityType: 'Deliverable',
            entityId: deliverable.id,
            projectId: deliverable.projectId,
            changes: { new: deliverable }
        });

        revalidatePath(`/dashboard/projects/${data.projectId}`);
        return { ok: true, success: true, data: deliverable, message: "Entregável técnico criado com sucesso" };
    } catch (error: any) {
        console.error("Failed to create deliverable:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao criar entregável técnico." };
    }
}

export async function getDeliverableById(id: string) {
    try {
        const deliverable = await prisma.deliverable.findUnique({
            where: { id },
            include: {
                createdBy: { select: { fullName: true } },
                approvedBy: { select: { fullName: true } },
                project: { select: { name: true } },
                task: { select: { title: true } },
            },
        });

        if (deliverable) {
            await requireProjectAccess(deliverable.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
        }
        
        return deliverable;
    } catch (error) {
        console.error("Failed to get deliverable:", error);
        return null;
    }
}

export async function updateDeliverable(id: string, data: z.infer<typeof updateDeliverableSchema>): Promise<ActionResponse> {
    const result = updateDeliverableSchema.safeParse({ ...data, id });
    if (!result.success) {
        const errs = result.error.flatten().fieldErrors;
        return { ok: false, success: false, error: errs, message: "Erro de validação nos campos", errors: errs as any };
    }

    try {
        const existing = await prisma.deliverable.findUnique({ where: { id } });
        if (!existing) {
            return { ok: false, success: false, error: "Not found", message: "Entregável não encontrado." };
        }
        
        await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR]);

        // Restrição da máquina de estados
        if (existing.status === DeliverableStatus.APPROVED || existing.status === DeliverableStatus.DELIVERED) {
            return { 
                ok: false, 
                success: false, 
                error: "Locked", 
                message: "Este entregável está aprovado/entregue e não pode ser editado ou modificado." 
            };
        }

        const deliverable = await prisma.deliverable.update({
            where: { id },
            data: result.data,
        });

        await logAudit({
            action: 'UPDATE',
            entityType: 'Deliverable',
            entityId: deliverable.id,
            projectId: deliverable.projectId,
            changes: { old: existing, new: deliverable }
        });

        revalidatePath(`/dashboard/projects/${deliverable.projectId}`);
        return { ok: true, success: true, data: deliverable, message: "Entregável atualizado com sucesso" };
    } catch (error: any) {
        console.error("Failed to update deliverable:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao atualizar entregável." };
    }
}

export async function deleteDeliverable(id: string): Promise<ActionResponse> {
    try {
        const existing = await prisma.deliverable.findUnique({ where: { id } });
        if (!existing) {
            return { ok: false, success: false, error: "Not found", message: "Entregável não encontrado." };
        }

        await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR]);

        // Restrição da máquina de estados
        if (existing.status === DeliverableStatus.APPROVED || existing.status === DeliverableStatus.DELIVERED) {
            return { 
                ok: false, 
                success: false, 
                error: "Locked", 
                message: "Este entregável está aprovado/entregue e não pode ser excluído." 
            };
        }

        await prisma.deliverable.delete({
            where: { id },
        });

        await logAudit({
            action: 'DELETE',
            entityType: 'Deliverable',
            entityId: id,
            projectId: existing.projectId,
            changes: { old: existing }
        });

        revalidatePath(`/dashboard/projects/${existing.projectId}`);
        return { ok: true, success: true, message: "Entregável técnico excluído com sucesso" };
    } catch (error: any) {
        console.error("Failed to delete deliverable:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao excluir entregável." };
    }
}

export async function listDeliverables(projectId: string) {
    try {
        await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
        const deliverables = await prisma.deliverable.findMany({
            where: { projectId, deletedAt: null },
            orderBy: { createdAt: "desc" },
            include: {
                createdBy: { select: { fullName: true } },
                approvedBy: { select: { fullName: true } },
            },
        });
        return { ok: true, success: true, data: deliverables };
    } catch (error: any) {
        console.error("Failed to list deliverables:", error);
        return { ok: false, success: false, error: error.message, message: "Failed to list deliverables." };
    }
}

// --- MÁQUINA DE ESTADOS & REVISÃO ---

export async function submitNewVersion(
    id: string, 
    fileUrl: string, 
    fileSize: number, 
    mimeType: string
): Promise<ActionResponse> {
    try {
        const existing = await prisma.deliverable.findUnique({ where: { id } });
        if (!existing) {
            return { ok: false, success: false, error: "Not found", message: "Entregável não encontrado." };
        }

        const session = await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR]);

        if (
            existing.status !== DeliverableStatus.REJECTED && 
            existing.status !== DeliverableStatus.APPROVED_WITH_CHANGES &&
            existing.status !== DeliverableStatus.DRAFT
        ) {
            return { 
                ok: false, 
                success: false, 
                error: "InvalidTransition", 
                message: "Não é permitido enviar nova versão para entregáveis aguardando revisão ou aprovados." 
            };
        }

        const newVersion = existing.version + 1;
        const newRevisionCount = existing.revisionCount + 1;
        const comments = (existing.reviewComments as any[]) || [];

        // Adiciona registro histórico de envio de nova versão
        const historyEntry = {
            id: nodeCrypto.randomBytes(16).toString("hex"),
            status: DeliverableStatus.DRAFT,
            comment: `Nova revisão (versão v${newVersion}) submetida pelo profissional.`,
            userId: session.user.id,
            userName: session.user.name || "Profissional",
            createdAt: new Date().toISOString(),
        };

        const updated = await prisma.deliverable.update({
            where: { id },
            data: {
                fileUrl,
                fileSize,
                mimeType,
                version: newVersion,
                revisionCount: newRevisionCount,
                status: DeliverableStatus.DRAFT, // reseta para Rascunho
                reviewComments: [...comments, historyEntry] as any,
            },
        });

        revalidatePath(`/dashboard/projects/${existing.projectId}`);
        return { ok: true, success: true, data: updated, message: "Nova versão do entregável enviada com sucesso." };
    } catch (error: any) {
        console.error("Failed to submit new version:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao enviar nova versão." };
    }
}

export async function reviewDeliverable(
    id: string, 
    status: DeliverableStatus, 
    comment: string
): Promise<ActionResponse> {
    try {
        const existing = await prisma.deliverable.findUnique({ where: { id } });
        if (!existing) {
            return { ok: false, success: false, error: "Not found", message: "Entregável não encontrado." };
        }

        const session = await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

        // Valida máquina de estados para revisão
        if (existing.status !== DeliverableStatus.PENDING_REVIEW && status !== DeliverableStatus.DELIVERED) {
            return { 
                ok: false, 
                success: false, 
                error: "InvalidTransition", 
                message: "Apenas entregáveis aguardando revisão podem ser revisados ou aprovados." 
            };
        }

        const comments = (existing.reviewComments as any[]) || [];

        // Adiciona o comentário de revisão histórico
        const reviewEntry = {
            id: nodeCrypto.randomBytes(16).toString("hex"),
            status,
            comment: comment || `Status alterado para ${status}.`,
            userId: session.user.id,
            userName: session.user.name || "Revisor",
            createdAt: new Date().toISOString(),
        };

        const dataUpdate: any = {
            status,
            reviewComments: [...comments, reviewEntry] as any,
        };

        // Se foi aprovado, anota quem aprovou
        if (status === DeliverableStatus.APPROVED) {
            dataUpdate.approvedById = session.user.id;
        }

        const updated = await prisma.deliverable.update({
            where: { id },
            data: dataUpdate,
        });

        revalidatePath(`/dashboard/projects/${existing.projectId}`);
        return { ok: true, success: true, data: updated, message: "Revisão do entregável técnica salva com sucesso." };
    } catch (error: any) {
        console.error("Failed to review deliverable:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao salvar revisão." };
    }
}

// Altera o status para PENDING_REVIEW (Profissional envia para revisão formal)
export async function submitForReview(id: string): Promise<ActionResponse> {
    try {
        const existing = await prisma.deliverable.findUnique({ where: { id } });
        if (!existing) {
            return { ok: false, success: false, error: "Not found", message: "Entregável não encontrado." };
        }

        const session = await requireProjectAccess(existing.projectId, [Role.OWNER, Role.EDITOR]);

        if (existing.status !== DeliverableStatus.DRAFT) {
            return { ok: false, success: false, error: "InvalidState", message: "Apenas rascunhos podem ser enviados para revisão." };
        }

        const comments = (existing.reviewComments as any[]) || [];
        const historyEntry = {
            id: nodeCrypto.randomBytes(16).toString("hex"),
            status: DeliverableStatus.PENDING_REVIEW,
            comment: "Entregável submetido formalmente para aprovação do cliente.",
            userId: session.user.id,
            userName: session.user.name || "Profissional",
            createdAt: new Date().toISOString(),
        };

        const updated = await prisma.deliverable.update({
            where: { id },
            data: {
                status: DeliverableStatus.PENDING_REVIEW,
                reviewComments: [...comments, historyEntry] as any,
            },
        });

        revalidatePath(`/dashboard/projects/${existing.projectId}`);
        return { ok: true, success: true, data: updated, message: "Entregável enviado para aprovação com sucesso." };
    } catch (error: any) {
        console.error("Failed to submit for review:", error);
        return { ok: false, success: false, error: error.message, message: "Falha ao enviar para revisão." };
    }
}
