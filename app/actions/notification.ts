"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { triggerNotification } from "@/lib/pusher";
import { NotificationType, RelatedEntityType } from "@prisma/client";

/**
 * Recupera todas as notificações do usuário ativo.
 */
export async function getNotifications() {
  try {
    const session = await requireAuth();

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Mapeamento opcional para assegurar compatibilidade com o frontend
    const mapped = notifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type.toLowerCase(), // frontend usa success, warning, error, info
      read: n.read,
      timestamp: n.createdAt,
      actionUrl: n.actionUrl
    }));

    return mapped;
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return [];
  }
}

/**
 * Marca uma notificação específica como lida no banco de dados.
 */
export async function markAsRead(notificationId: string) {
  try {
    const session = await requireAuth();

    await prisma.notification.update({
      where: {
        id: notificationId,
        userId: session.user.id, // Garante que a notificação pertence ao usuário logado
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error);
    return { error: "Falha ao marcar como lida" };
  }
}

/**
 * Deleta todas as notificações do usuário ativo.
 */
export async function clearNotifications() {
  try {
    const session = await requireAuth();

    await prisma.notification.deleteMany({
      where: { userId: session.user.id },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Erro ao limpar notificações:", error);
    return { error: "Falha ao limpar notificações" };
  }
}

/**
 * Cria uma notificação no banco de dados e dispara em tempo real via Pusher.
 */
export async function createNotification(
  userId: string,
  data: {
    type: NotificationType;
    title: string;
    message: string;
    relatedEntityId: string;
    relatedEntityType: RelatedEntityType;
    actionUrl?: string;
  }
) {
  try {
    // 1. Validar regra RBAC (SystemNotificationRule)
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (targetUser) {
      const rule = await prisma.systemNotificationRule.findUnique({
        where: {
          role_eventType: {
            role: targetUser.role,
            eventType: data.type,
          }
        }
      });

      // Se existir uma regra e estiver desabilitada, ignoramos a criação
      if (rule && !rule.enabled) {
        return { success: true, message: "Notificação suprimida pela regra de RBAC" };
      }

      const userPref = await prisma.userNotificationPreference.findUnique({
        where: {
          userId_eventType: {
            userId: userId,
            eventType: data.type,
          }
        }
      });

      // O usuário individualmente deu opt-out
      if (userPref && !userPref.enabled) {
        return { success: true, message: "Notificação suprimida pela preferência do usuário" };
      }
    }

    // 2. Criar notificação
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: data.type,
        title: data.title,
        message: data.message,
        relatedEntityId: data.relatedEntityId,
        relatedEntityType: data.relatedEntityType,
        actionUrl: data.actionUrl || null,
        read: false,
      },
    });

    // Transmite a notificação em tempo real
    await triggerNotification(userId, notification);

    return { success: true, data: notification };
  } catch (error) {
    console.error("Erro ao criar notificação:", error);
    return { error: "Falha ao criar notificação" };
  }
}
