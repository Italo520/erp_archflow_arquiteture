import React from "react";
import { Project } from "../../../types/project";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";

interface OverviewTabProps {
  project: Project;
}

export function OverviewTab({ project }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
      <Card className="md:col-span-2 border-border">
        <CardHeader>
          <CardTitle className="text-base">Especificações Arquitetônicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {project.description || "Nenhuma descrição informada para este projeto."}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Área Construída</span>
              <span className="text-sm font-bold text-foreground">{project.totalArea || 0} m²</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Área Paisagismo</span>
              <span className="text-sm font-bold text-foreground">{project.landscapingArea || 0} m²</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Estilo Arquitetônico</span>
              <span className="text-sm font-bold text-foreground">{project.architecturalStyle || "Moderno Contemporâneo"}</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Sistema Construtivo</span>
              <span className="text-sm font-bold text-foreground">{project.constructionType || "Alvenaria e Concreto Armado"}</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Pavimentos</span>
              <span className="text-sm font-bold text-foreground">{project.numberOfFloors || 1} andares ({project.numberOfRooms || 0} cômodos)</span>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50 border border-border">
              <span className="text-[11px] text-muted-foreground block">Vagas de Garagem</span>
              <span className="text-sm font-bold text-foreground">{project.parkingSpots || 0} veículos</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Prazos e Custos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progresso Global</span>
              <span className="font-bold text-primary">65%</span>
            </div>
            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "65%" }} />
            </div>
          </div>

          <div className="space-y-2 pt-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Início:</span>
              <span className="font-mono font-medium">
                {project.startDate ? new Date(project.startDate).toLocaleDateString("pt-BR") : "N/D"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Previsão Entrega:</span>
              <span className="font-mono font-medium">
                {project.deliveryDate ? new Date(project.deliveryDate).toLocaleDateString("pt-BR") : "N/D"}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border">
              <span className="text-muted-foreground">Orçamento Previsto:</span>
              <span className="font-mono font-semibold text-foreground">
                R$ {(project.plannedCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Custo Executado:</span>
              <span className="font-mono font-semibold text-emerald-500">
                R$ {(project.actualCost || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
