'use client';

import React, { useState, useTransition } from 'react';
import { Plus, X, Loader2 } from 'lucide-react';
import { createStage } from '@/app/actions/stage';

export function AddColumnButton({ projectId, order, onAdded }: { projectId: string, order: number, onAdded: (stage: any) => void }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        if (!title.trim()) return;
        startTransition(async () => {
            try {
                const result = await createStage(projectId, { name: title.trim(), order });
                if (result.success && result.stage) {
                    onAdded({ ...result.stage, tasks: [] });
                    setTitle('');
                    setIsAdding(false);
                } else {
                    alert(result.error || 'Erro ao criar coluna');
                }
            } catch (err) {
                console.error(err);
                alert('Erro inesperado');
            }
        });
    };

    if (isAdding) {
        return (
            <div className="w-80 flex-shrink-0 flex flex-col bg-gray-50/80 dark:bg-surface-dark rounded-xl border border-gray-200/60 dark:border-border-dark h-fit p-3 animate-in fade-in zoom-in-95 duration-200">
                <input
                    autoFocus
                    type="text"
                    placeholder="Nome da coluna..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate();
                        if (e.key === 'Escape') setIsAdding(false);
                    }}
                    disabled={isPending}
                    className="w-full text-sm font-bold bg-white dark:bg-slate-800 border-none rounded px-2 py-1.5 focus:ring-2 focus:ring-primary disabled:opacity-50 text-slate-800 dark:text-slate-100 placeholder:font-normal"
                />
                <div className="flex items-center justify-end gap-2 mt-2">
                    <button
                        onClick={() => setIsAdding(false)}
                        className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!title.trim() || isPending}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-1"
                    >
                        {isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                        Adicionar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsAdding(true)}
            className="w-80 flex-shrink-0 flex items-center gap-2 p-4 bg-gray-50/30 dark:bg-surface-dark/30 hover:bg-gray-100/50 dark:hover:bg-surface-dark/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700 hover:border-primary/50 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-primary transition-all duration-300 group h-[58px]"
        >
            <Plus className="h-5 w-5 group-hover:scale-125 transition-transform" />
            <span className="text-sm font-display font-bold">Nova Coluna</span>
        </button>
    );
}
