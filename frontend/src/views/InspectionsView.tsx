import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  CloudSun,
  MapPin,
  Camera,
  X,
  AlertCircle,
  Building,
} from 'lucide-react';
import { inspectionApi, projectApi } from '../services/api';
import { SiteInspection, PunchListItem, CreateSiteInspectionRequest, CreatePunchListItemRequest } from '../types/inspection';
import { Project } from '../types/project';

export const InspectionsView: React.FC = () => {
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedInspection, setSelectedInspection] = useState<SiteInspection | null>(null);
  const [punchListItems, setPunchListItems] = useState<PunchListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isNewInspectionOpen, setIsNewInspectionOpen] = useState(false);
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [isResolveItemOpen, setIsResolveItemOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Forms
  const [newInspForm, setNewInspForm] = useState<CreateSiteInspectionRequest>({
    title: '',
    projectId: '',
    generalNotes: '',
    weatherCondition: 'Ensolarado, 26°C',
  });

  const [newItemForm, setNewItemForm] = useState<CreatePunchListItemRequest>({
    description: '',
    location: '',
    severity: 'MEDIUM',
    photoUrl: '',
  });

  const [resolveNotes, setResolveNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [inspRes, projRes] = await Promise.all([
        inspectionApi.list({ size: 50 }),
        projectApi.list({ size: 100 }),
      ]);
      const list = inspRes.content || [];
      setInspections(list);
      setProjects(projRes.content || []);

      if (list.length > 0 && !selectedInspection) {
        setSelectedInspection(list[0]);
        loadItems(list[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar vistorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async (inspectionId: string) => {
    try {
      const items = await inspectionApi.getItems(inspectionId);
      setPunchListItems(items);
    } catch (err) {
      console.error('Erro ao carregar itens de punch list:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectInspection = (insp: SiteInspection) => {
    setSelectedInspection(insp);
    loadItems(insp.id);
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      const created = await inspectionApi.create(newInspForm);
      setIsNewInspectionOpen(false);
      setNewInspForm({
        title: '',
        projectId: '',
        generalNotes: '',
        weatherCondition: 'Ensolarado, 26°C',
      });
      await loadData();
      setSelectedInspection(created);
      loadItems(created.id);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.title || 'Erro ao criar vistoria.';
      setErrorMessage(msg);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection) return;
    try {
      await inspectionApi.addPunchListItem(selectedInspection.id, newItemForm);
      setIsNewItemOpen(false);
      setNewItemForm({
        description: '',
        location: '',
        severity: 'MEDIUM',
        photoUrl: '',
      });
      loadItems(selectedInspection.id);
    } catch (err) {
      alert('Erro ao adicionar apontamento.');
    }
  };

  const handleResolveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !selectedInspection) return;
    try {
      await inspectionApi.resolvePunchListItem(selectedItemId, {
        resolutionNotes: resolveNotes,
      });
      setIsResolveItemOpen(false);
      setResolveNotes('');
      setSelectedItemId(null);
      loadItems(selectedInspection.id);
    } catch (err) {
      alert('Erro ao marcar item como resolvido.');
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-white">Vistorias Técnicas & Punch List</h2>
          <p className="text-sm text-arch-muted">
            Inspeções de obra, controle de qualidade de acabamentos e pendências técnicas.
          </p>
        </div>
        <button
          onClick={() => { setErrorMessage(null); setIsNewInspectionOpen(true); }}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-arch-sage to-arch-warm text-surface-dark text-sm font-display font-bold flex items-center gap-2 shadow-lg hover:brightness-105 transition-all w-fit"
        >
          <Plus size={18} />
          <span>Nova Vistoria</span>
        </button>
      </div>

      {/* Main Grid: Inspections List & Inspection Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Inspections List */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <h3 className="text-sm font-display font-bold text-white uppercase tracking-wider text-arch-muted">
            Vistorias Realizadas ({inspections.length})
          </h3>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Carregando vistorias...</div>
          ) : inspections.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              Nenhuma vistoria técnica registrada.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {inspections.map((insp) => {
                const isSelected = selectedInspection?.id === insp.id;
                return (
                  <div
                    key={insp.id}
                    onClick={() => handleSelectInspection(insp)}
                    className={`p-4 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-surface-elevated border-arch-sage/60 shadow-sm'
                        : 'bg-surface-dark/60 border-border hover:border-border-highlight'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-white text-sm truncate">{insp.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">
                        {insp.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-arch-muted mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>{new Date(insp.date || insp.createdAt).toLocaleDateString('pt-BR')}</span>
                      </span>
                      {insp.weatherCondition && (
                        <span className="flex items-center gap-1">
                          <CloudSun size={12} />
                          <span>{insp.weatherCondition}</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Inspection Punch List Items */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-5">
          {selectedInspection ? (
            <>
              {/* Inspection Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck size={20} className="text-arch-sage" />
                    <h3 className="text-lg font-display font-bold text-white">
                      {selectedInspection.title}
                    </h3>
                  </div>
                  <p className="text-xs text-arch-muted">
                    {selectedInspection.generalNotes || 'Sem observações gerais.'}
                  </p>
                </div>

                <button
                  onClick={() => setIsNewItemOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-surface-elevated hover:bg-surface-elevated/80 border border-border text-xs font-semibold text-white flex items-center gap-1.5 transition-all w-fit"
                >
                  <Plus size={14} className="text-arch-sage" />
                  <span>Adicionar Pendência</span>
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-arch-muted">
                  Itens de Punch List ({punchListItems.length})
                </h4>

                {punchListItems.length === 0 ? (
                  <div className="py-12 text-center text-sm text-gray-400">
                    Nenhuma pendência apontada nesta vistoria. Obra em conformidade!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {punchListItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl bg-surface-card border border-border flex items-start justify-between gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                                item.severity
                              )}`}
                            >
                              {item.severity}
                            </span>
                            {item.location && (
                              <span className="text-xs text-arch-muted flex items-center gap-1">
                                <MapPin size={12} />
                                <span>{item.location}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-medium text-white">{item.description}</p>

                          {item.resolutionNotes && (
                            <div className="p-2.5 rounded-lg bg-surface-dark border border-border/80 text-xs text-emerald-300 flex items-center gap-2 mt-2">
                              <CheckCircle2 size={14} className="shrink-0" />
                              <span>Resolvido: {item.resolutionNotes}</span>
                            </div>
                          )}
                        </div>

                        {item.status !== 'RESOLVED' && (
                          <button
                            onClick={() => {
                              setSelectedItemId(item.id);
                              setIsResolveItemOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                          >
                            <CheckCircle2 size={14} />
                            <span>Resolver</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-sm text-gray-400">
              Selecione uma vistoria técnica para visualizar as pendências de obra.
            </div>
          )}
        </div>
      </div>

      {/* Modal Nova Vistoria */}
      {isNewInspectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-2xl shadow-elevated border border-border p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-lg font-display font-bold text-white">Agendar / Iniciar Vistoria Técnica</h3>
              <button
                onClick={() => setIsNewInspectionOpen(false)}
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

            <form onSubmit={handleCreateInspection} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Título da Vistoria *
                </label>
                <input
                  type="text"
                  required
                  value={newInspForm.title}
                  onChange={(e) => setNewInspForm({ ...newInspForm, title: e.target.value })}
                  placeholder="Ex: Vistoria Pré-Entrega - Alvenaria e Revestimentos"
                  className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Projeto Associado *
                </label>
                <select
                  required
                  value={newInspForm.projectId}
                  onChange={(e) => setNewInspForm({ ...newInspForm, projectId: e.target.value })}
                  className="w-full bg-surface-elevated text-sm text-white px-3 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                >
                  <option value="">Selecione o projeto...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Condição Climática
                </label>
                <input
                  type="text"
                  value={newInspForm.weatherCondition || ''}
                  onChange={(e) => setNewInspForm({ ...newInspForm, weatherCondition: e.target.value })}
                  placeholder="Céu aberto, 24°C"
                  className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Observações Gerais da Obra
                </label>
                <textarea
                  rows={3}
                  value={newInspForm.generalNotes || ''}
                  onChange={(e) => setNewInspForm({ ...newInspForm, generalNotes: e.target.value })}
                  placeholder="Status de equipe em canteiro, avanço de concretagem..."
                  className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewInspectionOpen(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-arch-sage to-arch-warm text-surface-dark font-display font-bold text-sm shadow-md hover:brightness-105 transition-all"
                >
                  Criar Vistoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Adicionar Item Punch List */}
      {isNewItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-elevated border border-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-display font-bold text-white">Apontar Pendência (Punch List)</h3>
              <button onClick={() => setIsNewItemOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Descrição do Apontamento *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newItemForm.description}
                  onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                  placeholder="Ex: Trinca na junção do gesso rebaixado da sala de estar"
                  className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    Localização na Obra
                  </label>
                  <input
                    type="text"
                    value={newItemForm.location || ''}
                    onChange={(e) => setNewItemForm({ ...newItemForm, location: e.target.value })}
                    placeholder="2º Pavimento - Suíte Master"
                    className="w-full bg-surface-elevated text-sm text-white px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                    Severidade
                  </label>
                  <select
                    value={newItemForm.severity}
                    onChange={(e) => setNewItemForm({ ...newItemForm, severity: e.target.value as any })}
                    className="w-full bg-surface-elevated text-sm text-white px-3 py-2 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                  >
                    <option value="LOW">Baixa</option>
                    <option value="MEDIUM">Média</option>
                    <option value="HIGH">Alta</option>
                    <option value="CRITICAL">Crítica</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewItemOpen(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-arch-sage to-arch-warm text-surface-dark font-display font-bold text-xs shadow-md hover:brightness-105"
                >
                  Salvar Apontamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Resolver Item */}
      {isResolveItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-elevated border border-border p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-display font-bold text-white">Registrar Resolução de Pendência</h3>
              <button onClick={() => setIsResolveItemOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleResolveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-arch-muted mb-1">
                  Parecer Técnico de Resolução *
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolveNotes}
                  onChange={(e) => setResolveNotes(e.target.value)}
                  placeholder="Ex: Refeito o tratamento de junta com fita telada e repintado com tinta látex fosca."
                  className="w-full bg-surface-elevated text-sm text-white px-3.5 py-2.5 rounded-xl border border-border focus:outline-none focus:border-arch-sage"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsResolveItemOpen(false)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-surface-dark font-display font-bold text-xs shadow-md"
                >
                  Concluir Resolução
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
