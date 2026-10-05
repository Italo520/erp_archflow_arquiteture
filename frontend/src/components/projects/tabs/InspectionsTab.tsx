import React from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";

interface InspectionsTabProps {
  projectId: string;
}

export function InspectionsTab({ projectId }: InspectionsTabProps) {
  return (
    <Card className="border-border mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Vistorias Técnicas Vinculadas</CardTitle>
        <Link to="/inspections">
          <Button size="sm" variant="outline" className="gap-2">
            <ClipboardCheck className="size-4" />
            Ir para Vistorias
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-foreground">Vistoria de Fundação e Escavação</h4>
            <p className="text-xs text-muted-foreground">Realizada em 2026-09-25 por Arq. Ítalo Guimarães</p>
          </div>
          <Badge variant="success">Laudo Emitido</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
