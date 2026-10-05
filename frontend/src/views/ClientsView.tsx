import React, { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Building2,
  Mail,
  Phone,
  Trash2,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { clientApi } from '../services/api';
import { Client, CreateClientRequest, ClientCategory, ClientLegalType, ClientStatus } from '../types/client';

export const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateClientRequest>({
    name: '',
    email: '',
    phone: '',
    legalType: 'PF',
    document: '',
    razaoSocial: '',
    inscricaoEstadual: '',
    address: '',
    category: 'RESIDENTIAL',
    notes: '',
  });

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await clientApi.list({
        search: search || undefined,
        status: selectedStatus || undefined,
        category: selectedCategory || undefined,
        size: 50,
      });
      setClients(data.content || []);
    } catch (err) {
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadClients();
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, selectedStatus, selectedCategory]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await clientApi.create(formData);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        legalType: 'PF',
        document: '',
        razaoSocial: '',
        inscricaoEstadual: '',
        address: '',
        category: 'RESIDENTIAL',
        notes: '',
      });
      loadClients();
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.title || 'Erro ao cadastrar cliente.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Deseja realmente remover o cliente "${name}"?`)) {
      try {
        await clientApi.delete(id);
        loadClients();
      } catch (err) {
        alert('Não foi possível excluir o cliente.');
      }
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Gestão de Clientes</h2>
          <p className="text-sm text-arch-muted">
            Relacionamento com contratantes, investidores e incorporadoras.
          </p>
        </div>
        <button
          onClick={() => { setErrorMessage(null); setIsModalOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-arch-sage to-arch-warm text-surface-dark text-sm font-display font-bold flex items-center gap-2 shadow-lg hover:brightness-105 transition-all w-fit"
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail, documento..."
            className="w-full bg-surface-elevated text-sm text-white pl-10 pr-4 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-surface-elevated text-xs text-gray-200 px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
          >
            <option value="">Todas as Categorias</option>
            <option value="RESIDENTIAL">Residencial</option>
            <option value="COMMERCIAL">Comercial</option>
            <option value="INSTITUTIONAL">Institucional</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="DESIGNER">Design de Interiores</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-surface-elevated text-xs text-gray-200 px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
          >
            <option value="">Todos os Status</option>
            <option value="ACTIVE">Ativo</option>
            <option value="PROSPECT">Prospect</option>
            <option value="INACTIVE">Inativo</option>
            <option value="CHURN">Churn</option>
          </select>
        </div>
      </div>

      {/* Clients Table / Cards */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-border">
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Carregando carteira de clientes...</div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Nenhum cliente encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-dark/80 text-xs font-semibold text-arch-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-4">Cliente / Razão</th>
                  <th className="px-6 py-4">Tipo & Documento</th>
                  <th className="px-6 py-4">Categoria</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {clients.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-elevated/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{c.name}</div>
                      {c.razaoSocial && (
                        <div className="text-[11px] text-arch-warm font-medium truncate max-w-xs">
                          {c.razaoSocial}
                        </div>
                      )}
                      <div className="text-xs text-arch-muted flex items-center gap-1 mt-0.5">
                        <Mail size={12} />
                        <span>{c.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs text-gray-300">
                        {c.legalType === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </span>
                      {c.document && (
                        <div className="text-xs text-gray-400 font-mono mt-0.5">{c.document}</div>
                      )}
                      {c.inscricaoEstadual && (
                        <div className="text-[10px] text-gray-500 font-mono">IE: {c.inscricaoEstadual}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-surface-elevated border border-border text-arch-warm font-medium">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : c.status === 'PROSPECT'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-300">
                      {c.phone ? (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-arch-muted" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Não informado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remover cliente"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl shadow-elevated border border-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-display font-bold text-white">Cadastrar Novo Cliente</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Tipo de Cliente
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-elevated border border-border">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, legalType: 'PF' })}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      formData.legalType === 'PF'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Pessoa Física (PF)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, legalType: 'PJ' })}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      formData.legalType === 'PJ'
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Pessoa Jurídica (PJ)
                  </button>
                </div>
              </div>

              {formData.legalType === 'PJ' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                        Nome Fantasia *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Studio Alpha Arquitetura"
                        className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                        Razão Social *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.razaoSocial || ''}
                        onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                        placeholder="Ex: Alpha Empreendimentos LTDA"
                        className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                        CNPJ *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.document || ''}
                        onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                        placeholder="00.000.000/0000-00"
                        className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                        Inscrição Estadual (IE)
                      </label>
                      <input
                        type="text"
                        value={formData.inscricaoEstadual || ''}
                        onChange={(e) => setFormData({ ...formData, inscricaoEstadual: e.target.value })}
                        placeholder="Ex: 123.456.789.000"
                        className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage font-mono"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Roberto da Silva"
                      className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      value={formData.document || ''}
                      onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@cliente.com"
                    className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    Categoria
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ClientCategory })}
                    className="w-full bg-surface-elevated text-sm text-white px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  >
                    <option value="RESIDENTIAL">Residencial</option>
                    <option value="COMMERCIAL">Comercial</option>
                    <option value="INSTITUTIONAL">Institucional</option>
                    <option value="INDUSTRIAL">Industrial</option>
                    <option value="DESIGNER">Design de Interiores</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    Endereço / Localização
                  </label>
                  <input
                    type="text"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Av. Paulista, 1000 - São Paulo/SP"
                    className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-arch-sage to-arch-warm text-surface-dark font-display font-bold text-sm shadow-md hover:brightness-105 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
