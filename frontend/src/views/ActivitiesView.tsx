import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Activity, Plus, Search, Calendar, CheckCircle2, Clock, User, Building2 } from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  project: string;
  assignee: string;
  dueDate: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  durationHours: number;
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    title: "Detalhamento de Esquadrias e Alvenaria",
    project: "Residencial Alphaville Villa 4",
    assignee: "Arq. Ítalo Guimarães",
    dueDate: "2026-10-10",
    status: "IN_PROGRESS",
    durationHours: 6.5,
  },
  {
    id: "2",
    title: "Compatibilização Estrutural vs Hidráulica",
    project: "Edifício Horizonte",
    assignee: "Eng. Mariana Costa",
    dueDate: "2026-10-12",
    status: "PENDING",
    durationHours: 4.0,
  },
  {
    id: "3",
    title: "Reunião de Briefing e Levantamento Métrico",
    project: "Loft Industrial Pinheiros",
    assignee: "Arq. Lucas Mendes",
    dueDate: "2026-10-04",
    status: "COMPLETED",
    durationHours: 2.0,
  },
  {
    id: "4",
    title: "Renderização da Fachada Principal (Luz do Entardecer)",
    project: "Casa Jardins",
    assignee: "Designer Carlos Silva",
    dueDate: "2026-10-09",
    status: "IN_PROGRESS",
    durationHours: 8.0,
  },
];

export function ActivitiesView() {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = mockActivities.filter((act) => {
    const matchesSearch =
      act.title.toLowerCase().includes(search.toLowerCase()) ||
      act.project.toLowerCase().includes(search.toLowerCase()) ||
      act.assignee.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || act.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">Concluído</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="info">Em Andamento</Badge>;
      default:
        return <Badge variant="warning">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quadro de Atividades</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerenciamento de tarefas técnicas, apontamento e distribuição da equipe.
          </p>
        </div>

        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Nova Atividade
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por tarefa, projeto ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-sm rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"].map((st) => (
            <Button
              key={st}
              variant={filterStatus === st ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(st)}
              className="h-8 text-xs"
            >
              {st === "ALL"
                ? "Todas"
                : st === "PENDING"
                ? "Pendentes"
                : st === "IN_PROGRESS"
                ? "Em Andamento"
                : "Concluídas"}
            </Button>
          ))}
        </div>
      </div>

      {/* Lista */}
      <Card className="border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Atividade</th>
                  <th className="py-3 px-4">Projeto</th>
                  <th className="py-3 px-4">Responsável</th>
                  <th className="py-3 px-4">Prazo</th>
                  <th className="py-3 px-4 text-center">Horas</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {item.title}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground" />
                      {item.project}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <User className="size-3.5 text-muted-foreground" />
                        {item.assignee}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {new Date(item.dueDate).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 px-4 font-mono text-center font-medium">
                      {item.durationHours}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
