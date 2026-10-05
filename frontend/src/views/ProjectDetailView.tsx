import React, { useState, useEffect } from "react";
import { useParams, useSearch, Link } from "@tanstack/react-router";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  FileText,
  Folder,
  Users,
  ShieldAlert,
  ArrowLeft,
  Plus,
  ClipboardCheck,
} from "lucide-react";

import { OverviewTab } from "../components/projects/tabs/OverviewTab";
import { TasksTab } from "../components/projects/tabs/TasksTab";
import { DeliverablesTab } from "../components/projects/tabs/DeliverablesTab";
import { TeamTab } from "../components/projects/tabs/TeamTab";
import { FinancialTab } from "../components/projects/tabs/FinancialTab";
import { InspectionsTab } from "../components/projects/tabs/InspectionsTab";
import { DocumentsTab } from "../components/projects/tabs/DocumentsTab";
import { AuditTab } from "../components/projects/tabs/AuditTab";
import { Project } from "../types/project";

export function ProjectDetailView() {
  const { projectId } = useParams({ strict: false }) as { projectId?: string };
  const search = useSearch({ strict: false }) as { tab?: string };

  const [activeTab, setActiveTab] = useState<string>(search?.tab || "overview");

  useEffect(() => {
    if (search?.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);

  // Mock project detail data
  const project: Project = {
    id: projectId || "proj-1",
    name: "Residencial Alphaville Villa 4",
    clientName: "Roberto Silva",
    status: "EXECUTIVE",
    architecturalStyle: "CONTEMPORANEO",
    constructionType: "STEEL_FRAME",
    totalArea: 480.5,
    areaSquareMeters: 480.5,
    landscapingArea: 180.0,
    numberOfFloors: 2,
    numberOfRooms: 5,
    parkingSpots: 4,
    plannedCost: 85000.0,
    actualCost: 42000.0,
    startDate: "2026-08-01",
    deliveryDate: "2026-12-15",
    address: "Al. dos Flamboyants, 240 - Alphaville Residencial 2",
    description:
      "Residência unifamiliar sustentável de alto padrão em Steel Frame com automação residencial completa, placas solares e aproveitamento de águas pluviais.",
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-10-04T00:00:00Z",
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Top Bar with Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              Voltar aos Projetos
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{project.name}</h1>
              <Badge variant="info">Em Andamento</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cliente: <span className="font-semibold text-foreground">{project.clientName}</span> • {project.address}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-2">
            <Plus className="size-4" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Tabs Navigation (8 Abas Modulares de Alta Paridade) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1">
          <TabsList className="h-11 bg-muted/50 p-1 border border-border inline-flex min-w-full sm:min-w-0">
            <TabsTrigger value="overview" className="gap-2 text-xs">
              <Building2 className="size-3.5" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="tasks" className="gap-2 text-xs">
              <CheckCircle2 className="size-3.5" />
              Tarefas
            </TabsTrigger>
            <TabsTrigger value="deliverables" className="gap-2 text-xs">
              <FileText className="size-3.5" />
              Entregáveis
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2 text-xs">
              <Users className="size-3.5" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2 text-xs">
              <DollarSign className="size-3.5" />
              Financeiro
            </TabsTrigger>
            <TabsTrigger value="inspections" className="gap-2 text-xs">
              <ClipboardCheck className="size-3.5" />
              Vistorias
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 text-xs">
              <Folder className="size-3.5" />
              Plantas & Arquivos
            </TabsTrigger>
            <TabsTrigger value="audit" className="gap-2 text-xs">
              <ShieldAlert className="size-3.5" />
              Histórico & Auditoria
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Modular Tabs Contents */}
        <TabsContent value="overview">
          <OverviewTab project={project} />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="deliverables">
          <DeliverablesTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialTab project={project} />
        </TabsContent>

        <TabsContent value="inspections">
          <InspectionsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="audit">
          <AuditTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
