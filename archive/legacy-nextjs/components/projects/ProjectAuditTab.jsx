'use client';

import React, { useEffect, useState } from 'react';
import { getProjectAuditLogs } from '@/app/actions/audit';
import { Shield, Loader2, Clock, History, AlertTriangle } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ProjectAuditTab({ project }) {
    const { data: session } = useSession();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if user is owner before even trying to fetch
    const isOwner = project.members?.some(m => m.userId === session?.user?.id && m.role === 'OWNER') || project.ownerId === session?.user?.id;

    useEffect(() => {
        if (!isOwner) {
            return;
        }

        const fetchLogs = async () => {
            const res = await getProjectAuditLogs(project.id);
            if (res.success) {
                setLogs(res.data);
            } else {
                setError(res.error);
            }
            setIsLoading(false);
        };
        fetchLogs();
    }, [project.id, isOwner]);

    if (!isOwner) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-neutral-800">
                <Shield className="size-12 text-gray-300 dark:text-neutral-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Acesso Restrito</h3>
                <p className="text-gray-500 text-center max-w-sm mt-2">
                    A trilha de auditoria contém informações sensíveis e está disponível apenas para o proprietário do projeto.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12 bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-neutral-800">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-xl flex items-center gap-3">
                <AlertTriangle className="size-6" />
                <div>
                    <h3 className="font-bold">Erro</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    const formatDiff = (changes) => {
        if (!changes) return <span className="text-gray-400 italic">Sem detalhes</span>;
        
        try {
            const oldData = changes.old ? JSON.stringify(changes.old, null, 2) : '';
            const newData = changes.new ? JSON.stringify(changes.new, null, 2) : '';
            
            return (
                <div className="flex flex-col lg:flex-row gap-4 mt-3 w-full font-mono text-xs overflow-x-auto">
                    {oldData && (
                        <div className="flex-1 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded p-3 text-red-800 dark:text-red-400">
                            <div className="font-bold mb-1 text-[10px] uppercase">Removido / Anterior</div>
                            <pre className="whitespace-pre-wrap break-all">{oldData}</pre>
                        </div>
                    )}
                    {newData && (
                        <div className="flex-1 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/50 rounded p-3 text-green-800 dark:text-green-400">
                            <div className="font-bold mb-1 text-[10px] uppercase">Adicionado / Novo</div>
                            <pre className="whitespace-pre-wrap break-all">{newData}</pre>
                        </div>
                    )}
                </div>
            );
        } catch (e) {
            return <pre className="text-xs text-gray-500 mt-2">{JSON.stringify(changes)}</pre>;
        }
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'UPDATE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center bg-gray-50/50 dark:bg-[#264532]/20">
                <div className="flex items-center gap-3">
                    <History className="size-6 text-primary" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trilha de Auditoria</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Registro imutável de ações críticas do projeto (Retenção 90 dias).
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-0">
                {logs.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">Nenhum evento registrado ainda.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                        {logs.map((log) => (
                            <div key={log.id} className="p-6 hover:bg-gray-50/50 dark:hover:bg-neutral-900/20 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <div className="flex-shrink-0 w-48">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                                            {log.user?.fullName || 'Sistema'}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock className="size-3" />
                                            {new Date(log.createdAt).toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                                                {log.entityType} <span className="text-gray-400 font-normal">({log.entityId.substring(0,8)})</span>
                                            </span>
                                        </div>
                                        
                                        {formatDiff(log.changes)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
