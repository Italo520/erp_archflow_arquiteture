import React from "react";
import { Upload, FileText, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

interface DeliverablesTabProps {
  projectId: string;
}

export function DeliverablesTab({ projectId }: DeliverablesTabProps) {
  return (
    <Card className="border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">Entregáveis Oficiais do Projeto</CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Documentação contratual com controle de versão e aprovação formal.
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Upload className="size-4" />
          Novo Entregável
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {[
            { name: "Prancha 01/04 - Plantas Baixas e Layout", version: "v3", status: "APPROVED", size: "12.4 MB" },
            { name: "Prancha 02/04 - Cortes e Elevações", version: "v2", status: "IN_REVIEW", size: "18.1 MB" },
            { name: "Prancha 03/04 - Detalhamento de Cozinha e Banhos", version: "v1", status: "DRAFT", size: "9.6 MB" },
            { name: "Caderno de Especificações de Acabamentos", version: "v1", status: "APPROVED", size: "4.2 MB" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText className="size-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {item.version}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{item.size}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={item.status === "APPROVED" ? "success" : item.status === "IN_REVIEW" ? "warning" : "outline"}>
                  {item.status === "APPROVED" ? "Aprovado pelo Cliente" : item.status === "IN_REVIEW" ? "Em Revisão" : "Rascunho"}
                </Badge>
                <Button variant="ghost" size="icon-sm" className="size-8" title="Download">
                  <Download className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
