"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewInspectionDialog } from "@/components/inspections/NewInspectionDialog";
import { InspectionTimeline } from "@/components/inspections/InspectionTimeline";
import { PunchListTable } from "@/components/inspections/PunchListTable";
import { Camera, ListChecks, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProjectInspectionsTabProps {
  project: {
    id: string;
    name: string;
    siteInspections?: Array<any>;
    punchListItems?: Array<any>;
  };
}

export default function ProjectInspectionsTab({ project }: ProjectInspectionsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState("timeline");
  const router = useRouter();

  const inspections = project.siteInspections || [];
  const punchListItems = project.punchListItems || [];

  const pendingCount = punchListItems.filter(
    (i) => i.status === "PENDING" || i.status === "IN_PROGRESS"
  ).length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Aba */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#152026] flex items-center gap-2">
            <Camera className="h-5 w-5 text-gray-700" />
            <span>Vistorias Técnicas & Acompanhamento de Obra</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Registro de não conformidades no canteiro, fotos de Antes/Depois e emissão de relatórios em PDF.
          </p>
        </div>

        <NewInspectionDialog
          projectId={project.id}
          onSuccess={() => router.refresh()}
        />
      </div>

      {/* Sub-Navegação */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="timeline"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#152026] data-[state=active]:shadow-sm flex items-center gap-1.5"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Linha do Tempo de Visitas ({inspections.length})</span>
          </TabsTrigger>
          <TabsTrigger
            value="punchlist"
            className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-[#152026] data-[state=active]:shadow-sm flex items-center gap-1.5"
          >
            <ListChecks className="h-3.5 w-3.5" />
            <span>
              Painel Geral de Pendências ({punchListItems.length})
              {pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                  {pendingCount}
                </span>
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="outline-none">
          <InspectionTimeline
            projectId={project.id}
            inspections={inspections}
            onRefresh={() => router.refresh()}
          />
        </TabsContent>

        <TabsContent value="punchlist" className="outline-none">
          <PunchListTable
            items={punchListItems}
            onRefresh={() => router.refresh()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
