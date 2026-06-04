'use client';

import React, { useMemo } from 'react';
import { TaskCard } from './TaskCard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TaskListView({ stages, onTaskClick }) {
    const allTasks = useMemo(() => {
        const tasks = [];
        stages.forEach(stage => {
            stage.tasks.forEach(task => {
                tasks.push({ ...task, stageName: stage.name });
            });
        });
        return tasks;
    }, [stages]);

    if (allTasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <p>Nenhuma tarefa encontrada neste projeto.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-auto p-6 bg-white dark:bg-background-dark">
            <div className="max-w-6xl mx-auto border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                        <tr>
                            <th className="px-4 py-3">Tarefa</th>
                            <th className="px-4 py-3 w-32">Status (Coluna)</th>
                            <th className="px-4 py-3 w-24">Prioridade</th>
                            <th className="px-4 py-3 w-32">Responsável</th>
                            <th className="px-4 py-3 w-32">Prazo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {allTasks.map(task => (
                            <tr 
                                key={task.id} 
                                onClick={() => onTaskClick(task)}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors"
                            >
                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                                    {task.title}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                                        {task.stageName}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    {task.priority === 'HIGH' && <span className="text-destructive font-bold text-xs uppercase">Alta</span>}
                                    {task.priority === 'MEDIUM' && <span className="text-orange-500 font-bold text-xs uppercase">Média</span>}
                                    {(!task.priority || task.priority === 'LOW') && <span className="text-primary font-bold text-xs uppercase">Baixa</span>}
                                </td>
                                <td className="px-4 py-3">
                                    {task.assignee ? task.assignee.fullName.split(' ')[0] : <span className="text-slate-400 italic">Não atribuído</span>}
                                </td>
                                <td className="px-4 py-3">
                                    {task.dueDate ? format(new Date(task.dueDate), "dd MMM yyyy", { locale: ptBR }) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
