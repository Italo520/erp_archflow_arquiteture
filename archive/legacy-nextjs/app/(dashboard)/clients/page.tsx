
import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ClientsTable } from "@/components/clients/ClientsTable";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientStats } from "@/components/clients/ClientStats";
import { ExportButton } from "@/components/clients/ExportButton";
import { listClients, getClientStats } from "@/app/actions/client";

export const metadata: Metadata = {
    title: "Gestão de Clientes | ArchFlow",
    description: "Gerencie sua carteira de clientes",
};

export default async function ClientsPage(props: {
    searchParams?: Promise<{
        query?: string;
        status?: string;
        page?: string;
    }>;
}) {
    const searchParams = await props.searchParams;
    const query = searchParams?.query || "";
    const status = searchParams?.status || "ALL";
    const currentPage = Number(searchParams?.page) || 1;
    const limit = 10;

    // Fetch data in parallel
    const [clientsData, stats] = await Promise.all([
        listClients({ query, status, page: currentPage, limit }),
        getClientStats(),
    ]);

    const totalPages = clientsData.metadata?.totalPages || 1;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                <div className="flex items-center space-x-2">
                    <ExportButton />
                    <Button asChild>
                        <Link href="/clients/new">
                            <Plus className="mr-2 h-4 w-4" /> Novo Cliente
                        </Link>
                    </Button>
                </div>
            </div>

            <Suspense fallback={<div>Carregando estatísticas...</div>}>
                <ClientStats
                    totalClients={stats.total}
                    activeClients={stats.active}
                    newClientsThisMonth={stats.newThisMonth}
                />
            </Suspense>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <ClientFilters />
                </div>

                <Suspense fallback={<div>Carregando lista...</div>}>
                    {/* 
                       Note: passing stringified date or mapped object might be needed 
                       if ClientData type expects generic object. 
                       Prisma returns Date objects, which valid for ClientData.createdAt: Date
                     */}
                    <ClientsTable
                        data={(clientsData.data as any[]) || []}
                        pageCount={totalPages}
                        pagination={{ pageIndex: currentPage, pageSize: limit }}
                    />
                </Suspense>

                {/* Pagination Controls Placeholder - Ideally part of Table or separate component */}
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button variant="outline" size="sm" disabled={currentPage <= 1} asChild>
                        <Link href={`/clients?page=${currentPage - 1}&query=${query}&status=${status}`}>
                            Anterior
                        </Link>
                    </Button>
                    <div className="text-sm font-medium">
                        Página {currentPage} de {totalPages}
                    </div>
                    <Button variant="outline" size="sm" disabled={currentPage >= totalPages} asChild>
                        <Link href={`/clients?page=${currentPage + 1}&query=${query}&status=${status}`}>
                            Próxima
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
