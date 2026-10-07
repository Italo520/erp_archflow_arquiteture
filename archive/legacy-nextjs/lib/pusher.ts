import Pusher from 'pusher';

// Initialize Pusher Server-side instance
export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

/**
 * Dispatches a WebSocket notification event to a specific user's private channel.
 */
export async function triggerNotification(userId: string, notification: any) {
  try {
    const channelName = `private-notifications-${userId}`;
    await pusherServer.trigger(channelName, 'new-notification', {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type ? notification.type.toLowerCase() : 'info', // frontend expects success, warning, error, info
      timestamp: notification.createdAt,
      read: notification.read,
      actionUrl: notification.actionUrl,
    });
  } catch (error) {
    console.error('Failed to trigger Pusher notification:', error);
  }
}
