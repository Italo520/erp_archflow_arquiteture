import React from "react";
import { Upload, FileText, Download } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";

interface DocumentsTabProps {
  projectId: string;
}

export function DocumentsTab({ projectId }: DocumentsTabProps) {
  return (
    <Card className="border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Pranchas e Documentos Técnicos</CardTitle>
        <Button size="sm" className="gap-2">
          <Upload className="size-4" />
          Upload de Planta
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border text-xs">
          {[
            { name: "Planta_Baixa_Executiva_R04.pdf", size: "14.2 MB", date: "2026-10-02" },
            { name: "Cortes_Esquematicos_Estrutura.dwg", size: "22.8 MB", date: "2026-09-28" },
          ].map((doc, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-primary" />
                <div>
                  <p className="font-semibold text-foreground">{doc.name}</p>
                  <span className="text-muted-foreground font-mono">{doc.size}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon-sm" className="size-7" title="Download">
                <Download className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
