import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET() {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
        }

        const notifications = await prisma.notification.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
        });

        const mapped = notifications.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type.toLowerCase(),
            read: n.read,
            createdAt: n.createdAt,
            actionUrl: n.actionUrl
        }));

        return NextResponse.json(mapped);
    } catch (error) {
        console.error("Failed to fetch notifications via API:", error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
