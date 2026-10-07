'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-utils';
import { AuditAction } from '@prisma/client';

type AuditPayload = {
    action: AuditAction;
    entityType: string;
    entityId: string;
    projectId?: string;
    changes?: Record<string, any>;
};

/**
 * Função utilitária para gravar logs de auditoria
 * Deve ser chamada logo após a ação crítica (ex: no mesmo try/catch).
 */
export async function logAudit(payload: AuditPayload) {
    try {
        const session = await requireAuth();

        // Expurgar logs mais antigos que 90 dias sob demanda
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        await prisma.auditLog.deleteMany({
            where: {
                createdAt: { lt: ninetyDaysAgo }
            }
        });

        await prisma.auditLog.create({
            data: {
                userId: session.user.id,
                action: payload.action,
                entityType: payload.entityType,
                entityId: payload.entityId,
                projectId: payload.projectId,
                changes: payload.changes || undefined,
                ipAddress: null, // Em Server Actions não temos acesso fácil ao IP, a menos que passemos o request explicitamente
                userAgent: null,
            }
        });

        return true;
    } catch (error) {
        // Nós não queremos que uma falha no log de auditoria derrube a ação principal
        // mas devemos logar no console do servidor para diagnóstico
        console.error('Failed to write Audit Log:', error);
        return false;
    }
}

/**
 * Busca logs de auditoria de um projeto específico.
 * Apenas OWNER do projeto tem acesso (regra de negócio).
 */
export async function getProjectAuditLogs(projectId: string, limit = 50) {
    try {
        const session = await requireAuth();

        // Validar se o usuário é OWNER do projeto
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: session.user.id,
                    projectId
                }
            }
        });

        if (!membership || membership.role !== 'OWNER') {
            return {
                success: false,
                error: 'Acesso restrito. Apenas administradores do projeto podem visualizar a auditoria.',
                data: []
            };
        }

        const logs = await prisma.auditLog.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: { id: true, fullName: true, email: true }
                }
            }
        });

        return {
            success: true,
            data: logs
        };
    } catch (error: any) {
        console.error('Error fetching project audit logs:', error);
        return {
            success: false,
            error: error.message || 'Erro ao buscar logs de auditoria.',
            data: []
        };
    }
}
