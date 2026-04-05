'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import NotificationService from '@/services/notification.service';
import { useSession } from 'next-auth/react';

const NotificationBell = () => {
    const { data: session } = useSession();
    const userId = session?.user?.id || 'global';

    const {
        notifications,
        isConnected,
        unreadCount,
        markAsRead: wsMarkAsRead,
        clearNotifications,
        setInitialNotifications
    } = useWebSocket(userId);

    const [isOpen, setIsOpen] = useState(false);

    // Fetch initial notifications on mount
    useEffect(() => {
        const loadNotifications = async () => {
            try {
                // If the service doesn't work, this will fail gracefully
                const data = await NotificationService.getNotifications();
                if (data && Array.isArray(data)) {
                    setInitialNotifications(data);
                }
            } catch (error) {
                console.error('Failed to load initial notifications', error);
            }
        };

        if (session?.user?.id) {
            loadNotifications();
        }
    }, [session?.user?.id, setInitialNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        // Optimistic update
        wsMarkAsRead(notificationId);

        try {
            await NotificationService.markAsRead(notificationId);
        } catch (error) {
            console.error('Failed to mark as read on server', error);
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center rounded-full size-10 hover:bg-surface-dark text-white transition-colors relative"
                title="Notificações"
            >
                <span className="material-symbols-outlined notranslate" translate="no">notifications</span>

                {/* Unread Count Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-4 bg-primary rounded-full border border-background-dark flex items-center justify-center text-[10px] font-bold text-background-dark">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                {/* Connection Status Indicator */}
                <span
                    className={`absolute bottom-1.5 right-1.5 size-2 rounded-full border border-background-dark ${isConnected ? 'bg-primary' : 'bg-muted'
                        }`}
                    title={isConnected ? 'Conectado em Tempo Real' : 'Desconectado'}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notification Panel */}
                    <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] sm:w-80 bg-surface-dark border border-border-dark rounded-xl shadow-xl max-h-[80vh] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border-dark">
                            <h3 className="text-white font-bold text-sm">
                                Notificações {unreadCount > 0 && `(${unreadCount})`}
                            </h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={clearNotifications}
                                    className="text-xs text-text-secondary hover:text-primary transition-colors"
                                >
                                    Limpar tudo
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1 bg-white dark:bg-neutral-800">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary dark:text-gray-400">
                                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-50 notranslate" translate="no">
                                        notifications_off
                                    </span>
                                    <p className="text-sm">Nenhuma notificação</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-neutral-700">
                                    {notifications.map((notification, index) => (
                                        <div
                                            key={notification.id || index}
                                            onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                                                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        notification.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    <span className="material-symbols-outlined text-sm notranslate" translate="no">
                                                        {notification.icon || 'info'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-medium mb-1 ${!notification.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'}`}>
                                                        {notification.title || 'Notificação'}
                                                    </p>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    {notification.timestamp && (
                                                        <p className="text-gray-400 text-[10px] mt-1">
                                                            {new Date(notification.timestamp).toLocaleString('pt-BR')}
                                                        </p>
                                                    )}
                                                    {/* Compatibilidade com dados antigos */}
                                                    {notification.createdAt && !notification.timestamp && (
                                                        <p className="text-gray-400 text-[10px] mt-1">
                                                            {new Date(notification.createdAt).toLocaleString('pt-BR')}
                                                        </p>
                                                    )}
                                                </div>
                                                {!notification.read && (
                                                    <div className="size-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default NotificationBell;
