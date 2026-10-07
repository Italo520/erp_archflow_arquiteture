"use client";

import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
    data: any[];
    filename?: string;
}

export default function ExportButton({ data, filename = "projects" }: ExportButtonProps) {

    const handleExportCSV = () => {
        if (!data || !data.length) return;

        // Extract headers
        const headers = Object.keys(data[0]);

        // Convert to CSV string
        const csvContent = [
            headers.join(','), // Header row
            ...data.map(row => headers.map(header => {
                const val = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const cell = String(val === null || val === undefined ? '' : val).replace(/"/g, '""');
                return `"${cell}"`;
            }).join(',')) // Data rows
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Exportar CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir (PDF)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
