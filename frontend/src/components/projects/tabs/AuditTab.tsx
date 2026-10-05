import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Clock, Edit3, Trash2, CheckCircle2, PlusCircle } from "lucide-react";

interface AuditTabProps {
  projectId: string;
}

interface AuditLogEntry {
  id: string;
  action: string;
  type: "CREATE" | "UPDATE" | "DELETE" | "APPROVE";
  description: string;
  author: string;
  timestamp: string;
}

export function AuditTab({ projectId }: AuditTabProps) {
  const auditEntries: AuditLogEntry[] = [
    {
      id: "1",
      action: "Entregável Aprovado",
      type: "APPROVE",
      description: "Planta Baixa Executiva v2 aprovada pelo cliente Roberto Silva",
      author: "Roberto Silva (Cliente)",
      timestamp: "04/10/2026 21:15:32",
    },
    {
      id: "2",
      action: "Documento Editado",
      type: "UPDATE",
      description: "Revisão R04 da Planta Baixa Executiva enviada com cotas atualizadas",
      author: "Arq. Ítalo Guimarães",
      timestamp: "04/10/2026 18:40:10",
    },
    {
      id: "3",
      action: "Vistoria Agendada",
      type: "CREATE",
      description: "Vistoria Técnica de Fundação cadastrada para 15/10/2026 às 10:00",
      author: "Arq. Ítalo Guimarães",
      timestamp: "03/10/2026 14:22:05",
    },
    {
      id: "4",
      action: "Item Excluído",
      type: "DELETE",
      description: "Croqui preliminar obsoleto (draft_0.dwg) removido do repositório",
      author: "Lucas Mendes",
      timestamp: "01/10/2026 11:05:48",
    },
    {
      id: "5",
      action: "Projeto Criado",
      type: "CREATE",
      description: "Registro inicial do Projeto Residencial Alphaville Villa 4",
      author: "Arq. Ítalo Guimarães",
      timestamp: "15/08/2026 09:30:00",
    },
  ];

  const getIcon = (type: AuditLogEntry["type"]) => {
    switch (type) {
      case "CREATE":
        return <PlusCircle className="size-3 text-blue-500" />;
      case "UPDATE":
        return <Edit3 className="size-3 text-amber-500" />;
      case "DELETE":
        return <Trash2 className="size-3 text-red-500" />;
      case "APPROVE":
        return <CheckCircle2 className="size-3 text-emerald-500" />;
    }
  };

  return (
    <Card className="border-border mt-4">
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>Linha do Tempo de Alterações e Auditoria (Audit Log)</span>
          <span className="text-xs font-normal text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Rastreabilidade com data e hora exatas
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {auditEntries.map((ev) => (
            <div key={ev.id} className="relative group">
              <span className="absolute -left-[21px] top-1 size-3 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center ring-4 ring-background" />
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {getIcon(ev.type)}
                    <h5 className="text-xs font-semibold text-foreground">{ev.action}</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {ev.author}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground shrink-0 bg-secondary/50 px-2 py-0.5 rounded border border-border">
                  {ev.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
