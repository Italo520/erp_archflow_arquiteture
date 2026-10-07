"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, Mail, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import { downloadReport, emailReport, ReportType, ExportFormat } from "@/app/actions/reports";
import { toast } from "sonner";

interface ExportButtonsProps {
    reportType: ReportType;
    filters: {
        period: 'today' | 'week' | 'month' | 'quarter' | 'custom';
        from?: string;
        to?: string;
        projectIds?: string[];
    };
    className?: string;
}

export function ExportButtons({ reportType, filters, className }: ExportButtonsProps) {
    const [loading, setLoading] = useState<'pdf' | 'excel' | 'email' | null>(null);

    const handleDownload = async (format: ExportFormat) => {
        setLoading(format);
        try {
            const result = await downloadReport(filters, reportType, format);

            if (result.success && result.data && result.filename) {
                // Decode base64 and create download
                const byteCharacters = atob(result.data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);

                const mimeType = format === 'pdf'
                    ? 'application/pdf'
                    : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.href = url;
                link.download = result.filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast.success('Relatório baixado com sucesso!');
            } else {
                toast.error(result.error || 'Erro ao gerar relatório');
            }
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Erro ao baixar relatório');
        } finally {
            setLoading(null);
        }
    };

    const handleEmail = async () => {
        setLoading('email');
        try {
            const result = await emailReport(filters, reportType);

            if (result.success) {
                toast.success('Relatório enviado por email!');
            } else {
                toast.error(result.error || 'Erro ao enviar email');
            }
        } catch (error) {
            console.error('Email error:', error);
            toast.error('Erro ao enviar email');
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={loading !== null}>
                        {loading === 'pdf' || loading === 'excel' ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <FileDown className="mr-2 h-4 w-4" />
                        )}
                        Exportar
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownload('pdf')} disabled={loading !== null}>
                        <FileText className="mr-2 h-4 w-4" />
                        Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownload('excel')} disabled={loading !== null}>
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Button
                variant="outline"
                size="sm"
                onClick={handleEmail}
                disabled={loading !== null}
            >
                {loading === 'email' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Mail className="mr-2 h-4 w-4" />
                )}
                Enviar por Email
            </Button>
        </div>
    );
}
