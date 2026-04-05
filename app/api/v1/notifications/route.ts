import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth'; // Adjust based on your auth library

export async function GET() {
    try {
        // Simple mock or fetch from DB
        const notifications = [
            { id: 1, title: 'Bem-vindo ao ArchFlow', message: 'Estamos felizes em tê-lo aqui!', type: 'info', read: false, createdAt: new Date() }
        ];

        return NextResponse.json(notifications);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}
