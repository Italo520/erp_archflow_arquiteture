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
            className={`p-4 hover:bg-secondary/50 transition-colors cursor-pointer border-b border-border ${!notification.read ? 'bg-primary/5' : ''}`}
        >
            <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                    notification.type === 'success' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' :
                    notification.type === 'warning' ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' :
                    notification.type === 'error'   ? 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400' :
                                                      'bg-primary/10 text-primary'
                }`}>
                    {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-1 ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'}`}>
                        {notification.title || 'Notificação'}
                    </p>
                    <p className="text-muted-foreground text-xs line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-muted-foreground/60 text-[10px] mt-1.5 font-medium">
                        {new Date(notification.timestamp || notification.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {!notification.read && (
                    <div className="size-2 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                )}
            </div>
        </div>
    );


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center rounded-lg size-9 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors relative group"
                title="Notificações"
            >
                <Bell className={`size-5 group-hover:scale-110 transition-transform ${unreadCount > 0 ? 'animate-pulse text-primary' : ''}`} />

                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 size-4 bg-primary rounded-full border border-background flex items-center justify-center text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}

                <span
                    className={`absolute bottom-1.5 right-1.5 size-2 rounded-full border border-background ${isConnected ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}
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
                    <div className="relative w-full max-w-sm h-full bg-card shadow-2xl flex flex-col transform transition-transform border-l border-border">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-foreground">Notificações</h2>
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
                                    className="p-1.5 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-secondary"
                                >
                                    <Settings className="size-5" />
                                </Link>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        {notifications.length > 0 && (
                            <div className="flex items-center justify-between px-5 py-2.5 bg-muted/50 border-b border-border">
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
                                    <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-4">
                                        <BellOff className="size-9 text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-base font-bold text-foreground mb-2">Tudo limpo por aqui</h3>
                                    <p className="text-sm text-muted-foreground max-w-[200px]">
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
