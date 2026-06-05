import React from 'react';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { getProjectById } from '@/app/actions/project';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
        return notFound();
    }

    return (
        <div className="p-6 lg:p-10 w-full min-h-screen">
            <div className="mb-6 flex flex-col gap-4">
                <Link href={`/projects/${id}`} className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar para o Projeto
                </Link>
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Editar Projeto</h1>
                    <p className="text-muted-foreground">
                        {project.name}
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Projeto</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm initialData={project} isEditing />
                </CardContent>
            </Card>
        </div>
    );
}
