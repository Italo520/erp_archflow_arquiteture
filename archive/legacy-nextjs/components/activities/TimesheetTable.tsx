"use client";

import React from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { TimeLog } from "@prisma/client";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Pencil, Calendar } from "lucide-react";
import { deleteTimeLog } from "@/app/actions/timeLog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Define the shape of logs coming from the parent (which might include relations)
interface ExtendedTimeLog extends TimeLog {
    project: { name: string } | null;
    client: { name: string } | null;
    task?: { title: string } | null; // Assuming relation exists if fetched
}

interface TimesheetTableProps {
    logs: ExtendedTimeLog[];
}

export function TimesheetTable({ logs }: TimesheetTableProps) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Group logs by Date string (YYYY-MM-DD or readable format)
    const groupedLogs: Record<string, ExtendedTimeLog[]> = {};

    logs.forEach(log => {
        // log.date is a Date object or string depending on serialization. 
        // Prisma DateTime objects are often strings in Client Components if not strictly typed or passed via server boundary.
        // But assuming date-fns handles it or we ensure it's Date.
        // Let's safe parse.
        const dateStr = format(new Date(log.date), "yyyy-MM-dd");
        if (!groupedLogs[dateStr]) groupedLogs[dateStr] = [];
        groupedLogs[dateStr].push(log);
    });

    // Calculate day totals
    const dayTotals: Record<string, number> = {};
    Object.keys(groupedLogs).forEach(date => {
        dayTotals[date] = groupedLogs[date].reduce((acc, log) => acc + (log.duration || 0), 0);
    });

    // Total Period
    const totalPeriod = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

    const handleDelete = async () => {
        if (!deleteId) return;
        const result = await deleteTimeLog(deleteId);
        if (result.success) {
            toast.success("Registro de tempo excluído");
            router.refresh();
        } else {
            toast.error("Falha ao excluir o registro de tempo");
        }
        setDeleteId(null);
    }

    // Define columns as per request: Date, Start, End, Duration, Project, Task, Category, Billable, Actions

    return (
        <>
            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {/* Date is grouped, so maybe we don't need a date column for every row, but let's keep it clean */}
                            <TableHead className="w-[100px]">Início</TableHead>
                            <TableHead className="w-[100px]">Fim</TableHead>
                            <TableHead>Projeto / Tarefa</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="w-[100px]">Categoria</TableHead>
                            <TableHead className="text-center w-[80px]">Faturável</TableHead>
                            <TableHead className="text-right w-[100px]">Duração</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.keys(groupedLogs).length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                                    Nenhum registro de tempo encontrado.
                                </TableCell>
                            </TableRow>
                        ) : (
                            // Sort dates descending
                            Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a)).map((date) => (
                                <React.Fragment key={`group-${date}`}>
                                    {/* Date Header Row */}
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableCell colSpan={6} className="font-semibold py-2">
                                            <div className="flex items-center capitalize">
                                                <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                                                {format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold py-2">
                                            {dayTotals[date].toFixed(2)} h
                                        </TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
 
                                    {/* Logs for this date */}
                                    {groupedLogs[date].map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {log.startTime ? format(new Date(log.startTime), "HH:mm") : "-"}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {log.endTime ? format(new Date(log.endTime), "HH:mm") : "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{log.project?.name || "Sem Projeto"}</span>
                                                    {log.taskId && <span className="text-xs text-muted-foreground">Tarefa: {log.taskId} {/* Would resolve relations if present */}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm max-w-[200px] truncate" title={log.description || ""}>
                                                {log.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-normal">
                                                    {log.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {log.billable ? (
                                                    <span className="text-green-600 font-bold text-xs">Sim</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">Não</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-medium">
                                                {log.duration?.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Abrir menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                                        <DropdownMenuItem onClick={() => { /* Edit logic */ toast.info("Edição não implementada ainda") }}>
                                                            <Pencil className="mr-2 h-4 w-4" /> Editar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => setDeleteId(log.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
 
                {/* Footer / Summary */}
                <div className="flex items-center justify-end p-4 border-t gap-4 bg-muted/20 rounded-b-md">
                    <span className="text-sm font-medium text-muted-foreground">Horas no Período:</span>
                    <span className="text-2xl font-bold tabular-nums text-primary">{totalPeriod.toFixed(2)} h</span>
                </div>
            </div>
 
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente este registro de tempo.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            Excluir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
