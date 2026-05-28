'use client';

import React, { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getNotifications, markAsRead as markAsReadDb, clearNotifications as clearNotificationsDb } from '@/app/actions/notification';
import { useSession } from 'next-auth/react';
import { Bell, BellOff, Info, CheckCircle2, AlertTriangle, XCircle, X, Settings } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const NotificationBell = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const userId = session?.user?.id || 'global';

    const {
        notifications,
        isConnected,
        unreadCount,
        markAsRead: wsMarkAsRead,
        clearNotifications: wsClearNotifications,
        setInitialNotifications
    } = useWebSocket(userId);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const loadNotifications = async () => {
            try {
                const data = await getNotifications();
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
        wsMarkAsRead(notificationId);
        try {
            await markAsReadDb(notificationId);
        } catch (error) {
            console.error('Failed to mark as read on server', error);
        }
    };

    const handleClearNotifications = async () => {
        wsClearNotifications();
        try {
            await clearNotificationsDb();
        } catch (error) {
            console.error('Failed to clear notifications on server', error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.actionUrl) {
            setIsOpen(false);
            router.push(notification.actionUrl);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="size-5" />;
            case 'warning': return <AlertTriangle className="size-5" />;
            case 'error': return <XCircle className="size-5" />;
            default: return <Info className="size-5" />;
        }
    };

    const groupNotifications = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = { hoje: [], ontem: [], anteriores: [] };

        notifications.forEach(notif => {
            const dateStr = notif.timestamp || notif.createdAt;
            if (!dateStr) return;
            
            const notifDate = new Date(dateStr);
            notifDate.setHours(0, 0, 0, 0);

            if (notifDate.getTime() === today.getTime()) {
                groups.hoje.push(notif);
            } else if (notifDate.getTime() === yesterday.getTime()) {
                groups.ontem.push(notif);
            } else {
                groups.anteriores.push(notif);
            }
        });

        return groups;
    };

    const grouped = groupNotifications();

    const NotificationItem = ({ notification }) => (
        <div
            onClick={() => handleNotificationClick(notification)}
            className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer border-b border-gray-100 dark:border-neutral-800 ${!notification.read ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full flex-shrink-0 ${notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                    notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        notification.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-1 ${!notification.read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-gray-300'}`}>
                        {notification.title || 'Notificação'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-gray-400 text-[10px] mt-2 font-medium">
                        {new Date(notification.timestamp || notification.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {!notification.read && (
                    <div className="size-2 bg-primary rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                )}
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center rounded-full size-10 hover:bg-surface-dark text-white transition-colors relative group"
                title="Notificações"
            >
                <Bell className={`size-5 group-hover:scale-110 transition-transform ${unreadCount > 0 ? 'animate-pulse text-primary' : ''}`} />

                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-4 bg-primary rounded-full border border-background-dark flex items-center justify-center text-[10px] font-bold text-background-dark">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                <span
                    className={`absolute bottom-1.5 right-1.5 size-2 rounded-full border border-background-dark ${isConnected ? 'bg-primary' : 'bg-muted'}`}
                    title={isConnected ? 'Conectado' : 'Desconectado'}
                />
            </button>

            {/* Slide-over Drawer Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer Panel */}
                    <div className="relative w-full max-w-sm h-full bg-white dark:bg-surface-dark shadow-2xl flex flex-col transform transition-transform border-l border-gray-200 dark:border-neutral-800">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 dark:border-neutral-800">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white">Notificações</h2>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-bold">
                                        {unreadCount} novas
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Link 
                                    href="/settings" 
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                    <Settings className="size-5" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between px-6 py-3 bg-gray-50/50 dark:bg-neutral-900/50 border-b border-gray-100 dark:border-neutral-800">
                                <button
                                    onClick={() => notifications.filter(n => !n.read).forEach(n => handleMarkAsRead(n.id))}
                                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                                >
                                    Marcar todas como lidas
                                </button>
                                <button
                                    onClick={handleClearNotifications}
                                    className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                                >
                                    Limpar Histórico
                                </button>
                            </div>
                        )}

                        {/* List Area */}
                        <div className="flex-1 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                                    <div className="size-24 rounded-full bg-gray-50 dark:bg-neutral-800 flex items-center justify-center mb-4">
                                        <BellOff className="size-10 text-gray-300 dark:text-neutral-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Tudo limpo por aqui</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[200px]">
                                        Você não possui notificações no momento. Nós te avisaremos quando algo acontecer.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {grouped.hoje.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Hoje</h4>
                                            {grouped.hoje.map(n => <NotificationItem key={n.id} notification={n} />)}
                                        </div>
                                    )}
                                    {grouped.ontem.length > 0 && (
                                        <div className="mt-4">
                                            <h4 className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Ontem</h4>
                                            {grouped.ontem.map(n => <NotificationItem key={n.id} notification={n} />)}
                                        </div>
                                    )}
                                    {grouped.anteriores.length > 0 && (
                                        <div className="mt-4 pb-6">
                                            <h4 className="px-6 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Anteriores</h4>
                                            {grouped.anteriores.map(n => <NotificationItem key={n.id} notification={n} />)}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;
