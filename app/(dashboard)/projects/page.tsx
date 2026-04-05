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
    const sanitizedProjects = projects.map((p: any) => ({
        ...p,
        plannedCost: p.plannedCost ? Number(p.plannedCost) : 0,
        actualCost: p.actualCost ? Number(p.actualCost) : 0,
        // Also sanitize nested objects if necessary
    }));

    console.log(`SERVER PAGE: Fetching projects (${sanitizedProjects.length}) and columns (${columns.length})`);

    let finalProjects = sanitizedProjects;
    let finalColumns = columns;

    // RESILIENCE: If DB columns are missing but projects exist, create virtual columns from project statuses
    if (finalColumns.length === 0 && sanitizedProjects.length > 0) {
        console.warn("SERVER PAGE: Columns missing. Generating virtual columns from project statuses...");
        const uniqueStatuses = Array.from(new Set(sanitizedProjects.map((p: any) => p.status)));
        finalColumns = uniqueStatuses.map((status: string, index: number) => ({
            id: status,
            title: status === 'PLANNING' ? 'Planejamento' :
                   status === 'IN_PROGRESS' ? 'Em Andamento' :
                   status === 'ON_HOLD' ? 'Pausado' :
                   status === 'COMPLETED' ? 'Concluído' : status,
            color: 'bg-blue-500',
            order: index
        }));
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
