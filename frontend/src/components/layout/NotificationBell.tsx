import React, { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Check } from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "Nova Vistoria Agendada",
      message: "Residencial Alphaville Villa 4 foi agendada para amanhã às 14:00.",
      type: "info",
      read: false,
      createdAt: new Date().toISOString(),
      actionUrl: "/inspections",
    },
    {
      id: "2",
      title: "Entregável Aprovado",
      message: "Planta Baixa Executiva v2 aprovada pelo cliente Roberto Silva.",
      type: "success",
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      actionUrl: "/projects",
    },
    {
      id: "3",
      title: "Prazo Próximo",
      message: "Fase de Modelagem 3D do Edifício Horizonte vence em 2 dias.",
      type: "warning",
      read: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      actionUrl: "/projects",
    },
  ]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />;
      case "warning":
        return <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />;
      case "error":
        return <XCircle className="size-4 text-rose-500 shrink-0 mt-0.5" />;
      default:
        return <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center justify-center rounded-lg size-8 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        aria-label="Notificações"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground animate-scale-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-xl z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">Notificações</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                  {unreadCount} novas
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <Check className="size-3" />
                Marcar lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Nenhuma notificação no momento.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex gap-3 p-3 text-left transition-colors cursor-pointer hover:bg-secondary/60 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  {getIcon(n.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
