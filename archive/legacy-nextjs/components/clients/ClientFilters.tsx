"use client";

import { Input } from "@/components/ui/input";
import { ClientSelect } from "./ClientSelect";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export function ClientFilters() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("query", term);
        } else {
            params.delete("query");
        }
        replace(`${pathname}?${params.toString()}`);
    }, 300);

    const handleStatusFilter = (status: string) => {
        const params = new URLSearchParams(searchParams);
        if (status && status !== "ALL") {
            params.set("status", status);
        } else {
            params.delete("status");
        }
        replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-4">
            <Input
                placeholder="Buscar clientes..."
                className="h-8 w-[150px] lg:w-[250px]"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("query")?.toString()}
            />
            {/* Simple status filter for now, can be expanded to ClientSelect if we adapt it or a Select component */}
            <select
                className="h-8 rounded-md border border-input bg-background px-3 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                onChange={(e) => handleStatusFilter(e.target.value)}
                defaultValue={searchParams.get("status")?.toString() || ""}
            >
                <option value="ALL">Todos Status</option>
                <option value="ACTIVE">Ativos</option>
                <option value="INACTIVE">Inativos</option>
                <option value="PROSPECT">Prospects</option>
                <option value="BLOCKED">Bloqueados</option>
            </select>
        </div>
    );
}
