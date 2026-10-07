import React, { useState } from "react";
import { Link, useLocation, Navigate } from "@tanstack/react-router";
import {
  Menu,
  X,
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  Folder,
  Settings,
  LogOut,
  PencilRuler,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Activity,
  ClipboardCheck,
} from "lucide-react";
import { ModeToggle } from "../ui/ModeToggle";
import { NotificationBell } from "./NotificationBell";
import { GlobalSearch } from "./GlobalSearch";
import { useAuth } from "../../context/AuthContext";

export interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projetos", icon: Building2 },
  { to: "/inspections", label: "Vistorias", icon: ClipboardCheck },
  { to: "/activities", label: "Atividades", icon: Activity },
  { to: "/schedule", label: "Cronograma", icon: Calendar },
  { to: "/clients", label: "Clientes", icon: Users },
  { to: "/documents", label: "Documentos", icon: Folder },
  { to: "/reports", label: "Relatórios", icon: BarChart3 },
  { to: "/settings", label: "Configurações", icon: Settings },
];

export function AppLayout({ children }: { children?: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const currentPath = location.pathname;

  if (currentPath === "/login") {
    return <>{children}</>;
  }

  // Enquanto valida localStorage do AuthContext
  if (isLoading) {
    return null;
  }

  // Redireciona para login suavemente se não autenticado (evita loop e chamadas sem token)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = (path: string) => {
    const item = navItems.find((i) => i.to === path || (i.to !== "/dashboard" && path.startsWith(i.to)));
    if (item) return item.label;
    if (path.includes("/projects/")) return "Detalhes do Projeto";
    return "ArchFlow ERP";
  };

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* ─── SIDEBAR DESKTOP ─── */}
      <aside
        className={`hidden lg:flex flex-col border-r border-border bg-card/90 backdrop-blur-md shrink-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        <div className={`flex h-full flex-col py-4 ${isCollapsed ? "px-2" : "px-3"}`}>
          {/* Logo & Toggle */}
          <div className="flex items-center justify-between px-2 py-2 mb-3">
            <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center w-full" : ""}`}>
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0">
                <PencilRuler className="size-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base leading-none text-foreground tracking-tight">
                    ArchFlow
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mt-1">
                    ERP Arquitetura
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(true)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title="Recolher menu"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="flex justify-center mb-3">
              <button
                onClick={() => setIsCollapsed(false)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                title="Expandir menu"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 overflow-y-auto pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === "/dashboard"
                  ? currentPath === "/dashboard" || currentPath === "/"
                  : currentPath.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all ${
                    isCollapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
                  } ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="size-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Mini Footer */}
          <div className="border-t border-border pt-3 mt-2">
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3 px-2"} py-2`}>
              <div className="size-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : "AF"}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {user?.name || "Usuário"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate">
                    {user?.email || "usuario@archflow.com"}
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <button
                  onClick={logout}
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                  title="Sair do sistema"
                >
                  <LogOut className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ─── SIDEBAR MOBILE (DRAWER) ─── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer Content */}
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border p-4 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border mb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                  <PencilRuler className="size-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-foreground leading-none">ArchFlow</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">ERP Arquitetura</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto py-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.to === "/dashboard"
                    ? currentPath === "/dashboard" || currentPath === "/"
                    : currentPath.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-border pt-3 mt-auto">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="size-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "AF"}
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-foreground truncate">{user?.name || "Usuário"}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.email || "usuario@archflow.com"}</span>
                </div>
                <button
                  onClick={logout}
                  className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
                  title="Sair do sistema"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER RESPONSIVO */}
        <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-foreground truncate">
              {getPageTitle(currentPath)}
            </h1>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Global Search Bar (Desktop) */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Mode & Palette Toggle */}
            <ModeToggle />
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto bg-background/50 p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
