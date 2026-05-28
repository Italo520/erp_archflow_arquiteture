'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, PencilRuler } from 'lucide-react';

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.includes('@')) {
            setError('Por favor, insira um e-mail válido.');
            return;
        }
        if (password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }

        setLoading(true);
        try {
            const res = await signIn('credentials', {
                email: email.toLowerCase().trim(),
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Credenciais inválidas. Verifique seu e-mail e senha.');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Ocorreu um erro. Tente novamente.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-background text-foreground overflow-hidden">

            {/* ── Painel esquerdo (decorativo) ── */}
            <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-[#0F0D0B] items-end">
                {/* Gradiente de fundo */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#1a1208] via-[#0F0D0B] to-[#0F0D0B]" />

                {/* Padrão geométrico sutil */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `repeating-linear-gradient(
                            0deg, transparent, transparent 59px,
                            hsl(34 46% 60%) 59px, hsl(34 46% 60%) 60px
                        ), repeating-linear-gradient(
                            90deg, transparent, transparent 59px,
                            hsl(34 46% 60%) 59px, hsl(34 46% 60%) 60px
                        )`,
                    }}
                />

                {/* Orb glow */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/10 blur-[80px]" />

                {/* Content */}
                <div className="relative z-10 p-12 pb-14">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-primary">
                            <PencilRuler className="size-5 text-primary-foreground" />
                        </div>
                        <span className="text-white/90 font-display font-bold text-lg tracking-tight">
                            ArchFlow
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-4xl xl:text-5xl font-bold tracking-tight text-white leading-[1.15] mb-4 font-display">
                        Construindo o futuro,<br />
                        <span className="text-primary">projeto por projeto.</span>
                    </h2>
                    <p className="text-white/50 text-base leading-relaxed max-w-sm">
                        Gerencie seus projetos de arquitetura com precisão, controle financeiro e elegância.
                    </p>

                    {/* Linha decorativa dourada */}
                    <div className="mt-10 flex gap-2 items-center">
                        <div className="h-px w-12 bg-primary/60 rounded-full" />
                        <div className="h-px w-6 bg-primary/30 rounded-full" />
                        <div className="h-px w-3 bg-primary/15 rounded-full" />
                    </div>

                    {/* Feature pills */}
                    <div className="mt-8 flex flex-wrap gap-2">
                        {['Gestão de Projetos', 'Controle Financeiro', 'CRM de Clientes', 'Relatórios'].map((tag) => (
                            <span
                                key={tag}
                                className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-white/40 bg-white/5"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Painel direito (formulário) ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 relative">
                {/* Logo mobile */}
                <div className="lg:hidden flex items-center gap-2.5 mb-10">
                    <div className="size-9 rounded-xl bg-primary flex items-center justify-center shadow-primary">
                        <PencilRuler className="size-4 text-primary-foreground" />
                    </div>
                    <span className="font-display font-bold text-lg text-foreground tracking-tight">
                        ArchFlow
                    </span>
                </div>

                {/* Card do formulário */}
                <div className="w-full max-w-[380px] animate-slide-up">

                    {/* Headline */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-muted-foreground text-sm mt-1.5">
                            Entre com suas credenciais para acessar o painel.
                        </p>
                    </div>

                    {/* Erro */}
                    {error && (
                        <div className="flex items-start gap-2.5 bg-destructive/8 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 animate-slide-up" role="alert">
                            <AlertCircle className="size-4 shrink-0 mt-0.5" />
                            <span className="text-sm leading-snug">{error}</span>
                        </div>
                    )}

                    {/* Formulário */}
                    <form className="space-y-4" onSubmit={handleLogin}>

                        {/* E-mail */}
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-foreground" htmlFor="email">
                                E-mail
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full h-11 pl-10 pr-4 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 focus:bg-background transition-all duration-200"
                                    placeholder="arq@studio.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Senha */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-foreground" htmlFor="password">
                                    Senha
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-11 pl-10 pr-11 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary/40 focus:bg-background transition-all duration-200"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-0.5"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                >
                                    {showPassword
                                        ? <EyeOff className="size-4" />
                                        : <Eye className="size-4" />
                                    }
                                </button>
                            </div>
                        </div>

                        {/* CTA */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={[
                                "w-full h-11 mt-2 rounded-xl font-semibold text-sm",
                                "bg-primary text-primary-foreground",
                                "shadow-primary transition-all duration-200",
                                "hover:opacity-90 hover:-translate-y-px hover:shadow-primary",
                                "active:scale-[0.98] active:translate-y-0",
                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0",
                                "flex items-center justify-center gap-2",
                            ].join(" ")}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                    </svg>
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Divisor */}
                    <div className="relative flex items-center my-6">
                        <div className="flex-grow h-px bg-border" />
                        <span className="px-3 text-xs text-muted-foreground uppercase tracking-widest">ou</span>
                        <div className="flex-grow h-px bg-border" />
                    </div>

                    {/* Link criar conta */}
                    <Link
                        href="/register"
                        className={[
                            "flex w-full h-11 items-center justify-center rounded-xl",
                            "border border-border text-sm font-medium text-foreground",
                            "hover:bg-secondary/60 hover:border-border/80 transition-all duration-150",
                        ].join(" ")}
                    >
                        Criar nova conta
                    </Link>
                </div>

                {/* Footer */}
                <p className="absolute bottom-6 text-xs text-muted-foreground/60">
                    © {new Date().getFullYear()} ArchFlow ERP · Todos os direitos reservados
                </p>
            </div>
        </div>
    );
};

export default Login;
