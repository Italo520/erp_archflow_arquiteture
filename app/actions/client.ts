"use server";

import { prisma } from "@/lib/prisma";
import { clientSchema, updateClientSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/server-utils";
import { canCreateClient } from "@/lib/permissions";
import { Role } from "@prisma/client";

function sanitizeClient(client: any) {
  if (!client) return client;
  return {
    ...client,
    totalSpent: client.totalSpent ? Number(client.totalSpent) : 0,
  };
}

// Interface oficial de resposta para Server Actions
export interface ActionResponse<T = any> {
  ok: boolean;
  success?: boolean; // Retrocompatibilidade do frontend
  message?: string;
  data?: T;
  error?: string | any; // Retrocompatibilidade do frontend
  errors?: Record<string, string[]> | string;
  metadata?: any; // Para paginações retrocompatíveis
}

export async function createClient(data: z.infer<typeof clientSchema>): Promise<ActionResponse> {
    try {
        const session = await requireAuth();
        const userRole = (session.user.role as Role) || Role.VIEWER;
        
        if (!canCreateClient(userRole)) {
            return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para criar clientes" };
        }

        const result = clientSchema.safeParse(data);

        if (!result.success) {
            const errs = result.error.flatten().fieldErrors;
            return { 
                ok: false, 
                success: false, 
                error: errs, 
                message: "Erro de validação nos campos", 
                errors: errs as any 
            };
        }

        const client = await prisma.client.create({
            data: {
                ...result.data,
                userId: result.data.userId || undefined,
                address: result.data.address ? (result.data.address as any) : undefined,
            },
        });

        revalidatePath("/dashboard/clients");
        return { 
            ok: true, 
            success: true, 
            data: sanitizeClient(client), 
            message: "Cliente criado com sucesso" 
        };
    } catch (error: any) {
        console.error("Failed to create client:", error);
        return { 
            ok: false, 
            success: false, 
            error: error.message || "Failed to create client", 
            message: "Falha ao criar cliente: " + (error.message || "") 
        };
    }
}

export async function getClientById(id: string) {
    try {
        await requireAuth();
        const client = await prisma.client.findUnique({
            where: { id },
            include: {
                projects: {
                    where: { deletedAt: null },
                    orderBy: { createdAt: "desc" },
                },
                activities: {
                    orderBy: { startTime: "desc" },
                    include: {
                        createdBy: { select: { fullName: true } }
                    }
                },
                timeLogs: {
                    orderBy: { date: "desc" },
                    include: {
                        project: { select: { name: true } },
                    }
                },
                _count: {
                    select: { projects: true, activities: true },
                },
            },
        });
        return sanitizeClient(client);
    } catch (error) {
        console.error("Failed to get client:", error);
        return null;
    }
}

export async function updateClient(id: string, data: z.infer<typeof updateClientSchema>): Promise<ActionResponse> {
    try {
        const session = await requireAuth();
        const userRole = (session.user.role as Role) || Role.VIEWER;
        
        if (!canCreateClient(userRole)) {
            return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para editar clientes" };
        }

        const result = updateClientSchema.safeParse({ ...data, id });

        if (!result.success) {
            const errs = result.error.flatten().fieldErrors;
            return { 
                ok: false, 
                success: false, 
                error: errs, 
                message: "Erro de validação nos campos", 
                errors: errs as any 
            };
        }

        const client = await prisma.client.update({
            where: { id },
            data: {
                ...result.data,
                userId: result.data.userId || undefined,
                address: result.data.address ? (result.data.address as any) : undefined,
            },
        });

        revalidatePath("/dashboard/clients");
        revalidatePath(`/dashboard/clients/${id}`);
        return { 
            ok: true, 
            success: true, 
            data: sanitizeClient(client), 
            message: "Cliente atualizado com sucesso" 
        };
    } catch (error: any) {
        console.error("Failed to update client:", error);
        return { 
            ok: false, 
            success: false, 
            error: error.message || "Failed to update client", 
            message: "Falha ao atualizar cliente: " + (error.message || "") 
        };
    }
}

export async function softDeleteClient(id: string): Promise<ActionResponse> {
    try {
        const session = await requireAuth();
        const userRole = (session.user.role as Role) || Role.VIEWER;
        
        if (!canCreateClient(userRole)) {
            return { ok: false, success: false, error: "Sem permissão", message: "Você não tem permissão para excluir clientes" };
        }

        const client = await prisma.client.update({
            where: { id },
            data: {
                status: "INACTIVE",
                deletedAt: new Date(),
            },
        });
        revalidatePath("/dashboard/clients");
        return { 
            ok: true, 
            success: true, 
            data: sanitizeClient(client), 
            message: "Cliente excluído com sucesso (deleção lógica)" 
        };
    } catch (error: any) {
        console.error("Failed to delete client:", error);
        return { 
            ok: false, 
            success: false, 
            error: error.message || "Failed to delete client", 
            message: "Falha ao excluir cliente: " + (error.message || "") 
        };
    }
}

export async function listClients({
    query,
    status,
    tags,
    page = 1,
    limit = 10,
}: {
    query?: string;
    status?: string;
    tags?: string[];
    page?: number;
    limit?: number;
}): Promise<ActionResponse> {
    try {
        await requireAuth();
        const skip = (page - 1) * limit;

        const where: any = {
            deletedAt: null,
        };

        if (query) {
            where.OR = [
                { name: { contains: query, mode: "insensitive" } },
                { email: { contains: query, mode: "insensitive" } },
                { document: { contains: query } },
            ];
        }

        if (status && status !== "ALL") {
            where.status = status;
        }

        if (tags && tags.length > 0) {
            where.tags = {
                hasSome: tags,
            };
        }

        const [clients, total] = await prisma.$transaction([
            prisma.client.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
                include: {
                    _count: {
                        select: { projects: true, activities: true },
                    },
                },
            }),
            prisma.client.count({ where }),
        ]);

        return {
            ok: true,
            success: true,
            data: clients.map(sanitizeClient),
            metadata: {
                total,
                page,
                totalPages: Math.ceil(total / limit),
                hasMore: page < Math.ceil(total / limit),
            },
        };
    } catch (error: any) {
        console.error("Failed to list clients:", error);
        return { 
            ok: false, 
            success: false, 
            error: error.message || "Failed to list clients", 
            message: "Falha ao listar clientes" 
        };
    }
}

export async function getClientStats() {
    try {
        await requireAuth();
        const [total, active, newThisMonth] = await prisma.$transaction([
            prisma.client.count({ where: { deletedAt: null } }),
            prisma.client.count({ where: { deletedAt: null, status: "ACTIVE" } }),
            prisma.client.count({
                where: {
                    deletedAt: null,
                    createdAt: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
        ]);

        return { total, active, newThisMonth };
    } catch (error) {
        console.error("Failed to get client stats:", error);
        return { total: 0, active: 0, newThisMonth: 0 };
    }
}
