'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Sparkles, Building2, Loader2, KeyRound } from 'lucide-react';
import { requestPasswordReset } from '@/app/actions/auth';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await requestPasswordReset({ email });
            if (res.error) {
                setError(res.error);
            } else {
                setMessage(res.message);
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
                            <KeyRound className="text-background-dark w-8 h-8" />
                        </div>
                        <h2 className="text-5xl font-bold tracking-tight text-white mb-4 leading-tight">
                            Recuperação de Acesso.
                        </h2>
                        <p className="text-gray-300 text-lg font-light leading-relaxed">
                            Não se preocupe, acontece com os melhores. Insira seu e-mail e enviaremos um link para você voltar ao trabalho.
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
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-2">Esqueceu a senha?</h1>
                            <p className="text-gray-500 dark:text-gray-400 text-lg">Enviaremos um link de recuperação para o seu e-mail.</p>
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
                                <span className="text-sm font-bold">{message}</span>
                            </div>
                        )}

                        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                            <div className="flex flex-col gap-2.5">
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 ml-1" htmlFor="email">E-mail</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors duration-200">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 bg-white/50 dark:bg-surface-dark border border-gray-200 dark:border-border-dark rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all font-medium"
                                        placeholder="ex: arq@studio.com"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-primary h-14 px-6 text-background-dark text-lg font-bold tracking-wide hover:opacity-90 hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Enviar Link de Recuperação'}
                            </button>
                        </form>

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
};

export default ForgotPassword;
