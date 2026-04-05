'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ModeToggle } from './ModeToggle';
import { signOut, useSession } from 'next-auth/react';
import NotificationBell from '@/components/NotificationBell';
import { Menu, X, Architecture } from 'lucide-react';

const Layout = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const currentPath = pathname;

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
        { path: '/projects', label: 'Projetos', icon: 'apartment' },
        { path: '/schedule', label: 'Cronograma', icon: 'calendar_month' },
        { path: '/clients', label: 'Clientes', icon: 'group' },
        { path: '/documents', label: 'Documentos', icon: 'folder' },
        { path: '/settings', label: 'Configurações', icon: 'settings' },
    ];

    const getPageTitle = (path) => {
        const item = menuItems.find(i => i.path === path);
        if (item) return item.label;
        if (path.includes('/projects/')) return 'Detalhes do Projeto';
        return 'ArchFlow';
    };

    return (
        <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card min-w-0 shrink-0 z-40 relative">
                <div className="flex h-full flex-col p-4">
                    <div className="flex gap-3 items-center px-2 py-4 mb-6">
                        <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 bg-primary flex items-center justify-center text-primary-foreground">
                            <span className="material-symbols-outlined text-2xl notranslate" translate="no">architecture</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-foreground text-lg font-bold leading-normal font-display tracking-tight truncate notranslate" translate="no">ArchManager</h1>
                            <p className="text-muted-foreground text-[10px] uppercase tracking-[0.15em] font-medium opacity-80 truncate">ERP Arquitetura</p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2 flex-1">
                        {menuItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => router.push(item.path)}
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors group w-full text-left ${currentPath === item.path
                                    ? 'bg-secondary border border-border text-foreground'
                                    : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${currentPath === item.path ? 'text-primary filled' : 'group-hover:text-primary'}`}>
                                    {item.icon}
                                </span>
                                <p className={`font-medium text-sm leading-normal`}>
                                    {item.label}
                                </p>
                            </button>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-border mt-auto flex flex-col gap-4">
                        <div className="flex justify-center">
                            <ModeToggle />
                        </div>
                        <button
                            onClick={() => {
                                signOut({ callbackUrl: '/login' });
                            }}
                            className="flex w-full items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive group"
                        >
                            <span className="material-symbols-outlined">logout</span>
                            <span className="text-sm font-medium">Sair</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <div className={`lg:hidden fixed inset-0 z-[60] transform transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsMenuOpen(false)}
                />
                
                {/* Sidebar Drawer */}
                <aside className={`absolute left-0 top-0 h-full w-4/5 max-w-sm bg-card border-r border-border transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex h-full flex-col p-6">
                        <div className="flex justify-between items-center mb-10">
                            <div className="flex gap-3 items-center">
                                <div className="bg-primary rounded-xl size-10 flex items-center justify-center text-primary-foreground">
                                    <span className="material-symbols-outlined notranslate" translate="no">architecture</span>
                                </div>
                                <h2 className="text-xl font-bold font-display tracking-tight text-foreground notranslate" translate="no">ArchFlow</h2>
                            </div>
                            <button
                                onClick={() => setIsMenuOpen(false)}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <nav className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {menuItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        router.push(item.path);
                                        setIsMenuOpen(false);
                                    }}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all ${currentPath === item.path
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]'
                                        : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <span className="material-symbols-outlined notranslate" translate="no">{item.icon}</span>
                                    <span className="font-medium text-sm truncate">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="pt-6 border-t border-border mt-auto flex flex-col gap-4">
                            <div className="flex items-center justify-between p-2 rounded-xl bg-secondary/50">
                                <span className="text-sm font-medium px-2">Aparência</span>
                                <ModeToggle />
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: '/login' })}
                                className="flex w-full items-center gap-4 px-4 py-4 rounded-xl hover:bg-destructive/10 text-destructive font-semibold transition-all"
                            >
                                <span className="material-symbols-outlined notranslate" translate="no">logout</span>
                                <span>Sair da conta</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Main Content */}
            <main className="flex flex-1 flex-col h-full relative min-w-0">
                {/* Mobile Header / Top Bar */}
                <header className="flex items-center justify-between border-b border-border px-4 md:px-6 py-4 bg-background z-20 shrink-0 sticky top-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="lg:hidden p-2 -ml-2 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
                            aria-label="Abrir Menu"
                        >
                            <Menu className="h-6 w-6 text-foreground" />
                        </button>
                        <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground truncate max-w-[150px] sm:max-w-none font-display">
                            {getPageTitle(pathname)}
                        </h1>
                    </div>

                    <div className="hidden lg:flex flex-1 max-w-md mx-4">
                        <div className="relative w-full group">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors notranslate" translate="no">search</span>
                            <input
                                type="text"
                                placeholder="Pesquisar projetos, clientes, faturas..."
                                className="w-full bg-secondary/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <div className="flex gap-2">
                            <NotificationBell />
                            <button className="flex items-center justify-center rounded-full size-10 hover:bg-secondary text-foreground transition-colors">
                                <span className="material-symbols-outlined notranslate" translate="no">settings</span>
                            </button>
                        </div>
                        <div className="h-8 w-px bg-border mx-2"></div>
                    <div className="flex items-center gap-3 cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-foreground text-sm font-bold">{session?.user?.name || 'Usuário'}</p>
                            <p className="text-muted-foreground text-xs">{session?.user?.email || 'Admin'}</p>
                        </div>
                        <div
                            className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-border"
                                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDcQ26BLXXZiGcztd8nNmej4VGpUM-rSNITPSDiOkQjoR2N6qlWWAoY31IBhOAcdvMuh8O7xDChNxdLLiGWlZitRYOJIwJj_cOyx1XPjKDAsKIb-rVn4LdoEQ2iITFVdy7yI6lRuJHup8-0rjh7rmyr6YEmD_b3o3p3EJ8EbKKj8DIiSpMvTZMUgwJe6fYnUg2NzlTI_rWZiDzcc7hyJSkXNa5GRMqRl6kbY6OQ1IRGQc0uK7bCZ1MDASrziIJ9RS7gwW3tqNAIalo")' }}
                            ></div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto overflow-x-auto bg-background">
                    <div className="mx-auto w-full max-w-7xl px-4 md:px-8 py-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Layout;
