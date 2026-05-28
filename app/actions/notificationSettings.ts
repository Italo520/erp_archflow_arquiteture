'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/server-utils';
import { Role } from '@prisma/client';

export type NotificationRule = {
    role: string;
    eventType: string;
    enabled: boolean;
};



export async function getSystemNotificationRules() {
    try {
        const session = await requireAuth();

        // Only owners can view/edit these rules right now
        // In the future, this might be relaxed or checked via granular permissions
        if (session.user.role !== 'OWNER') {
            return {
                success: false,
                error: 'Permissão negada. Apenas administradores podem visualizar as regras de notificação.',
                data: []
            };
        }

        const rules = await prisma.systemNotificationRule.findMany();
        
        return {
            success: true,
            data: rules,
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Erro ao buscar regras de notificação.',
            data: []
        };
    }
}

export async function updateSystemNotificationRule(role: string, eventType: string, enabled: boolean) {
    try {
        const session = await requireAuth();

        if (session.user.role !== 'OWNER') {
            return {
                success: false,
                error: 'Permissão negada. Apenas administradores podem editar as regras de notificação.',
            };
        }

        const rule = await prisma.systemNotificationRule.upsert({
            where: {
                role_eventType: {
                    role,
                    eventType
                }
            },
            update: {
                enabled
            },
            create: {
                role,
                eventType,
                enabled
            }
        });

        return {
            success: true,
            data: rule,
        };
    } catch (error: any) {
        console.error('Error updating notification rule:', error);
        return {
            success: false,
            error: error.message || 'Erro ao atualizar a regra de notificação.',
        };
    }
}

export async function getUserNotificationPreferences() {
    try {
        const session = await requireAuth();

        const prefs = await prisma.userNotificationPreference.findMany({
            where: { userId: session.user.id }
        });

        return {
            success: true,
            data: prefs,
        };
    } catch (error: any) {
        console.error('Error fetching user preferences:', error);
        return {
            success: false,
            error: error.message || 'Erro ao buscar preferências.',
            data: []
        };
    }
}

export async function updateUserNotificationPreference(eventType: string, enabled: boolean) {
    try {
        const session = await requireAuth();

        const pref = await prisma.userNotificationPreference.upsert({
            where: {
                userId_eventType: {
                    userId: session.user.id,
                    eventType
                }
            },
            update: {
                enabled
            },
            create: {
                userId: session.user.id,
                eventType,
                enabled
            }
        });

        return {
            success: true,
            data: pref,
        };
    } catch (error: any) {
        console.error('Error updating user preference:', error);
        return {
            success: false,
            error: error.message || 'Erro ao atualizar a preferência.',
        };
    }
}
