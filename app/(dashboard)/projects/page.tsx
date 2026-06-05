import React from 'react';
import { listProjects } from '@/app/actions/project';
import { getKanbanColumns } from '@/app/actions/kanban';
import ProjectsView from '@/components/projects/ProjectsView';

export default async function ProjectsPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; status?: string; clientId?: string }>
}) {
    const sp = await searchParams;
    const filters = {
        clientId: sp.clientId,
        status: sp.status === 'ALL' ? undefined : sp.status
    };

    const [projectsResult, columnsResult] = await Promise.all([
        listProjects(filters),
        getKanbanColumns()
    ]);

    let projects = projectsResult.success ? projectsResult.data || [] : [];
    let columns = columnsResult.success ? columnsResult.data || [] : [];

    // Sanitize Decimal objects for Next.js Client Component serialization
    const sanitizedProjects = projects.map((p: any) => {
        let status = 'PLANNING';
        if (p.currentColumn) {
            const title = p.currentColumn.title;
            if (title === 'Planejamento') status = 'PLANNING';
            else if (title === 'Em Andamento') status = 'IN_PROGRESS';
            else if (title === 'Pausado') status = 'ON_HOLD';
            else if (title === 'Concluído') status = 'COMPLETED';
            else if (title === 'Cancelado') status = 'CANCELLED';
            else status = p.currentColumnId; // Custom column UUID
        } else if (p.currentColumnId) {
            status = p.currentColumnId;
        }
        return {
            ...p,
            status,
            plannedCost: p.plannedCost ? Number(p.plannedCost) : 0,
            actualCost: p.actualCost ? Number(p.actualCost) : 0,
        };
    });

    console.log(`SERVER PAGE: Fetching projects (${sanitizedProjects.length}) and columns (${columns.length})`);

    let finalProjects = sanitizedProjects;
    let finalColumns = columns;

    // RESILIENCE: If DB columns are missing, generate virtual columns
    if (finalColumns.length === 0) {
        console.warn("SERVER PAGE: Columns missing. Generating virtual columns...");
        
        const defaultOrder = ['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];
        // Garante que as colunas padrão sempre estejam presentes, além de qualquer coluna customizada
        const uniqueStatuses = Array.from(new Set([
            'PLANNING',
            'IN_PROGRESS',
            'ON_HOLD',
            'COMPLETED',
            ...sanitizedProjects.map((p: any) => p.status).filter(Boolean)
        ]));
        
        // Mantém a ordem fixa para os quadros não ficarem trocando de posição sozinhos
        uniqueStatuses.sort((a: any, b: any) => {
            const indexA = defaultOrder.indexOf(a);
            const indexB = defaultOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        });

        // Busca os nomes das colunas no banco para exibir corretamente
        const { prisma } = await import('@/lib/prisma');
        const validIds = uniqueStatuses.filter((s: any) => s && s.length > 20); // Basic check for UUID
        const dbColumns = validIds.length > 0 ? await prisma.projectKanbanColumn.findMany({
            where: { id: { in: validIds } },
            select: { id: true, title: true }
        }) : [];

        finalColumns = uniqueStatuses.map((status: string, index: number) => {
            const dbCol = dbColumns.find((c: any) => c.id === status);
            return {
                id: status || 'unassigned',
                title: dbCol ? dbCol.title : (
                       status === 'PLANNING' ? 'Planejamento' :
                       status === 'IN_PROGRESS' ? 'Em Andamento' :
                       status === 'ON_HOLD' ? 'Pausado' :
                       status === 'COMPLETED' ? 'Concluído' : 
                       status === 'CANCELLED' ? 'Cancelado' : (status || 'Sem Status')),
                color: status === 'PLANNING' ? 'bg-blue-500' :
                       status === 'IN_PROGRESS' ? 'bg-emerald-500' :
                       status === 'ON_HOLD' ? 'bg-amber-500' :
                       status === 'COMPLETED' ? 'bg-slate-500' : 'bg-slate-400',
                order: index
            };
        });
    }

    // Client-side search refinement for MVP
    if (sp.q) {
        const q = sp.q.toLowerCase();
        finalProjects = sanitizedProjects.filter((p: any) => p.name.toLowerCase().includes(q));
    }

    return (
        <ProjectsView projects={finalProjects} columns={finalColumns} />
    );
}
