import React from 'react';
import { getProjectById, getProjectMetrics } from "@/app/actions/project";
import KanbanBoard from '@/components/kanban/KanbanBoard';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProjectPhasesTab from '@/components/projects/ProjectPhasesTab';
import ProjectDocumentsTab from '@/components/projects/ProjectDocumentsTab';
import ProjectFinancialTab from '@/components/projects/ProjectFinancialTab';
import ProjectTeamTab from '@/components/projects/ProjectTeamTab';
import { ProjectOverview } from '@/components/projects/ProjectOverview';


export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch project with stages and tasks
    const project = await getProjectById(id);
    // Fetch metrics
    const metricsResult = await getProjectMetrics(id);
    const metrics = metricsResult.success ? metricsResult.data : null;

    if (!project) {
        return notFound();
    }

    return (
        <div className="h-full flex flex-col p-6">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <Link href="/dashboard" className="text-xs text-gray-500 hover:text-primary mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">arrow_back</span>
                        Voltar para Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    <p className="text-muted-foreground">{project.projectType || 'Projeto'}</p>
                </div>
                <Button>Nova Atividade</Button>
            </header>

            <Tabs defaultValue="activities" className="flex-1 flex flex-col">
                <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 mb-6 overflow-x-auto overflow-y-hidden scrollbar-none flex whitespace-nowrap">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger value="activities" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Atividades (Kanban)
                    </TabsTrigger>
                    <TabsTrigger value="phases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Fases Tempo
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Financeiro
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Documentos
                    </TabsTrigger>
                    <TabsTrigger value="team" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent">
                        Equipe
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="flex-1">
                    <ProjectOverview project={project} />
                </TabsContent>

                <TabsContent value="activities" className="flex-1 h-full min-h-[500px]">
                    <KanbanBoard project={project} />
                </TabsContent>

                <TabsContent value="phases" className="flex-1">
                    <ProjectPhasesTab project={project} />
                </TabsContent>

                <TabsContent value="documents" className="flex-1">
                    <ProjectDocumentsTab project={project} />
                </TabsContent>

                <TabsContent value="financial" className="flex-1">
                    <ProjectFinancialTab project={project} metrics={metrics} />
                </TabsContent>

                <TabsContent value="team" className="flex-1">
                    <ProjectTeamTab project={project} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
