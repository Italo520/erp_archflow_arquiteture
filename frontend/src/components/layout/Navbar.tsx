import React from 'react';
import { Search, Bell, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onQuickNewClient?: () => void;
  onQuickNewProject?: () => void;
}

export const Navbar: React.FC<NavbarProps> = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-surface/70 backdrop-blur-md border-b border-border px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="relative w-80">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar projetos, clientes, prazos..."
          className="w-full bg-surface-elevated/70 text-sm text-gray-100 placeholder-gray-400 pl-10 pr-4 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage transition-all"
        />
      </div>

      {/* Right Controls & Status */}
      <div className="flex items-center gap-4">
        {/* Backend Status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated/80 border border-border text-xs text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-medium text-emerald-400">Spring Boot 3.4 Online</span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-arch-sage/10 border border-arch-sage/30 text-xs text-arch-sage font-medium">
          <ShieldCheck size={14} />
          <span>{user?.role?.replace('ROLE_', '') || 'ADMIN'}</span>
        </div>
      </div>
    </header>
  );
};
