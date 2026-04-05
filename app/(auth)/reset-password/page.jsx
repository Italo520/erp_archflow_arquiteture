'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, Sparkles, Building2, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { resetPassword } from '@/app/actions/auth';

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            setError('Link de recuperação inválido ou ausente.');
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }

        setLoading(true);

        try {
            const res = await resetPassword({ password, token });
            if (res.error) {
                setError(res.error);
            } else {
                setMessage(res.message);
                setSuccess(true);
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            }
        } catch (err) {
            setError('Ocorreu um erro inesperado.');
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
                            <ShieldCheck className="text-background-dark w-10 h-10" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                            Defina sua nova senha.
                        </h2>
                        <p className="text-gray-300 text-lg font-light leading-relaxed">
                            A segurança é fundamental na arquitetura. Escolha uma senha forte para proteger seu trabalho e seus projetos.
                        </p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-background-light dark:bg-background-dark">
                    <div className="lg:hidden w-14 h-14 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(54,226,123,0.3)]">
                        <Building2 className="text-background-dark w-7 h-7" />
                    </div>

                    <div className="w-full max-w-[420px] flex flex-col gap-10">
                        <div className="text-left">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Redefinir Senha</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Insira sua nova senha abaixo.</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2" role="alert">
                                <Sparkles className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        {message && (
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2" role="alert">
                                <Sparkles className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold">{message} {success && 'Redirecionando...'}</span>
                            </div>
                        )}

                        {!success && (
                            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-2.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1" htmlFor="password">Nova Senha</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full h-14 pl-12 pr-12 bg-white/50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                            minLength={8}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all p-1"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2.5">
                                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1" htmlFor="confirmPassword">Confirmar Nova Senha</label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full h-14 pl-12 pr-4 bg-white/50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all font-medium"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !token}
                                    className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary h-14 px-6 text-background-dark text-lg font-bold tracking-wide hover:opacity-90 hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Atualizar Senha'}
                                </button>
                            </form>
                        )}

                        <div className="text-center">
                            <Link
                                href="/login"
                                className="text-sm font-bold text-primary hover:text-green-500 transition-colors flex items-center justify-center gap-2 group"
                            >
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                Voltar para o login
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
}

const ResetPassword = () => {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-primary">
                <Loader2 className="w-12 h-12 animate-spin" />
            </div>
        }>
            <ResetPasswordContent />
        </Suspense>
    );
};

export default ResetPassword;
