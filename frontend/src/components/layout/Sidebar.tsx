import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  ClipboardCheck,
  Clock,
  LogOut,
  Compass,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type ActiveTab = 'dashboard' | 'clients' | 'projects' | 'inspections' | 'timetracking';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'clients', label: 'Gestão de Clientes', icon: <Users size={20} /> },
    { id: 'projects', label: 'Projetos & Kanban', icon: <FolderKanban size={20} /> },
    { id: 'inspections', label: 'Vistorias & Obra', icon: <ClipboardCheck size={20} /> },
    { id: 'timetracking', label: 'Horas & Atividades', icon: <Clock size={20} /> },
  ];

  return (
    <aside className="w-64 bg-surface-dark border-r border-border flex flex-col justify-between h-screen sticky top-0 transition-all select-none">
      <div>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-border/40 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-arch-sage to-arch-slate flex items-center justify-center text-background font-bold shadow-lg shadow-arch-sage/10">
            <Compass size={22} className="text-surface-dark" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-wide">ArchFlow</h1>
            <p className="text-xs text-arch-muted font-medium">Enterprise ERP</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-arch-muted/60">
            Módulos Corporativos
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-surface-elevated text-arch-sage border border-arch-sage/30 shadow-sm'
                    : 'text-gray-300 hover:bg-surface/50 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`${isActive ? 'text-arch-sage' : 'text-gray-400 group-hover:text-arch-sage'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-arch-sage/20 text-arch-sage font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-border/40 space-y-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-9 h-9 rounded-full bg-surface-elevated border border-border flex items-center justify-center font-bold text-arch-sage">
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Arquiteto Líder'}</p>
            <p className="text-xs text-arch-muted truncate">{user?.email || 'admin@archflow.com'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span>Encerrar Sessão</span>
        </button>
      </div>
    </aside>
  );
};
