'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    User, 
    Mail, 
    Lock, 
    Building2, 
    MapPin, 
    ArrowLeft, 
    Sparkles, 
    CheckCircle2, 
    Eye, 
    EyeOff,
    Loader2
} from 'lucide-react';
import { signUp } from '@/app/actions/auth';

const Register = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    // Form states
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [address, setAddress] = useState('');

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signUp({ 
                name: fullName, 
                email, 
                password, 
                companyName, 
                address 
            });
            router.push('/login?registered=true');
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Falha ao registrar conta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center p-4 sm:p-8 overflow-x-hidden transition-colors duration-500">
            <div className="w-full max-w-[1100px] grid lg:grid-cols-2 bg-white dark:bg-surface-dark rounded-[40px] shadow-2xl overflow-hidden border border-gray-100 dark:border-border-dark animate-in fade-in zoom-in-95 duration-500">
                
                {/* Left Side: Branding & Info */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-surface-dark relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay scale-110"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-background-dark/80"></div>
                    
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center gap-3 text-white mb-16 group">
                            <div className="w-12 h-12 bg-primary/20 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/30 transition-all duration-300">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">ArchFlow</span>
                        </Link>

                        <div className="space-y-8">
                            <h2 className="text-5xl font-bold text-white leading-tight">
                                Comece sua jornada <br />
                                <span className="text-primary italic">profissional.</span>
                            </h2>
                            <p className="text-gray-400 text-xl font-light leading-relaxed max-w-sm">
                                Junte-se a arquitetos de elite e leve seu escritório ao próximo nível.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-5 text-white/90">
                                <div className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-base font-medium">Gestão inteligente de fluxos</span>
                            </div>
                            <div className="flex items-center gap-5 text-white/90">
                                <div className="w-12 h-12 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center border border-primary/20">
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                </div>
                                <span className="text-base font-medium">Controle financeiro avançado</span>
                            </div>
                        </div>
                        <div className="mt-12 pt-8 border-t border-white/5 text-gray-500 text-sm font-medium">
                            © 2024 ArchFlow ERP. Made for Architects.
                        </div>
                    </div>

                    {/* Architectural Accent Line */}
                    <div className="absolute bottom-0 right-0 w-1/2 h-2 bg-primary/40 rounded-tl-full"></div>
                </div>

                {/* Right Side: Step Form */}
                <div className="p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white dark:bg-background-dark/30">
                    <div className="max-w-md w-full mx-auto space-y-10">
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex gap-3">
                                    <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
                                    <div className={`h-2 w-12 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-gray-100 dark:bg-gray-800'}`}></div>
                                </div>
                                <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">ETAPA {step} DE 2</span>
                            </div>
                            
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Criar sua conta</h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg font-medium">
                                {step === 1 ? 'Primeiro, quem está no comando?' : 'Agora, onde a mágica acontece?'}
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4" role="alert">
                                <Sparkles className="w-5 h-5 flex-shrink-0" />
                                <span className="text-sm font-bold">{error}</span>
                            </div>
                        )}

                        <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-6">
                            {step === 1 ? (
                                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Nome Completo</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                                                <User className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full h-16 pl-14 pr-4 bg-gray-50 dark:bg-surface-dark/50 border border-gray-100 dark:border-border-dark rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all duration-300 font-medium"
                                                placeholder="Seu nome"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">E-mail Profissional</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full h-16 pl-14 pr-4 bg-gray-50 dark:bg-surface-dark/50 border border-gray-100 dark:border-border-dark rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all duration-300 font-medium"
                                                placeholder="contato@escritorio.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Senha Estratégica</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full h-16 pl-14 pr-14 bg-gray-50 dark:bg-surface-dark/50 border border-gray-100 dark:border-border-dark rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all duration-300 font-medium"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button 
                                                type="button" 
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-all p-1"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Nome do Escritório</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                                                <Building2 className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                className="w-full h-16 pl-14 pr-4 bg-gray-50 dark:bg-surface-dark/50 border border-gray-100 dark:border-border-dark rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all duration-300 font-medium"
                                                placeholder="Ex: Studio Urbano"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Localização</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-all duration-300">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="w-full h-16 pl-14 pr-4 bg-gray-50 dark:bg-surface-dark/50 border border-gray-100 dark:border-border-dark rounded-[20px] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-base placeholder:text-gray-400 dark:text-white transition-all duration-300 font-medium"
                                                placeholder="Cidade - UF"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="pt-6 flex flex-col gap-5">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-16 bg-primary text-background-dark font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group active:scale-[0.98] disabled:opacity-70"
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin text-background-dark" />
                                    ) : (
                                        <>
                                            {step === 1 ? 'Prosseguir' : 'Finalizar e Criar'}
                                            <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                                        </>
                                    )}
                                </button>

                                {step === 2 && (
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="h-14 w-full text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft className="w-4 h-4" /> Voltar ao início
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="pt-4 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-bold">
                                Já possui acesso?{' '}
                                <Link href="/login" className="text-primary hover:text-green-500 transition-colors underline-offset-4 hover:underline ml-1">Fazer login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
