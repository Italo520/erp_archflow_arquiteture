"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { softDeleteClient } from "@/app/actions/client";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteClientButtonProps {
    clientId: string;
    clientName: string;
}

export function DeleteClientButton({ clientId, clientName }: DeleteClientButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    async function handleDelete() {
        setIsLoading(true);
        try {
            const result = await softDeleteClient(clientId);
            if (result.ok) {
                setIsOpen(false);
                router.push("/clients");
                router.refresh();
            } else {
                alert("Erro ao excluir cliente: " + (result.message || "Erro desconhecido"));
            }
        } catch (error) {
            console.error("Erro ao deletar cliente:", error);
            alert("Erro ao excluir cliente.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-xl px-4">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl border-gray-200 dark:border-slate-800">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold">Você tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm">
                        Esta ação irá arquivar o cliente <strong className="text-slate-900 dark:text-slate-100">{clientName}</strong>. 
                        Os dados do cliente não serão excluídos permanentemente do banco de dados (Soft Delete), mas ele não aparecerá mais nos painéis ativos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                    <AlertDialogCancel className="rounded-xl" disabled={isLoading}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            handleDelete();
                        }}
                        className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold shadow-lg shadow-destructive/10"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Confirmar Exclusão
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
