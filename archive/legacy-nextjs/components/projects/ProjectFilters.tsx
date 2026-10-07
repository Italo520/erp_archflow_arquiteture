"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X } from "lucide-react";
import { ArchitecturalStyleEnum, ConstructionTypeEnum } from "@/lib/validations";

export default function ProjectFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State for all filters
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const [status, setStatus] = useState(searchParams.get("status") || "ALL");
    const [type, setType] = useState(searchParams.get("type") || "ALL"); // Project Type (Residential, etc.)
    const [health, setHealth] = useState(searchParams.get("health") || "ALL"); // Derived Health Status
    const [startDate, setStartDate] = useState(searchParams.get("startDate") || "");
    const [endDate, setEndDate] = useState(searchParams.get("endDate") || "");

    function handleApply() {
        const params = new URLSearchParams();
        if (searchTerm) params.set("q", searchTerm);
        if (status && status !== "ALL") params.set("status", status);
        if (type && type !== "ALL") params.set("type", type);
        if (health && health !== "ALL") params.set("health", health);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);

        router.push(`/projects?${params.toString()}`);
    }

    function handleClear() {
        setSearchTerm("");
        setStatus("ALL");
        setType("ALL");
        setHealth("ALL");
        setStartDate("");
        setEndDate("");
        router.push("/projects");
    }

    const hasActiveFilters = status !== "ALL" || type !== "ALL" || health !== "ALL" || startDate || endDate;

    return (
        <div className="flex flex-col gap-4 mb-6 p-4 bg-muted/30 rounded-lg border">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, cliente ou arquiteto..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                    />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleApply}>
                        <Filter className="mr-2 h-4 w-4" /> Filtrar
                    </Button>
                    {hasActiveFilters && (
                        <Button variant="ghost" onClick={handleClear} size="icon" title="Limpar Filtros">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                        <SelectValue placeholder="Status do Projeto" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Status</SelectItem>
                        <SelectItem value="PLANNING">Planejamento</SelectItem>
                        <SelectItem value="IN_PROGRESS">Em Andamento</SelectItem>
                        <SelectItem value="COMPLETED">Concluído</SelectItem>
                        <SelectItem value="ON_HOLD">Pausado</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={health} onValueChange={setHealth}>
                    <SelectTrigger>
                        <SelectValue placeholder="Estado (Saúde)" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Qualquer Estado</SelectItem>
                        <SelectItem value="ON_TRACK">No Prazo (On Track)</SelectItem>
                        <SelectItem value="DELAYED">Atrasado (Delayed)</SelectItem>
                        <SelectItem value="COMPLETED">Concluído</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                        <SelectValue placeholder="Estilo Arquitetônico" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Todos os Estilos</SelectItem>
                        {Object.values(ArchitecturalStyleEnum.enum).map(style => (
                            <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="flex gap-2 items-center text-sm sm:col-span-2 lg:col-span-2">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full"
                        title="Data Início De"
                    />
                    <span>até</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full"
                        title="Data Início Até"
                    />
                </div>
            </div>
        </div>
    );
}
