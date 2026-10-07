"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { PunchItemCard } from "./PunchItemCard";
import { Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";

interface PunchListTableProps {
  items: Array<any>;
  onRefresh?: () => void;
}

export function PunchListTable({ items, onRefresh }: PunchListTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnv, setSelectedEnv] = useState<string>("ALL");
  const [selectedTrade, setSelectedTrade] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Extrair ambientes únicos
  const environments = useMemo(() => {
    const envs = new Set<string>();
    items.forEach((i) => {
      if (i.environment) envs.add(i.environment);
    });
    return Array.from(envs);
  }, [items]);

  // Extrair especialidades únicas
  const trades = useMemo(() => {
    const trs = new Set<string>();
    items.forEach((i) => {
      if (i.contractorTrade) trs.add(i.contractorTrade);
    });
    return Array.from(trs);
  }, [items]);

  // Filtragem combinada
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchTerm === "" ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.contractorName && item.contractorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.environment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchEnv = selectedEnv === "ALL" || item.environment === selectedEnv;
      const matchTrade = selectedTrade === "ALL" || item.contractorTrade === selectedTrade;
      const matchStatus =
        selectedStatus === "ALL" ||
        (selectedStatus === "PENDING" && (item.status === "PENDING" || item.status === "IN_PROGRESS")) ||
        (selectedStatus === "RESOLVED" && item.status === "RESOLVED");

      return matchSearch && matchEnv && matchTrade && matchStatus;
    });
  }, [items, searchTerm, selectedEnv, selectedTrade, selectedStatus]);

  const pendingCount = items.filter((i) => i.status === "PENDING" || i.status === "IN_PROGRESS").length;
  const resolvedCount = items.filter((i) => i.status === "RESOLVED").length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por descrição, ambiente ou prestador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Filtro de Status Rápido */}
          <div className="flex items-center gap-1.5 border border-gray-200 p-1 rounded-lg bg-gray-50 self-start">
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedStatus === "ALL"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Todos ({items.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("PENDING")}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                selectedStatus === "PENDING"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-amber-800 hover:text-amber-900"
              }`}
            >
              <AlertCircle className="h-3 w-3" />
              <span>Pendentes ({pendingCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus("RESOLVED")}
              className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1 transition-all ${
                selectedStatus === "RESOLVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-emerald-800 hover:text-emerald-900"
              }`}
            >
              <CheckCircle2 className="h-3 w-3" />
              <span>Resolvidos ({resolvedCount})</span>
            </button>
          </div>
        </div>

        {/* Dropdowns / Chips Secundários de Ambiente e Especialidade */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1 text-gray-500 mr-2">
            <Filter className="h-3.5 w-3.5" />
            <span className="font-semibold">Ambientes:</span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedEnv("ALL")}
            className={`px-2 py-0.5 rounded-full border transition-all ${
              selectedEnv === "ALL"
                ? "bg-[#152026] text-white border-[#152026]"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
            }`}
          >
            Todos
          </button>
          {environments.map((env) => (
            <button
              key={env}
              type="button"
              onClick={() => setSelectedEnv(env === selectedEnv ? "ALL" : env)}
              className={`px-2 py-0.5 rounded-full border transition-all ${
                selectedEnv === env
                  ? "bg-[#152026] text-white border-[#152026]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {env}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Itens Filtrados */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50/50 border border-dashed border-gray-200 rounded-2xl">
          <AlertCircle className="h-9 w-9 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-gray-700">Nenhuma não conformidade encontrada</h4>
          <p className="text-xs text-gray-500 mt-0.5">
            Ajuste os filtros ou a busca para localizar itens cadastrados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <PunchItemCard key={item.id} item={item} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}
