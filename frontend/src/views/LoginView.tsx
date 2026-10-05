import React, { useState } from 'react';
import { Compass, Lock, Mail, User as UserIcon, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@archflow.com');
  const [password, setPassword] = useState('Admin@123456');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register({ name, email, password, role: 'ROLE_ADMIN' });
      } else {
        await login({ email, password });
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.title || 'Credenciais inválidas. Verifique os dados.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 relative overflow-hidden bg-arch-grid">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-arch-sage/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-arch-sage to-arch-slate items-center justify-center text-surface-dark shadow-xl mb-4">
            <Compass size={32} />
          </div>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">ArchFlow ERP</h1>
          <p className="text-sm text-arch-muted mt-1.5">
            Plataforma Corporativa de Alta Performance Arquitetônica
          </p>
        </div>

        {/* Card Form */}
        <div className="glass-panel p-8 rounded-2xl shadow-elevated border border-border">
          <div className="flex border-b border-border mb-6">
            <button
              onClick={() => { setIsRegister(false); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                !isRegister ? 'text-arch-sage border-b-2 border-arch-sage' : 'text-gray-400 hover:text-white'
              }`}
            >
              Acesso ao Sistema
            </button>
            <button
              onClick={() => { setIsRegister(true); setError(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors ${
                isRegister ? 'text-arch-sage border-b-2 border-arch-sage' : 'text-gray-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1.5">
                  Nome Completo
                </label>
                <div className="relative">
                  <UserIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Arquiteto Responsável"
                    className="w-full bg-surface-elevated text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@archflow.com"
                  className="w-full bg-surface-elevated text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1.5">
                Senha de Acesso
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-elevated text-sm text-white pl-10 pr-4 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-arch-sage to-arch-warm hover:brightness-105 text-surface-dark font-display font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
            >
              <span>{isLoading ? 'Autenticando...' : isRegister ? 'Cadastrar Escritório' : 'Entrar no ArchFlow'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-arch-muted">
              Backend com autenticação segura JWT (RFC 7807 ProblemDetail)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
