'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ModeToggle } from './ModeToggle';
import { signOut, useSession } from 'next-auth/react';
import NotificationBell from '@/components/NotificationBell';
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
    Search,
    PencilRuler
} from 'lucide-react';

const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
};

const Layout = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const currentPath = pathname;

    const menuItems = [
        { path: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
        { path: '/projects',   label: 'Projetos',       icon: Building2 },
        { path: '/schedule',   label: 'Cronograma',     icon: Calendar },
        { path: '/clients',    label: 'Clientes',       icon: Users },
        { path: '/documents',  label: 'Documentos',     icon: Folder },
        { path: '/settings',   label: 'Configurações',  icon: Settings },
    ];

    const getPageTitle = (path) => {
        const item = menuItems.find(i => i.path === path);
        if (item) return item.label;
        if (path.includes('/projects/')) return 'Detalhes do Projeto';
        return 'ArchFlow';
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">

            {/* ── Sidebar Desktop ── */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-card/80 backdrop-blur-sm min-w-0 shrink-0 z-40 relative">
                <div className="flex h-full flex-col px-3 py-5">

                    {/* Logo */}
                    <div className="flex gap-3 items-center px-3 py-3 mb-4">
                        <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-primary shrink-0">
                            <PencilRuler className="size-4 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1
                                className="text-foreground text-[15px] font-bold leading-none font-display tracking-tight truncate notranslate"
                                translate="no"
                            >
                                ArchFlow
                            </h1>
                            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.12em] font-medium mt-0.5 truncate">
                                ERP Arquitetura
                            </p>
                        </div>
                    </div>

                    {/* Divisor */}
                    <div className="h-px bg-border mx-3 mb-4" />

                    {/* Nav */}
                    <nav className="flex flex-col gap-0.5 flex-1">
                        {menuItems.map((item) => {
                            const active = currentPath === item.path;
                            return (
                                <button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className={[
                                        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-left w-full group',
                                        'transition-all duration-150',
                                        active
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                                    ].join(' ')}
                                >
                                    {/* Indicador lateral ativo */}
                                    {active && (
                                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                                    )}
                                    <item.icon className={[
                                        'size-4 shrink-0 transition-colors',
                                        active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
                                    ].join(' ')} />
                                    <span className="text-sm">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Footer sidebar */}
                    <div className="mt-auto pt-4 space-y-1">
                        <div className="h-px bg-border mb-3" />

                        {/* User info */}
                        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg hover:bg-secondary/60 transition-colors cursor-pointer group">
                            {session?.user?.image ? (
                                <div
                                    className="size-8 rounded-full border border-border bg-center bg-cover shrink-0"
                                    style={{ backgroundImage: `url("${session.user.image}")` }}
                                />
                            ) : (
                                <div className="size-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-semibold text-primary">
                                        {getInitials(session?.user?.name || 'U')}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate leading-none">
                                    {session?.user?.name || 'Usuário'}
                                </p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                    {session?.user?.email || ''}
                                </p>
                            </div>
                            <ModeToggle />
                        </div>

                        {/* Sair */}
                        <button
                            onClick={() => signOut({ callbackUrl: '/login' })}
                            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/8 transition-all group"
                        >
                            <LogOut className="size-4 shrink-0 group-hover:text-destructive transition-colors" />
                            <span className="text-sm font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Mobile Drawer ── */}
            <div className={`lg:hidden fixed inset-0 z-[60] ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
                {/* Overlay */}
                <div
                    className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsMenuOpen(false)}
                />

                {/* Drawer */}
                <aside className={`absolute left-0 top-0 h-full w-72 bg-card border-r border-border shadow-card transition-transform duration-300 ease-smooth ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex h-full flex-col px-3 py-5">

                        {/* Header */}
                        <div className="flex justify-between items-center px-2 mb-6">
                            <div className="flex gap-3 items-center">
                                <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-primary">
                                    <PencilRuler className="size-4 text-primary-foreground" />
                                </div>
                                <h2 className="text-[15px] font-bold font-display tracking-tight text-foreground notranslate" translate="no">
                                    ArchFlow
                                </h2>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Fechar menu"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="h-px bg-border mb-4" />

                        {/* Nav mobile */}
                        <nav className="flex flex-col gap-0.5 flex-1 overflow-y-auto">
                            {menuItems.map((item) => {
                                const active = currentPath === item.path;
                                return (
                                    <button
                                        key={item.path}
                                        onClick={() => { router.push(item.path); setIsMenuOpen(false); }}
                                        className={[
                                            'relative flex items-center gap-3 px-3 py-3 rounded-lg text-left w-full',
                                            'transition-all duration-150',
                                            active
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60',
                                        ].join(' ')}
                                    >
                                        {active && (
                                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                                        )}
                                        <item.icon className={`size-4 shrink-0 ${active ? 'text-primary' : ''}`} />
                                        <span className="text-sm">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Footer mobile */}
                        <div className="mt-auto pt-4 space-y-1">
                            <div className="h-px bg-border mb-3" />
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-secondary/40">
                                <span className="text-sm font-medium text-foreground">Aparência</span>
                                <ModeToggle />
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="flex w-full items-center gap-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/8 transition-all font-medium"
                            >
                                <LogOut className="size-4 shrink-0" />
                                <span className="text-sm">Sair da conta</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── Main Content ── */}
            <main className="flex flex-1 flex-col h-full relative min-w-0">

                {/* Header / Top Bar */}
                <header className="flex items-center justify-between border-b border-border px-4 md:px-5 h-14 bg-card/60 backdrop-blur-sm z-20 shrink-0 sticky top-0">

                    {/* Left */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-1.5 -ml-1 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            aria-label="Abrir Menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <h2 className="text-base font-semibold tracking-tight text-foreground truncate max-w-[160px] sm:max-w-none font-display">
                            {getPageTitle(pathname)}
                        </h2>
                    </div>

                    {/* Center: Search */}
                    <div className="hidden lg:flex flex-1 max-w-sm mx-6">
                        <div className="relative w-full group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Pesquisar projetos, clientes..."
                                className="w-full bg-secondary/50 border border-transparent rounded-lg py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:bg-background focus:border-primary/30 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-1.5 ml-auto">
                        <NotificationBell />
                        <button
                            className="flex items-center justify-center rounded-lg size-9 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Configurações"
                        >
                            <Settings className="size-4" />
                        </button>
                        <div className="w-px h-5 bg-border mx-1" />

                        {/* Avatar */}
                        <div className="flex items-center gap-2.5 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-foreground leading-none">
                                    {session?.user?.name?.split(' ')[0] || 'Usuário'}
                                </p>
                            </div>
                            {session?.user?.image ? (
                                <div
                                    className="size-8 rounded-full border border-border bg-center bg-cover ring-2 ring-transparent group-hover:ring-primary/30 transition-all"
                                    style={{ backgroundImage: `url("${session.user.image}")` }}
                                />
                            ) : (
                                <div className="size-8 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                                    <span className="text-xs font-semibold text-primary">
                                        {getInitials(session?.user?.name || 'U')}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden bg-background">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
