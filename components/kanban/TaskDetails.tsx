'use client';

import React, { useState, useTransition, useRef } from 'react';
import { updateTask, deleteTask } from '@/app/actions/task';
import { RichTextEditor } from './RichTextEditor';
import { Paperclip, File, X, UploadCloud, Calendar, Flag, AlignLeft } from 'lucide-react';

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
    const [documents, setDocuments] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setDocuments([...documents, ...Array.from(e.target.files)]);
        }
    };

    const removeFile = (index: number) => {
        const newDocs = [...documents];
        newDocs.splice(index, 1);
        setDocuments(newDocs);
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
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase mb-2">
                            <AlignLeft className="h-4 w-4" />
                            Descrição
                        </label>
                        <RichTextEditor 
                            content={description} 
                            onChange={setDescription} 
                        />
                    </div>

                    {/* Documents / Attachments */}
                    <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase mb-2">
                            <Paperclip className="h-4 w-4" />
                            Anexos
                        </label>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full border-2 border-dashed border-gray-200 dark:border-slate-700 hover:border-primary/50 hover:bg-primary/5 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors"
                        >
                            <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Clique para anexar arquivos</p>
                            <p className="text-xs text-slate-500 mt-1">PDF, Imagens, Planilhas (Max 5MB)</p>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                multiple 
                                onChange={handleFileChange}
                            />
                        </div>

                        {documents.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {documents.map((file, i) => (
                                    <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</span>
                                        </div>
                                        <button 
                                            onClick={() => removeFile(i)}
                                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
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
