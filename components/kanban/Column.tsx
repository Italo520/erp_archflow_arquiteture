'use client';

import React, { useState, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';
import { createTask } from '@/app/actions/task';
import { 
    Plus, 
    X, 
    Loader2,
    Trash2
} from 'lucide-react';
import { deleteStage } from '@/app/actions/stage';

interface Task {
    id: string;
    title: string;
    description?: string | null;
    priority?: string | null;
    dueDate?: Date | string | null;
    stageId: string;
    projectId: string;
    position: number;
    [key: string]: any;
}

interface Stage {
    id: string;
    name: string;
    projectId: string;
    order: number;
}

interface KanbanColumnProps {
    stage: Stage;
    tasks: Task[];
    projectId: string;
    onTaskClick?: (task: Task) => void;
}

export function KanbanColumn({ stage, tasks, projectId, onTaskClick }: KanbanColumnProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [stageName, setStageName] = useState(stage.name);
    const [isPending, startTransition] = useTransition();

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: stage.id,
        data: { type: 'Column', stage }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-80 flex-shrink-0 flex flex-col bg-gray-50/50 dark:bg-surface-dark/50 rounded-xl border-2 border-primary/20 h-full max-h-full mr-4 opacity-40"
            />
        );
    }

    const handleCreateTask = () => {
        if (!newTaskTitle.trim()) return;

        startTransition(async () => {
            try {
                await createTask({
                    title: newTaskTitle,
                    projectId: projectId || stage.projectId, // Fallback if projectId prop missing but standard is usually passed down
                    stageId: stage.id,
                });
                setNewTaskTitle('');
                setIsAdding(false);
            } catch (error) {
                console.error("Failed to create task", error);
                alert("Erro ao criar tarefa");
            }
        });
    };

    // Update local state if prop changes
    // useEffect(() => setStageName(stage.name), [stage.name]); 
    // Actually better to just initialize and let server revalidate update it, 
    // but optimized optimistic updates are nicer. 
    // Let's keep it simple: local state for editing, commit on blur/enter.

    const handleRenameStage = async () => {
        if (!stageName.trim() || stageName === stage.name) {
            setIsEditingName(false);
            setStageName(stage.name); // revert if empty or unchanged
            return;
        }

        startTransition(async () => {
            try {
                await updateStage(stage.id, projectId || stage.projectId, { name: stageName.trim() });
                setIsEditingName(false);
            } catch (error) {
                console.error("Failed to rename stage", error);
                alert("Erro ao renomear etapa");
                // Revert UI state on error
                setStageName(stage.name);
                setIsEditingName(false);
            }
        });
    };

    const handleDeleteStage = async () => {
        if (tasks.length > 0) {
            alert("Não é possível deletar uma coluna que contém tarefas. Mova as tarefas primeiro.");
            return;
        }
        if (!confirm(`Tem certeza que deseja deletar a coluna "${stage.name}"?`)) return;

        startTransition(async () => {
            try {
                const result = await deleteStage(stage.id, projectId || stage.projectId);
                if (!result.success) {
                    alert(result.error);
                }
            } catch (error) {
                console.error("Failed to delete stage", error);
                alert("Erro ao deletar etapa");
            }
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="w-80 flex-shrink-0 flex flex-col bg-muted/40 rounded-xl border h-full max-h-full mr-4 transition-colors"
        >
            {/* Header */}
            <div
                {...attributes}
                {...listeners}
                className="flex items-center justify-between p-4 border-b bg-transparent rounded-t-xl cursor-grab active:cursor-grabbing hover:bg-muted/60 transition-colors group/header"
            >
                <div className={`flex items-center gap-2 flex-1 ${isPending ? 'opacity-50' : ''}`}>
                    {isEditingName ? (
                        <div className="relative w-full max-w-[150px]">
                            <input
                                autoFocus
                                type="text"
                                value={stageName}
                                onChange={(e) => setStageName(e.target.value)}
                                onBlur={handleRenameStage}
                                disabled={isPending}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameStage();
                                    if (e.key === 'Escape') {
                                        setStageName(stage.name);
                                        setIsEditingName(false);
                                    }
                                }}
                                onPointerDown={(e) => e.stopPropagation()}
                                onMouseDown={(e) => e.stopPropagation()}
                                className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800 border-none rounded px-1 py-0.5 focus:ring-2 focus:ring-primary w-full disabled:opacity-70"
                            />
                            {isPending && (
                                <div className="absolute right-1 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <h3
                            onClick={(e) => {
                                // e.stopPropagation(); // Ideally we want to allow drag on the text too, but click to edit...
                                // Common pattern: Click to edit, Drag elsewhere. 
                                // Or double click to edit? User asked for "click-to-edit" OR "pencil icon".
                                // Let's simplify: simple click edits? No, that conflicts with drag.
                                // Let's use an "Edit" icon/button appearing on hover, OR double click.
                                // User prompt: "Transformar o título da coluna em um campo de input 'click-to-edit' ou adicionar um ícone de engrenagem/lápis"
                                // I will implement double click on title, or single click on a pencil icon.
                                // Double click is cleaner for the main text.
                                setIsEditingName(true);
                            }}
                            className="text-sm font-bold text-slate-800 dark:text-slate-100 cursor-text hover:underline decoration-dashed underline-offset-4 decoration-gray-300"
                            title="Clique para editar"
                        >
                            {stage.name}
                        </h3>
                    )}
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-sm">
                        {tasks.length}
                    </span>
                </div>
                <div className="flex items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStage();
                        }}
                        disabled={isPending}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded opacity-0 group-hover/header:opacity-100 transition-all"
                        title="Deletar coluna"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto p-3 min-h-0 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col min-h-[50px] gap-2">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} onClick={() => onTaskClick && onTaskClick(task)} />
                        ))}
                    </div>
                </SortableContext>
            </div>

            {/* Footer */}
            <div className="p-3 pt-0">
                {isAdding ? (
                    <div className="bg-white dark:bg-surface-dark p-2 rounded-lg border border-primary/20 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                        <textarea
                            autoFocus
                            placeholder="Descreva a tarefa..."
                            className="w-full text-sm bg-transparent border-none resize-none focus:ring-0 p-0 text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                            rows={2}
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCreateTask();
                                }
                                if (e.key === 'Escape') {
                                    setIsAdding(false);
                                }
                            }}
                        />
                        <div className="flex items-center justify-end gap-2 mt-2">
                            <button
                                onClick={() => setIsAdding(false)}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={!newTaskTitle.trim() || isPending}
                                className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors"
                            >
                                {isPending ? 'Criando...' : 'Adicionar'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full flex items-center gap-2 p-2.5 hover:bg-white/40 dark:hover:bg-white/5 rounded-xl text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-all duration-300 group border border-transparent hover:border-primary/20 hover:shadow-sm"
                    >
                        <Plus className="h-4 w-4 group-hover:scale-125 transition-transform" />
                        <span className="text-sm font-display font-bold">Adicionar Tarefa</span>
                    </button>
                )}
            </div>
        </div>
    );
}
