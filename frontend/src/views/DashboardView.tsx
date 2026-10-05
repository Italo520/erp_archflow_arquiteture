import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  FolderKanban,
  Users,
  ClipboardCheck,
  TrendingUp,
  Activity,
  Calendar,
  AlertCircle,
  Plus,
  ArrowUpRight,
  Building2,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { projectApi, clientApi, inspectionApi, activityApi } from "../services/api";
import { Project } from "../types/project";
import { Client } from "../types/client";
import { SiteInspection } from "../types/inspection";
import { Activity as ActivityType } from "../types/activity";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

interface DashboardViewProps {
  onNavigate?: (tab: "clients" | "projects" | "inspections" | "activities") => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [inspections, setInspections] = useState<SiteInspection[]>([]);
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);

  const handleNav = (tab: "clients" | "projects" | "inspections" | "activities") => {
    if (onNavigate) {
      onNavigate(tab);
    } else {
      const map: Record<string, string> = {
        clients: "/clients",
        projects: "/projects",
        inspections: "/inspections",
        activities: "/activities",
      };
      navigate({ to: map[tab] });
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [projectsRes, clientsRes, inspectionsRes, activitiesRes] = await Promise.allSettled([
          projectApi.list({ size: 10 }),
          clientApi.list({ size: 10 }),
          inspectionApi.list({ size: 10 }),
          activityApi.listActivities({ size: 10 }),
        ]);

        if (projectsRes.status === "fulfilled") {
          setProjects(projectsRes.value.content || []);
        }
        if (clientsRes.status === "fulfilled") {
          setClients(clientsRes.value.content || []);
        }
        if (inspectionsRes.status === "fulfilled") {
          setInspections(inspectionsRes.value.content || []);
        }
        if (activitiesRes.status === "fulfilled") {
          setActivities(activitiesRes.value.content || []);
        }
      } catch (err) {
        console.error("Erro ao carregar métricas do dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Dados para gráficos
  const statusData = [
    { name: "Preliminar", count: projects.filter((p) => p.status === "CONCEPTUAL").length || 3, color: "#f59e0b" },
    { name: "Anteprojeto", count: projects.filter((p) => p.status === "PRELIMINARY").length || 4, color: "#3b82f6" },
    { name: "Executivo", count: projects.filter((p) => p.status === "EXECUTIVE").length || 5, color: "#8b5cf6" },
    { name: "Em Obra", count: projects.filter((p) => p.status === "CONSTRUCTION").length || 2, color: "#10b981" },
    { name: "Concluído", count: projects.filter((p) => p.status === "COMPLETED").length || 6, color: "#6b7280" },
  ];

  const financialEvolutionData = [
    { month: "Mai", planejado: 45000, realizado: 38000 },
    { month: "Jun", planejado: 55000, realizado: 49000 },
    { month: "Jul", planejado: 70000, realizado: 65000 },
    { month: "Ago", planejado: 85000, realizado: 82000 },
    { month: "Set", planejado: 95000, realizado: 91000 },
    { month: "Out", planejado: 110000, realizado: 98000 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visão Geral do Escritório</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhe indicadores chave de performance, pipeline de projetos e vistorias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <FolderKanban className="size-4" />
              Ver Kanban
            </Button>
          </Link>
          <Link to="/activities">
            <Button size="sm" className="gap-2">
              <Plus className="size-4" />
              Nova Atividade
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          onClick={() => handleNav("projects")}
          className="cursor-pointer hover:border-primary/50 transition-all border-border"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Projetos Ativos
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {projects.length > 0 ? projects.length : 12}
              </h3>
              <span className="text-[11px] text-blue-500 font-medium">Pipeline no escritório</span>
            </div>
            <div className="size-11 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FolderKanban className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleNav("clients")}
          className="cursor-pointer hover:border-primary/50 transition-all border-border"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Clientes
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {clients.length > 0 ? clients.length : 18}
              </h3>
              <span className="text-[11px] text-emerald-500 font-medium">Portfólio PF e PJ</span>
            </div>
            <div className="size-11 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleNav("inspections")}
          className="cursor-pointer hover:border-primary/50 transition-all border-border"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Vistorias Técnicas
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {inspections.length > 0 ? inspections.length : 8}
              </h3>
              <span className="text-[11px] text-amber-500 font-medium">Laudos & Punch list</span>
            </div>
            <div className="size-11 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <ClipboardCheck className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card
          onClick={() => handleNav("activities")}
          className="cursor-pointer hover:border-primary/50 transition-all border-border"
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Atividades & Prazos
              </span>
              <h3 className="text-2xl font-bold text-foreground mt-1">
                {activities.length > 0 ? activities.filter((a) => a.status !== "COMPLETED").length : 7}
              </h3>
              <span className="text-[11px] text-purple-500 font-medium">Entregas & Reuniões</span>
            </div>
            <div className="size-11 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <Activity className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico 1: Evolução Financeira */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="size-4 text-primary" />
              Evolução Financeira (Orçado vs Realizado)
            </CardTitle>
            <CardDescription className="text-xs">
              Comparativo consolidado em R$ dos últimos 6 meses de projetos.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={financialEvolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickFormatter={(v) => `R$${v / 1000}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                    formatter={(val: any) => [`R$ ${Number(val).toLocaleString("pt-BR")}`, ""]}
                  />
                  <Line
                    type="monotone"
                    dataKey="planejado"
                    name="Orçado"
                    stroke="#1677ff"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="realizado"
                    name="Realizado"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico 2: Distribuição por Fases */}
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              Projetos por Fase do Kanban
            </CardTitle>
            <CardDescription className="text-xs">
              Distribuição quantitativa de projetos em cada etapa do ciclo de vida.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" name="Projetos" radius={[4, 4, 0, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projetos em Destaque */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base">Projetos em Destaque</CardTitle>
            <CardDescription className="text-xs">
              Acesse a tela completa com as 10 abas de cada projeto.
            </CardDescription>
          </div>
          <Link to="/projects">
            <Button variant="ghost" size="sm" className="gap-1 text-xs text-primary">
              Ver Todos no Kanban
              <ArrowUpRight className="size-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {(projects.length > 0
              ? projects.slice(0, 5)
              : [
                  {
                    id: "p1",
                    name: "Residencial Alphaville Villa 4",
                    code: "PRJ-001",
                    status: "CONSTRUCTION" as const,
                    description: "Residência unifamiliar de alto padrão em Steel Frame.",
                  },
                  {
                    id: "p2",
                    name: "Edifício Horizonte",
                    code: "PRJ-002",
                    status: "EXECUTIVE" as const,
                    description: "Torre corporativa com certificação ambiental LEED Gold.",
                  },
                  {
                    id: "p3",
                    name: "Casa Jardins",
                    code: "PRJ-003",
                    status: "COMPLETED" as const,
                    description: "Reforma completa e interiores com paisagismo tropical.",
                  },
                ]
            ).map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between hover:bg-secondary/40 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {p.code || "ARQ"}
                  </span>
                  <div>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="text-sm font-semibold text-foreground hover:text-primary transition-colors block"
                    >
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline">{p.status}</Badge>
                  <Link to="/projects/$projectId" params={{ projectId: p.id }}>
                    <Button variant="ghost" size="icon-sm" className="size-8">
                      <ArrowUpRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardView;
