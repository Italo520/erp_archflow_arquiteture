import React from "react";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";

interface TeamTabProps {
  projectId: string;
}

export function TeamTab({ projectId }: TeamTabProps) {
  return (
    <Card className="border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Membros da Equipe Alocados</CardTitle>
        <Button size="sm" variant="outline" className="gap-2">
          <Plus className="size-4" />
          Alocar Membro
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Arq. Ítalo Guimarães", role: "Arquiteto Líder / Coordenador", rate: "R$ 180/h", initials: "IG" },
            { name: "Eng. Mariana Costa", role: "Engenheira Estrutural", rate: "R$ 160/h", initials: "MC" },
            { name: "Lucas Mendes", role: "Modelador BIM & Render", rate: "R$ 95/h", initials: "LM" },
          ].map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border bg-card/60 flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center shrink-0">
                {m.initials}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-foreground truncate">{m.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                <span className="text-[11px] font-mono text-primary font-medium mt-1 block">
                  {m.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
