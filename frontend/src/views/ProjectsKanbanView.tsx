import React, { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FolderKanban,
  Plus,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Building,
  DollarSign,
  Search,
  ExternalLink,
  GripVertical,
  X,
  AlertCircle,
  Tag,
  Columns,
} from "lucide-react";
import { projectApi, clientApi } from "../services/api";
import { Project, CreateProjectRequest, ProjectStatus } from "../types/project";
import { Client } from "../types/client";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

export interface KanbanColumnDef {
  id: string;
  title: string;
  color: string;
}

// Colunas padrão do Kanban de Arquitetura alinhadas com o backend
export const DEFAULT_KANBAN_COLUMNS: KanbanColumnDef[] = [
  { id: "CONCEPTUAL", title: "Estudo Preliminar", color: "border-amber-500/40" },
  { id: "PRELIMINARY", title: "Anteprojeto", color: "border-blue-500/40" },
  { id: "EXECUTIVE", title: "Projeto Executivo", color: "border-purple-500/40" },
  { id: "CONSTRUCTION", title: "Em Obra / Acompanhamento", color: "border-emerald-500/40" },
  { id: "COMPLETED", title: "Entregue / Concluído", color: "border-gray-500/40" },
];

interface SortableCardProps {
  project: Project;
  onMoveManual: (projectId: string, direction: "prev" | "next") => void;
  canMovePrev: boolean;
  canMoveNext: boolean;
}

function SortableProjectCard({
  project,
  onMoveManual,
  canMovePrev,
  canMoveNext,
}: SortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-4 rounded-xl border border-border bg-card/90 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group relative select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground/60 hover:text-foreground p-0.5 rounded"
            title="Arraste para mover"
          >
            <GripVertical className="size-4" />
          </button>
          <span className="text-[11px] font-mono font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
            {project.code || "ARQ"}
          </span>
        </div>

        <Link to="/projects/$projectId" params={{ projectId: project.id }}>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-7 opacity-70 group-hover:opacity-100"
            title="Abrir Detalhes (10 abas)"
          >
            <ExternalLink className="size-3.5" />
          </Button>
        </Link>
      </div>

      <Link
        to="/projects/$projectId"
        params={{ projectId: project.id }}
        className="block group-hover:text-primary transition-colors"
      >
        <h4 className="text-sm font-semibold text-foreground line-clamp-1">
          {project.name}
        </h4>
      </Link>

      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
        {project.description || "Projeto arquitetônico residencial/comercial."}
      </p>

      {/* Tags e Metragem */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-border/60">
        {project.areaSquareMeters && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-secondary text-foreground">
            {project.areaSquareMeters} m²
          </span>
        )}
        <span className="text-[10px] font-mono font-semibold text-emerald-500 ml-auto">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
            project.contractValue || 0
          )}
        </span>
      </div>

      {/* Controles Manuais de Acessibilidade / Mobile */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canMovePrev}
          onClick={() => onMoveManual(project.id, "prev")}
          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
          title="Mover para coluna anterior"
        >
          <ArrowLeft className="size-3" />
          Anterior
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={!canMoveNext}
          onClick={() => onMoveManual(project.id, "next")}
          className="h-7 px-2 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
          title="Mover para próxima coluna"
        >
          Próximo
          <ArrowRight className="size-3" />
        </Button>
      </div>
    </div>
  );
}

export function ProjectsKanbanView() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    code: "",
    description: "",
    contractValue: 50000,
    areaSquareMeters: 250,
    clientId: "",
  });

  // Dynamic Custom Columns State
  const [columns, setColumns] = useState<KanbanColumnDef[]>(() => {
    const saved = localStorage.getItem("archflow_kanban_columns");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Falha ao carregar colunas do Kanban:", e);
      }
    }
    return DEFAULT_KANBAN_COLUMNS;
  });

  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("border-cyan-500/40");

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    const newId = `CUSTOM_${Date.now()}`;
    const updated = [...columns, { id: newId, title: newColumnTitle.trim(), color: newColumnColor }];
    setColumns(updated);
    localStorage.setItem("archflow_kanban_columns", JSON.stringify(updated));
    setNewColumnTitle("");
    setIsColumnModalOpen(false);
  };

  const handleRemoveColumn = (columnId: string) => {
    const hasProjects = projects.some((p) => p.status === columnId);
    if (hasProjects) {
      alert("Não é possível remover uma coluna que contém projetos. Mova os projetos antes de excluí-la.");
      return;
    }
    const updated = columns.filter((c) => c.id !== columnId);
    setColumns(updated);
    localStorage.setItem("archflow_kanban_columns", JSON.stringify(updated));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const loadProjects = async () => {
    setLoading(true);
    try {
      const [projData, clientData] = await Promise.all([
        projectApi.list({ size: 100 }),
        clientApi.list({ size: 100 }),
      ]);
      setProjects(projData.content || []);
      setClients(clientData.content || []);
    } catch (err) {
      console.error("Erro ao carregar projetos do Kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const found = projects.find((p) => p.id === event.active.id);
    if (found) setActiveProject(found);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveProject(null);

    if (!over) return;

    const projectId = active.id as string;
    const overId = over.id as string;

    // Se dropou sobre uma coluna
    let targetStatus = columns.find((c) => c.id === overId)?.id;

    // Se dropou sobre outro card, pega o status desse card
    if (!targetStatus) {
      const overProject = projects.find((p) => p.id === overId);
      if (overProject) targetStatus = overProject.status;
    }

    if (targetStatus) {
      // Atualização otimista
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status: targetStatus as any } : p))
      );

      try {
        await projectApi.update(projectId, { status: targetStatus as any });
      } catch (err) {
        console.error("Falha ao sincronizar status do projeto:", err);
        loadProjects(); // reverte se der erro
      }
    }
  };

  const handleMoveManual = async (projectId: string, direction: "prev" | "next") => {
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return;

    const currentIndex = columns.findIndex((c) => c.id === proj.status);
    if (currentIndex === -1) return;

    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= columns.length) return;

    const targetStatus = columns[newIndex].id as ProjectStatus;

    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, status: targetStatus } : p))
    );

    try {
      await projectApi.update(projectId, { status: targetStatus });
    } catch (err) {
      console.error("Falha ao mover projeto manualmente:", err);
      loadProjects();
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await projectApi.create({
        ...formData,
        status: "CONCEPTUAL",
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        code: "",
        description: "",
        contractValue: 50000,
        areaSquareMeters: 250,
        clientId: "",
      });
      loadProjects();
    } catch (err) {
      console.error("Erro ao criar projeto:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-full mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pipeline de Projetos (Kanban)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Arraste os cards entre as fases arquitetônicas ou utilize os botões manuais.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Filtrar projetos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsColumnModalOpen(true)} className="gap-2">
            <Columns className="size-4" />
            Nova Coluna
          </Button>

          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Novo Projeto
          </Button>
        </div>
      </div>

      {/* Quadro Kanban DnD */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6 pt-2">
          {columns.map((col, colIdx) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.id);
            const isCustom = col.id.startsWith("CUSTOM_");

            return (
              <div
                key={col.id}
                className="w-80 shrink-0 flex flex-col rounded-xl border border-border bg-card/40 backdrop-blur-sm p-3 min-h-[600px]"
              >
                {/* Cabeçalho da Coluna */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`size-2.5 rounded-full border ${col.color} bg-primary/20 shrink-0`} />
                    <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider truncate">
                      {col.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-xs font-mono font-bold text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {colProjects.length}
                    </span>
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveColumn(col.id)}
                        className="p-1 rounded text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                        title="Remover coluna vazia"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Lista de Cards da Coluna */}
                <SortableContext
                  items={colProjects.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex-1 space-y-3">
                    {colProjects.length === 0 ? (
                      <div className="h-32 rounded-lg border border-dashed border-border/80 flex items-center justify-center text-xs text-muted-foreground">
                        Nenhum projeto nesta fase
                      </div>
                    ) : (
                      colProjects.map((project) => (
                        <SortableProjectCard
                          key={project.id}
                          project={project}
                          onMoveManual={handleMoveManual}
                          canMovePrev={colIdx > 0}
                          canMoveNext={colIdx < columns.length - 1}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>

        {/* Drag Overlay para visual suave ao arrastar */}
        <DragOverlay>
          {activeProject ? (
            <div className="p-4 rounded-xl border-2 border-primary bg-card shadow-2xl scale-105 opacity-90">
              <h4 className="text-sm font-semibold text-foreground">{activeProject.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {activeProject.description}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modal de Criação de Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-lg font-bold text-foreground">Novo Projeto Arquitetônico</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Residencial Alphaville Villa 4"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Código do Projeto
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: PRJ-2026-001"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Cliente Vinculado
                  </label>
                  <select
                    value={formData.clientId}
                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Área Total (m²)
                  </label>
                  <input
                    type="number"
                    value={formData.areaSquareMeters}
                    onChange={(e) =>
                      setFormData({ ...formData, areaSquareMeters: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">
                    Valor do Contrato (R$)
                  </label>
                  <input
                    type="number"
                    value={formData.contractValue}
                    onChange={(e) =>
                      setFormData({ ...formData, contractValue: Number(e.target.value) })
                    }
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Descrição do Escopo
                </label>
                <textarea
                  rows={3}
                  placeholder="Descreva o escopo e objetivos do projeto..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Salvar Projeto"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nova Coluna */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-150">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Columns className="size-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Nova Coluna do Fluxo</h3>
              </div>
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleAddColumn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Título da Coluna *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Aprovação na Prefeitura"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Cor de Destaque
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { color: "border-cyan-500/40", bg: "bg-cyan-500" },
                    { color: "border-indigo-500/40", bg: "bg-indigo-500" },
                    { color: "border-rose-500/40", bg: "bg-rose-500" },
                    { color: "border-teal-500/40", bg: "bg-teal-500" },
                    { color: "border-orange-500/40", bg: "bg-orange-500" },
                    { color: "border-fuchsia-500/40", bg: "bg-fuchsia-500" },
                  ].map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setNewColumnColor(preset.color)}
                      className={`h-8 rounded-lg flex items-center justify-center border-2 transition-all ${
                        newColumnColor === preset.color
                          ? "border-primary ring-2 ring-primary/20 scale-105"
                          : "border-transparent"
                      }`}
                    >
                      <span className={`size-4 rounded-full ${preset.bg}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsColumnModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" size="sm">
                  Adicionar Coluna
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
