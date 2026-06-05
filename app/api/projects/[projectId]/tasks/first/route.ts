import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { projectId } = await params;

        const task = await prisma.task.findFirst({
            where: { projectId, deletedAt: null },
            select: { id: true },
            orderBy: { createdAt: 'asc' },
        });

        if (!task) {
            return NextResponse.json(
                { error: 'Nenhuma tarefa encontrada neste projeto. Crie uma tarefa antes de adicionar documentos.' },
                { status: 404 }
            );
        }

        return NextResponse.json({ taskId: task.id });
    } catch (err) {
        console.error('[FIRST_TASK_ERROR]', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}
