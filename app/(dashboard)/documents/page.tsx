'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { DocumentsClient } from '@/components/documents/DocumentsClient';

async function getAllDeliverables(userId: string) {
    // Busca todos os entregáveis dos projetos onde o usuário é membro ou dono
    const deliverables = await prisma.deliverable.findMany({
        where: {
            deletedAt: null,
            project: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId } } },
                ],
            },
        },
        include: {
            project: { select: { id: true, name: true } },
            task: { select: { id: true, title: true } },
            createdBy: { select: { id: true, fullName: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    return deliverables;
}

async function getProjects(userId: string) {
    return prisma.project.findMany({
        where: {
            deletedAt: null,
            OR: [
                { ownerId: userId },
                { members: { some: { userId } } },
            ],
        },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
    });
}

export default async function DocumentsPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const [deliverables, projects] = await Promise.all([
        getAllDeliverables(user.id),
        getProjects(user.id),
    ]);

    return (
        <DocumentsClient
            deliverables={JSON.parse(JSON.stringify(deliverables))}
            projects={JSON.parse(JSON.stringify(projects))}
        />
    );
}
