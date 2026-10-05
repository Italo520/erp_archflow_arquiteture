import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

interface ScheduleEvent {
  id: string;
  title: string;
  project: string;
  date: string;
  type: "milestone" | "inspection" | "delivery";
  status: "pending" | "completed" | "delayed";
}

const mockEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "Entrega do Projeto Executivo e Detalhamento",
    project: "Residencial Alphaville Villa 4",
    date: "2026-10-15",
    type: "delivery",
    status: "pending",
  },
  {
    id: "2",
    title: "Vistoria Técnica de Fundação e Estrutura",
    project: "Edifício Horizonte",
    date: "2026-10-18",
    type: "inspection",
    status: "pending",
  },
  {
    id: "3",
    title: "Aprovação de Layout com Cliente",
    project: "Casa Jardins",
    date: "2026-10-08",
    type: "milestone",
    status: "completed",
  },
  {
    id: "4",
    title: "Apresentação de Renders e Maquete 3D",
    project: "Loft Industrial Pinheiros",
    date: "2026-10-22",
    type: "delivery",
    status: "pending",
  },
];

export function ScheduleView() {
  const [currentMonth] = useState("Outubro 2026");

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "delivery":
        return <Badge variant="info">Entrega</Badge>;
      case "inspection":
        return <Badge variant="warning">Vistoria</Badge>;
      case "milestone":
        return <Badge variant="success">Marco</Badge>;
      default:
        return <Badge variant="outline">Evento</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cronograma & Prazos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acompanhamento de entregas de projetos, vistorias e marcos arquitetônicos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-semibold px-2">{currentMonth}</span>
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* Grid de Eventos e Linha do Tempo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximos Marcos (Lista) */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Próximos Compromissos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3 rounded-lg border border-border bg-card/60 hover:bg-secondary/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    {getTypeBadge(evt.type)}
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(evt.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">
                    {evt.title}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Building2 className="size-3 text-muted-foreground" />
                    <span className="truncate">{evt.project}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Visão em Grade do Calendário */}
        <div className="lg:col-span-2">
          <Card className="border-border h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="size-4 text-primary" />
                Visão Mensal de Prazos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden border border-border text-center text-xs">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                  <div key={day} className="bg-muted py-2 font-semibold text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Dias do mês mockados para demonstração */}
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const hasDelivery = day === 15 || day === 22;
                  const hasInspection = day === 18;
                  const hasMilestone = day === 8;

                  return (
                    <div
                      key={day}
                      className="bg-card min-h-[70px] p-1.5 flex flex-col justify-between text-left hover:bg-secondary/30 transition-colors"
                    >
                      <span className="font-semibold text-xs text-foreground/80">{day}</span>
                      <div className="space-y-1">
                        {hasDelivery && (
                          <div className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 font-medium px-1 rounded truncate">
                            Entrega Executiva
                          </div>
                        )}
                        {hasInspection && (
                          <div className="text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium px-1 rounded truncate">
                            Vistoria Estrutural
                          </div>
                        )}
                        {hasMilestone && (
                          <div className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium px-1 rounded truncate">
                            Layout Aprovado
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
