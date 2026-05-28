import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';

export async function POST(request: Request) {
  const session = await auth();
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Pusher sends authentication data as x-www-form-urlencoded
    const text = await request.text();
    const params = new URLSearchParams(text);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return new NextResponse('Bad Request: Missing socket_id or channel_name', { status: 400 });
    }

    // Secure check: verify if the authenticated user is subscribing only to their own channel
    const expectedChannel = `private-notifications-${session.user.id}`;
    if (channelName !== expectedChannel) {
      console.warn(`User ${session.user.id} tried to subscribe to unauthorized channel: ${channelName}`);
      return new NextResponse('Forbidden', { status: 403 });
    }

    const authResponse = pusherServer.authorizeChannel(socketId, channelName);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Pusher channel authentication error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
