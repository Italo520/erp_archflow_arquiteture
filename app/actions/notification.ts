"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { triggerNotification } from "@/lib/pusher";
import { NotificationType, RelatedEntityType } from "@prisma/client";

/**
 * Recupera todas as notificações do usuário ativo.
 */
export async function getNotifications() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  try {
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
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  try {
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
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Não autorizado" };
  }

  try {
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
