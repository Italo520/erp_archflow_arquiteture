"use client";

import React, { useState, useEffect } from 'react';
import ProjectFilters from '@/components/projects/ProjectFilters';
import ProjectsTable from '@/components/projects/ProjectsTable';
import ProjectKanban from '@/components/projects/ProjectKanban';
import ExportButton from '@/components/projects/ExportButton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List } from 'lucide-react';

interface ProjectsViewProps {
    projects: any[];
    columns: any[];
}

export default function ProjectsView({ projects, columns }: ProjectsViewProps) {
    const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
        if (typeof window !== 'undefined') {
            const savedMode = localStorage.getItem('projectsViewMode');
            if (savedMode === 'list' || savedMode === 'kanban') {
                return savedMode;
            }
        }
        return 'list';
    });

    const handleViewChange = (mode: 'list' | 'kanban') => {
        setViewMode(mode);
        localStorage.setItem('projectsViewMode', mode);
    };

    // Prepare data for Export (flatten objects if necessary)
    const exportData = projects.map(p => ({
        ID: p.id,
        Nome: p.name,
        Cliente: p.client?.name || '',
        Status: p.status,
        Tipo: p.projectType || '',
        Inicio: p.startDate ? new Date(p.startDate).toLocaleDateString() : '',
        Entrega: p.estimatedEndDate ? new Date(p.estimatedEndDate).toLocaleDateString() : '',
    }));

    return (
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em]">Projetos</h1>
                    <p className="text-slate-500 dark:text-[#95c6a9] text-base font-normal leading-normal max-w-2xl">
                        Gerencie seus projetos arquitetônicos, fases e cronogramas.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton data={exportData} filename="relatorio_projetos" />

                    <div className="flex items-center bg-muted p-1 rounded-md border">
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewChange('list')}
                            className="h-8 px-2"
                        >
                            <List className="h-4 w-4 mr-2" /> Lista
                        </Button>
                        <Button
                            variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => handleViewChange('kanban')}
                            className="h-8 px-2"
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" /> Kanban
                        </Button>
                    </div>

                    <Link href="/projects/new">
                        <Button className="font-bold shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
                            Novo Projeto
                        </Button>
                    </Link>
                </div>
            </div>

            <ProjectFilters />

            {viewMode === 'list' ? (
                <ProjectsTable projects={projects} />
            ) : (
                <ProjectKanban projects={projects} columns={columns} />
            )}
        </div>
    );
}
