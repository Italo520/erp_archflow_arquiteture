"use client";

import React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"; // Need to ensure this exists or create it
import { Button } from "@/components/ui/button";
import { ClientAvatar } from "./ClientAvatar";
import { MoreHorizontal, Eye, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Need to ensure or create
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

// Define the shape of our data
export type ClientData = {
    id: string;
    name: string;
    email: string;
    status: string;
    phone?: string | null;
    avatar?: string | null;
    _count?: {
        projects: number;
    };
    createdAt: Date;
};

interface ClientsTableProps {
    data: ClientData[];
    pageCount: number;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
    // onPaginationChange is handled via URL in parent, so we just use Links/Router or passing page via parent
}

export function ClientsTable({ data }: ClientsTableProps) { // Simplified props for now
    const columns: ColumnDef<ClientData>[] = [
        {
            accessorKey: "name",
            header: "Cliente",
            cell: ({ row }) => {
                const client = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <ClientAvatar name={client.name} avatarUrl={client.avatar} />
                        <div className="flex flex-col">
                            <span className="font-medium">{client.name}</span>
                            <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let variant: "default" | "secondary" | "destructive" | "outline" = "default";
                if (status === "ACTIVE") variant = "default"; // Greenish usually but default is primary
                else if (status === "PROSPECT") variant = "secondary";
                else if (status === "INACTIVE") variant = "outline";
                else if (status === "BLOCKED") variant = "destructive";

                return <Badge variant={variant}>{status}</Badge>;
            }
        },
        {
            accessorKey: "projects",
            header: "Projetos",
            cell: ({ row }) => {
                return <span className="text-center block w-full">{row.original._count?.projects || 0}</span>;
            },
        },
        {
            accessorKey: "createdAt",
            header: "Cadastro",
            cell: ({ row }) => {
                return new Date(row.original.createdAt).toLocaleDateString("pt-BR");
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const client = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                                <Link href={`/clients/${client.id}`} className="flex items-center cursor-pointer">
                                    <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href={`/clients/${client.id}/edit`} className="flex items-center cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> Editar
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
    });

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                Nenhum cliente encontrado.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
