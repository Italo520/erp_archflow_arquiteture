"use client";

import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";

export function ReportActions() {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
            </Button>
            <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
            </Button>
        </div>
    );
}
