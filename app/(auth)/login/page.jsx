'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Lock, User, Sparkles, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        setLoading(true);

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError('Falha no login. Verifique suas credenciais.');
            } else {
                router.push('/dashboard');
            }
        } catch (err) {
            setError('Um erro inesperado ocorreu.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex w-full text-foreground overflow-hidden">
            <div className="flex w-full min-h-screen">
                {/* Left Side: Architectural Imagery */}
                <div className="hidden lg:flex lg:w-1/2 relative bg-surface-dark items-center justify-center overflow-hidden">
                    <div
                        className="absolute inset-0 w-full h-full bg-cover bg-center opacity-40 mix-blend-overlay"
                        style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAbWRImGuVFWfE-laP-pg7bh_uasnPLtM7YSJvIZ6sMUrEGqZqmG4EnWgKQ8ziTF6dbd_wyfuz9thbGbb0pWOG0JjbM3hgosiucxS9x5iz2WpKZNQx1dt7duiJVwajTivMlaYZKzWBcngoEIMzfeen-zsnpQdrno9mMWQygO079tQujyEvIsqkUsg1VZuKdsB_BZwLI4NoWsSN8tzd3ZSUVCXQRy-R0adxiRybbpoLXI3FMZHwewE_yTnvqpm134ifiiNrnFvKD9tM")' }}
                    ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background-dark/95 via-background-dark/40 to-transparent"></div>

                    <div className="relative z-10 max-w-lg px-12 text-center lg:text-left">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-[0_0_30px_rgba(56,224,123,0.2)]">
                            <Building2 className="text-background-dark w-8 h-8" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                            Construindo o futuro,<br />projeto por projeto.
                        </h2>
                        <p className="text-gray-300 text-lg font-light leading-relaxed">
                            Gerencie seus projetos de arquitetura com precisão, controle financeiro e estilo inigualável.
                        </p>
                    </div>

                    {/* Architectural Accent */}
                    <div className="absolute bottom-12 left-12 w-32 h-1 bg-primary/30 rounded-full"></div>
                </div>

                {/* Right Side: Login Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-background-light dark:bg-background-dark">
                    <div className="lg:hidden w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(54,226,123,0.3)]">
                        <Building2 className="text-background-dark w-7 h-7" />
                    </div>

                    <div className="w-full max-w-[420px] flex flex-col gap-10">
                        <div className="text-left">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Acesse sua conta</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Bem-vindo de volta ao seu painel.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-4 rounded-xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-2" role="alert">
                                <Sparkles className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-medium">{error}</span>
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={handleLogin}>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1" htmlFor="email">E-mail ou Usuário</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-white/50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all"
                                        placeholder="ex: arq@studio.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200" htmlFor="password">Senha</label>
                                    <Link href="/forgot-password" title="Recuperar senha" className="text-sm font-bold text-primary hover:text-green-500 transition-colors">Esqueceu a senha?</Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 bg-white/50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer p-1"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary h-14 px-6 text-background-dark text-lg font-bold tracking-wide hover:opacity-90 hover:shadow-xl hover:shadow-primary/20 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Carregando...' : 'Entrar'}
                            </button>
                        </form>

                        <div className="relative flex py-2 items-center">
                            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                            <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-medium uppercase tracking-widest">OU</span>
                            <div className="flex-grow border-t border-gray-100 dark:border-gray-800"></div>
                        </div>

                        <div className="text-center">
                            <Link
                                href="/register"
                                className="w-full h-14 rounded-2xl border-2 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                            >
                                Criar nova conta
                            </Link>
                        </div>
                    </div>

                    <div className="absolute bottom-8 text-sm text-gray-400 dark:text-gray-600 font-medium">
                        © 2024 Architecture ERP System
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
