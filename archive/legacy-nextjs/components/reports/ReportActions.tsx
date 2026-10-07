"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileSpreadsheet, FileText, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";

interface ReportActionsProps {
    reportType: string;
    period: string;
    from?: string;
    to?: string;
    projects?: string;
}

type ExportFormat = "pdf" | "excel" | "csv";

export function ReportActions({
    reportType,
    period,
    from,
    to,
    projects,
}: ReportActionsProps) {
    const [loading, setLoading] = useState<ExportFormat | null>(null);

    async function handleExport(type: ExportFormat) {
        setLoading(type);
        try {
            const params = new URLSearchParams({ type, reportType, period });
            if (from) params.set("from", from);
            if (to) params.set("to", to);
            if (projects) params.set("projects", projects);

            const response = await fetch(`/api/reports/export?${params.toString()}`);

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error ?? "Falha ao gerar o relatório");
            }

            // Trigger download
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");

            const disposition = response.headers.get("Content-Disposition") ?? "";
            const match = disposition.match(/filename="([^"]+)"/);
            a.download = match?.[1] ?? `relatorio-${Date.now()}.${type === "excel" ? "xlsx" : type}`;
            a.href = url;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            const labels: Record<ExportFormat, string> = {
                pdf: "PDF",
                excel: "Excel (.xlsx)",
                csv: "CSV",
            };
            toast.success(`Relatório ${labels[type]} gerado com sucesso!`);
        } catch (err: any) {
            toast.error(err.message ?? "Erro ao exportar relatório");
        } finally {
            setLoading(null);
        }
    }

    const isLoading = loading !== null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4" />
                    )}
                    Exportar
                    <ChevronDown className="ml-2 h-3 w-3 opacity-60" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Formato de exportação
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => handleExport("pdf")}
                    disabled={isLoading}
                    className="cursor-pointer"
                >
                    {loading === "pdf" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileText className="mr-2 h-4 w-4 text-red-500" />
                    )}
                    <span>PDF</span>
                    <span className="ml-auto text-xs text-muted-foreground">Relatório completo</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleExport("excel")}
                    disabled={isLoading}
                    className="cursor-pointer"
                >
                    {loading === "excel" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileSpreadsheet className="mr-2 h-4 w-4 text-green-600" />
                    )}
                    <span>Excel</span>
                    <span className="ml-auto text-xs text-muted-foreground">.xlsx formatado</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => handleExport("csv")}
                    disabled={isLoading}
                    className="cursor-pointer"
                >
                    {loading === "csv" ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <FileDown className="mr-2 h-4 w-4 text-blue-500" />
                    )}
                    <span>CSV</span>
                    <span className="ml-auto text-xs text-muted-foreground">Dados brutos</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
