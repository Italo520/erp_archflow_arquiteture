import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

interface TasksTabProps {
  projectId: string;
}

export function TasksTab({ projectId }: TasksTabProps) {
  return (
    <Card className="border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Checklist de Fases e Tarefas</CardTitle>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="size-4" />
          Adicionar Tarefa
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {[
          { title: "Levantamento Planialtimétrico e Topográfico", phase: "Estudo Preliminar", status: "DONE" },
          { title: "Modelagem 3D Volumétrica da Residência", phase: "Anteprojeto", status: "DONE" },
          { title: "Detalhamento de Esquadrias e Alvenaria", phase: "Executivo", status: "IN_PROGRESS" },
          { title: "Compatibilização Hidrossanitária e Elétrica", phase: "Executivo", status: "PENDING" },
          { title: "Memorial Descritivo e Caderno de Encargos", phase: "Finalização", status: "PENDING" },
        ].map((t, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                defaultChecked={t.status === "DONE"}
                className="size-4 accent-primary rounded cursor-pointer"
              />
              <div>
                <p className={`text-sm font-medium ${t.status === "DONE" ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {t.title}
                </p>
                <span className="text-[11px] text-muted-foreground">{t.phase}</span>
              </div>
            </div>
            <Badge variant={t.status === "DONE" ? "success" : t.status === "info" ? "info" : "outline"}>
              {t.status === "DONE" ? "Concluído" : t.status === "IN_PROGRESS" ? "Em Execução" : "Pendente"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
