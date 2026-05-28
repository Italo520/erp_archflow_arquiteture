'use client';

import React, { useState, useTransition } from 'react';
import { updateTask, deleteTask } from '@/app/actions/task';
// Assuming using native Dialog from radix or simple div overlay if Dialog not fully configured in project context,
// but the user has @radix-ui/react-dialog installed. I'll use a custom Sheet implementation using Tailwind for "Rich Aesthetics" as requested.
// A slide-over sheet.

interface TaskDetailsProps {
    task: any; // Type this properly if possible, but 'any' matches current loose typing in existing files
    projectId: string;
    onClose: () => void;
}

export function TaskDetails({ task, projectId, onClose }: TaskDetailsProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState(task.priority || 'MEDIUM');
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            try {
                await updateTask(task.id, projectId, {
                    title,
                    description,
                    priority,
                    dueDate: dueDate ? new Date(dueDate) : undefined
                });
                onClose();
            } catch (error) {
                console.error("Failed to update task", error);
                alert("Erro ao atualizar tarefa");
            }
        });
    };

    const handleDelete = () => {
        if (!confirm("Tem certeza que deseja excluir esta tarefa?")) return;
        startTransition(async () => {
            try {
                await deleteTask(task.id, projectId);
                onClose();
            } catch (error) {
                console.error("Failed to delete task", error);
                alert("Erro ao excluir tarefa");
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-md h-full bg-white dark:bg-surface-dark border-l border-gray-200 dark:border-border-dark shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Detalhes da Tarefa</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título</label>
                        <input
                            type="text"
                            className="w-full text-lg font-semibold border-b border-gray-200 dark:border-slate-700 bg-transparent focus:outline-none focus:border-primary pb-1"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Priority & Due Date Row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prioridade</label>
                            <select
                                className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                            >
                                <option value="LOW">Baixa</option>
                                <option value="MEDIUM">Média</option>
                                <option value="HIGH">Alta</option>
                                <option value="URGENT">Urgente</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data de Entrega</label>
                            <input
                                type="date"
                                className="w-full p-2 rounded bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm"
                                value={dueDate}
                                onChange={e => setDueDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
                        <textarea
                            className="w-full h-32 p-3 rounded bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm resize-none focus:ring-1 focus:ring-primary"
                            placeholder="Adicione detalhes sobre essa tarefa..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-slate-800">
                        <button
                            onClick={handleDelete}
                            className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Excluir
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isPending}
                                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded hover:bg-primary/90 disabled:opacity-50 shadow-md shadow-primary/20 flex items-center gap-2"
                            >
                                {isPending && <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>}
                                {isPending ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
