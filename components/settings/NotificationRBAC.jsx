'use client';

import React, { useEffect, useState } from 'react';
import { getSystemNotificationRules, updateSystemNotificationRule, NOTIFICATION_EVENTS, NOTIFICATION_ROLES } from '@/app/actions/notificationSettings';
import { BellRing, ShieldAlert, Loader2 } from 'lucide-react';

const NotificationRBAC = () => {
    const [rules, setRules] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRules = async () => {
            setIsLoading(true);
            const response = await getSystemNotificationRules();
            if (response.success) {
                setRules(response.data);
            } else {
                setError(response.error);
            }
            setIsLoading(false);
        };
        fetchRules();
    }, []);

    const isEnabled = (role, eventType) => {
        const rule = rules.find(r => r.role === role && r.eventType === eventType);
        // Defaults to true if no rule exists in the db
        return rule ? rule.enabled : true;
    };

    const handleToggle = async (role, eventType) => {
        const currentlyEnabled = isEnabled(role, eventType);
        const newEnabled = !currentlyEnabled;

        // Optimistic update
        setRules(prev => {
            const exists = prev.find(r => r.role === role && r.eventType === eventType);
            if (exists) {
                return prev.map(r => r.role === role && r.eventType === eventType ? { ...r, enabled: newEnabled } : r);
            } else {
                return [...prev, { role, eventType, enabled: newEnabled }];
            }
        });

        // Server update
        const res = await updateSystemNotificationRule(role, eventType, newEnabled);
        if (!res.success) {
            // Revert on failure
            setRules(prev => prev.map(r => r.role === role && r.eventType === eventType ? { ...r, enabled: currentlyEnabled } : r));
            console.error(res.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="size-6" />
                <div>
                    <h3 className="font-bold">Acesso Restrito</h3>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-transparent">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-[#264532] pb-4">
                <BellRing className="text-primary size-6" />
                <div>
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold">Regras de Notificação (RBAC)</h3>
                    <p className="text-gray-500 dark:text-text-secondary text-sm">Controle quais notificações cada perfil de usuário receberá pelo sistema.</p>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="p-4 border-b border-gray-200 dark:border-neutral-700 text-sm font-semibold text-slate-700 dark:text-gray-300">
                                Gatilho do Evento
                            </th>
                            {NOTIFICATION_ROLES.map(role => (
                                <th key={role.id} className="p-4 border-b border-gray-200 dark:border-neutral-700 text-sm font-semibold text-center text-slate-700 dark:text-gray-300">
                                    {role.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {NOTIFICATION_EVENTS.map((event, idx) => (
                            <tr key={event.id} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-neutral-800/20' : ''}>
                                <td className="p-4 border-b border-gray-200 dark:border-neutral-800">
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">{event.label}</span>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1">{event.id}</div>
                                </td>
                                {NOTIFICATION_ROLES.map(role => {
                                    const enabled = isEnabled(role.id, event.id);
                                    return (
                                        <td key={role.id} className="p-4 border-b border-gray-200 dark:border-neutral-800 text-center align-middle">
                                            <button
                                                onClick={() => handleToggle(role.id, event.id)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark ${enabled ? 'bg-primary' : 'bg-gray-200 dark:bg-neutral-700'}`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                                />
                                            </button>
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-[#264532]">
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <ShieldAlert className="size-4" />
                    Alterações são salvas automaticamente.
                </p>
            </div>
        </div>
    );
};

export default NotificationRBAC;
