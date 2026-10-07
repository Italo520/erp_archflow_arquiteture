'use client';

import React from 'react';
import Link from 'next/link';

export default function ProjectList({ projects }) {
    if (!projects || projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-card rounded-xl border border-border shadow-card">
                <span className="material-symbols-outlined text-4xl text-muted-foreground mb-2">folder_off</span>
                <h3 className="text-lg font-bold text-foreground mb-2">Nenhum projeto encontrado</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm text-sm">
                    Você ainda não tem projetos criados. Comece criando seu primeiro projeto agora mesmo.
                </p>
                <Link href="/projects/new" className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all text-sm">
                    Criar Projeto
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id} className="group">
                    <div className="bg-card rounded-xl border border-border shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
                        <div
                            className={`h-36 w-full bg-cover bg-center ${!project.imageUrl ? 'bg-secondary' : ''}`}
                            style={{ backgroundImage: project.imageUrl ? `url('${project.imageUrl}')` : 'none' }}
                        >
                            {!project.imageUrl && (
                                <div className="w-full h-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-4xl text-muted-foreground/40">image</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                                    {project.name}
                                </h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ml-2 ${
                                    project.status === 'DONE'
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                        : project.status === 'IN_PROGRESS'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                }`}>
                                    {project.status || 'TO_DO'}
                                </span>
                            </div>
                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{project.clientName || 'Sem cliente'}</p>

                            <div className="mt-auto pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                <span>Atualizado há pouco</span>
                                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Ver detalhes <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
