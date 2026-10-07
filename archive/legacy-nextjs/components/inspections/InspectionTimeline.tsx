"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Camera,
  CheckCircle,
  FileDown,
  Sun,
  User as UserIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { NewPunchListItemModal } from "./NewPunchListItemModal";
import { PunchItemCard } from "./PunchItemCard";
import { completeSiteInspection } from "@/app/actions/inspection";
import { toast } from "sonner";

interface InspectionTimelineProps {
  projectId: string;
  inspections: Array<{
    id: string;
    title: string;
    date: Date | string;
    status: string;
    weatherCondition?: string | null;
    generalNotes?: string | null;
    inspector?: { fullName: string } | null;
    items: Array<any>;
  }>;
  onRefresh?: () => void;
}

export function InspectionTimeline({
  projectId,
  inspections,
  onRefresh
}: InspectionTimelineProps) {
  const [selectedInspectionId, setSelectedInspectionId] = useState<string | null>(null);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [activeInspectionForAdd, setActiveInspectionForAdd] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(inspections[0]?.id || null);

  function handleOpenAddItem(inspectionId: string) {
    setActiveInspectionForAdd(inspectionId);
    setAddItemModalOpen(true);
  }

  async function handleCompleteInspection(inspectionId: string) {
    if (!confirm("Deseja finalizar esta vistoria técnica?")) return;
    try {
      const res = await completeSiteInspection(inspectionId);
      if (res.ok) {
        toast.success("Vistoria finalizada com sucesso!");
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || "Erro ao concluir");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado");
    }
  }

  if (inspections.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
        <Camera className="h-10 w-10 text-gray-400 mx-auto mb-3" />
        <h3 className="text-base font-semibold text-gray-800">
          Nenhuma vistoria registrada nesta obra
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mx-auto mt-1 mb-4">
          Inicie sua primeira vistoria técnica para fotografar e apontar pendências no canteiro.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {inspections.map((insp) => {
        const isExpanded = expandedId === insp.id;
        const totalItems = insp.items.length;
        const pendingItems = insp.items.filter(
          (i) => i.status === "PENDING" || i.status === "IN_PROGRESS"
        ).length;
        const resolvedItems = insp.items.filter((i) => i.status === "RESOLVED").length;
        const isCompleted = insp.status === "COMPLETED";

        return (
          <Card
            key={insp.id}
            className="border-gray-200 shadow-sm overflow-hidden transition-all"
          >
            {/* Topo do Card de Vistoria */}
            <div className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-base text-[#152026]">{insp.title}</h4>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold ${
                      isCompleted
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-blue-50 text-blue-800 border-blue-300"
                    }`}
                  >
                    {isCompleted ? "Finalizada" : "Em Andamento"}
                  </Badge>
                  {insp.weatherCondition && (
                    <Badge variant="secondary" className="text-[11px] gap-1 flex items-center">
                      <Sun className="h-3 w-3 text-amber-500" />
                      <span>{insp.weatherCondition}</span>
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    {format(new Date(insp.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                  {insp.inspector && (
                    <span className="flex items-center gap-1">
                      <UserIcon className="h-3.5 w-3.5 text-gray-400" />
                      {insp.inspector.fullName}
                    </span>
                  )}
                  <span className="font-medium text-gray-700">
                    {totalItems} não conformidades ({pendingItems} pendentes, {resolvedItems} resolvidas)
                  </span>
                </div>

                {insp.generalNotes && (
                  <p className="text-xs text-gray-600 italic pt-1">{insp.generalNotes}</p>
                )}
              </div>

              {/* Botões de Ação da Vistoria */}
              <div className="flex flex-wrap items-center gap-2">
                {!isCompleted && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenAddItem(insp.id)}
                    className="bg-[#152026] hover:bg-[#20313a] text-white text-xs h-8 flex items-center gap-1.5"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Apontar Item</span>
                  </Button>
                )}

                <a
                  href={`/api/projects/${projectId}/inspections/${insp.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition-colors"
                >
                  <FileDown className="h-3.5 w-3.5 text-gray-500" />
                  <span>Baixar PDF</span>
                </a>

                {!isCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteInspection(insp.id)}
                    className="text-xs h-8 border-gray-300 hover:bg-gray-50 text-emerald-800"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    <span>Concluir</span>
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpandedId(isExpanded ? null : insp.id)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-700"
                >
                  {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Itens da Vistoria Expandidos */}
            {isExpanded && (
              <div className="p-4 bg-gray-50/60 border-t border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Ocorrências Desta Visita ({insp.items.length})
                  </h5>
                  {!isCompleted && (
                    <button
                      type="button"
                      onClick={() => handleOpenAddItem(insp.id)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span>Adicionar Foto / Não Conformidade</span>
                    </button>
                  )}
                </div>

                {insp.items.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">
                    Nenhum item apontado ainda nesta vistoria.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {insp.items.map((item) => (
                      <PunchItemCard key={item.id} item={item} onRefresh={onRefresh} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}

      {activeInspectionForAdd && (
        <NewPunchListItemModal
          inspectionId={activeInspectionForAdd}
          open={addItemModalOpen}
          onOpenChange={setAddItemModalOpen}
          onSuccess={onRefresh}
        />
      )}
    </div>
  );
}
