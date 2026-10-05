import React from "react";
import { Project } from "../../../types/project";
import { Card } from "../../ui/card";

interface FinancialTabProps {
  project: Project;
}

export function FinancialTab({ project }: FinancialTabProps) {
  const planned = project.plannedCost || 85000;
  const actual = project.actualCost || 42000;
  const balance = planned - actual;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
      <Card className="border-border p-4">
        <span className="text-xs text-muted-foreground">Orçamento Total Aprovado</span>
        <h3 className="text-xl font-bold text-foreground mt-1">
          R$ {planned.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h3>
      </Card>
      <Card className="border-border p-4">
        <span className="text-xs text-muted-foreground">Total Realizado (Custos)</span>
        <h3 className="text-xl font-bold text-emerald-500 mt-1">
          R$ {actual.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h3>
      </Card>
      <Card className="border-border p-4">
        <span className="text-xs text-muted-foreground">Saldo Remanescente</span>
        <h3 className="text-xl font-bold text-foreground mt-1">
          R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </h3>
      </Card>
    </div>
  );
}
