'use client';

import React, { useEffect, useState } from 'react';
import { getUserNotificationPreferences, updateUserNotificationPreference } from '@/app/actions/notificationSettings';
import { NOTIFICATION_EVENTS } from '@/lib/notification-constants';
import { Bell, Loader2, ShieldAlert } from 'lucide-react';

const UserPreferences = () => {
    const [prefs, setPrefs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPrefs = async () => {
            setIsLoading(true);
            const response = await getUserNotificationPreferences();
            if (response.success) {
                setPrefs(response.data);
            }
            setIsLoading(false);
        };
        fetchPrefs();
    }, []);

    const isEnabled = (eventType) => {
        const pref = prefs.find(p => p.eventType === eventType);
        return pref ? pref.enabled : true;
    };

    const handleToggle = async (eventType) => {
        const currentlyEnabled = isEnabled(eventType);
        const newEnabled = !currentlyEnabled;

        // Optimistic update
        setPrefs(prev => {
            const exists = prev.find(p => p.eventType === eventType);
            if (exists) {
                return prev.map(p => p.eventType === eventType ? { ...p, enabled: newEnabled } : p);
            } else {
                return [...prev, { eventType, enabled: newEnabled }];
            }
        });

        // Server update
        const res = await updateUserNotificationPreference(eventType, newEnabled);
        if (!res.success) {
            setPrefs(prev => prev.map(p => p.eventType === eventType ? { ...p, enabled: currentlyEnabled } : p));
            console.error(res.error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-200 dark:border-[#264532] pb-2">
                <Bell className="size-5 text-primary" />
                <h3 className="text-slate-900 dark:text-white text-lg font-bold">Minhas Notificações</h3>
            </div>
            
            <p className="text-gray-500 dark:text-text-secondary text-sm mb-4">
                Escolha quais notificações você deseja receber no sistema. (Nota: Algumas notificações críticas podem não ser desativáveis dependendo da configuração global).
            </p>

            <div className="flex flex-col gap-3">
                {NOTIFICATION_EVENTS.map(event => {
                    const enabled = isEnabled(event.id);
                    return (
                        <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#264532]/30 rounded-xl border border-gray-100 dark:border-transparent">
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{event.label}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{event.id}</p>
                            </div>
                            <button
                                onClick={() => handleToggle(event.id)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-neutral-600'}`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserPreferences;
