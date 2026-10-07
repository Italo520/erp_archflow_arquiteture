"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { ResolveItemModal } from "./ResolveItemModal";
import { deletePunchListItem } from "@/app/actions/inspection";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PunchItemCardProps {
  item: {
    id: string;
    environment: string;
    contractorTrade: string;
    contractorName?: string | null;
    description: string;
    severity: string;
    status: string;
    beforePhotoUrl: string;
    afterPhotoUrl?: string | null;
    resolutionNotes?: string | null;
    createdAt: Date | string;
    resolvedAt?: Date | string | null;
  };
  onRefresh?: () => void;
}

export function PunchItemCard({ item, onRefresh }: PunchItemCardProps) {
  const [resolveOpen, setResolveOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const severityConfig = {
    LOW: { label: "Baixa", color: "bg-blue-50 text-blue-700 border-blue-200" },
    MEDIUM: { label: "Média", color: "bg-amber-50 text-amber-700 border-amber-200" },
    HIGH: { label: "Alta", color: "bg-orange-50 text-orange-700 border-orange-200" },
    CRITICAL: { label: "Crítica", color: "bg-red-50 text-red-700 border-red-200" }
  };

  const statusConfig = {
    PENDING: { label: "Pendente", color: "bg-yellow-50 text-yellow-800 border-yellow-300" },
    IN_PROGRESS: { label: "Em Correção", color: "bg-blue-50 text-blue-800 border-blue-300" },
    RESOLVED: { label: "Resolvido", color: "bg-emerald-50 text-emerald-800 border-emerald-300" },
    CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-600 border-gray-200" }
  };

  const sCfg = severityConfig[item.severity as keyof typeof severityConfig] || severityConfig.MEDIUM;
  const stCfg = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.PENDING;

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja excluir esta não conformidade?")) return;
    setDeleting(true);
    try {
      const res = await deletePunchListItem(item.id);
      if (res.ok) {
        toast.success("Item excluído com sucesso");
        if (onRefresh) onRefresh();
      } else {
        toast.error(res.message || "Erro ao excluir");
      }
    } catch (e: any) {
      toast.error(e.message || "Erro inesperado");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-3">
      {/* Topo: Badges & Ações */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-bold text-sm text-[#152026]">{item.environment}</span>
          <span className="text-gray-400">•</span>
          <span className="text-xs font-medium text-gray-600">
            {item.contractorTrade}
            {item.contractorName ? ` (${item.contractorName})` : ""}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${sCfg.color}`}>
            {sCfg.label}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border font-semibold ${stCfg.color}`}>
            {stCfg.label}
          </Badge>
        </div>
      </div>

      {/* Descrição */}
      <p className="text-sm text-gray-800 leading-relaxed font-normal">
        {item.description}
      </p>

      {/* Comparativo de Fotos */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Antes */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Foto do Antes</span>
            <Clock className="h-3 w-3 text-gray-400" />
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.beforePhotoUrl}
              alt="Foto do Antes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Depois */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Foto do Depois</span>
            {item.status === "RESOLVED" && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
          </div>
          <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-32 relative flex items-center justify-center">
            {item.afterPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.afterPhotoUrl}
                alt="Foto do Depois"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="p-3 text-center text-xs text-gray-400 flex flex-col items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Pendente de correção</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Observações de Resolução */}
      {item.resolutionNotes && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 text-xs text-emerald-900">
          <span className="font-semibold">Resolução: </span>
          {item.resolutionNotes}
        </div>
      )}

      {/* Rodapé do Card */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
        <span>
          Registrado em: {format(new Date(item.createdAt), "dd/MM/yyyy", { locale: ptBR })}
        </span>

        <div className="flex items-center gap-1.5">
          {item.status !== "RESOLVED" && (
            <Button
              size="sm"
              onClick={() => setResolveOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white h-7 px-2.5 text-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              <span>Resolver</span>
            </Button>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-600 h-7 w-7 p-0"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <ResolveItemModal
        item={item}
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        onSuccess={onRefresh}
      />
    </div>
  );
}
