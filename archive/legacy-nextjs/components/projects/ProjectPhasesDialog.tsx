"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProjectPhase } from "@/app/actions/project";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

export function ProjectPhasesDialog({
    project,
    phase,
    isOpen,
    onClose
}: {
    project: any,
    phase: any,
    isOpen: boolean,
    onClose: () => void
}) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (phase) {
            setName(phase.name || "");
            setStartDate(phase.startDate ? format(new Date(phase.startDate), "yyyy-MM-dd") : "");
            setEndDate(phase.endDate ? format(new Date(phase.endDate), "yyyy-MM-dd") : "");
        }
    }, [phase]);

    async function handleSave() {
        if (!name.trim()) return;
        setIsLoading(true);
        try {
            const currentPhases = (project.phases as any[]) || [];
            const updatedPhases = currentPhases.map(p => {
                // In this implementation, we match by name as a simple key
                // but ideally phases should have unique IDs.
                if (p.name === phase.name) {
                    return {
                        ...p,
                        name,
                        startDate: startDate ? new Date(startDate) : p.startDate,
                        endDate: endDate ? new Date(endDate) : p.endDate
                    };
                }
                return p;
            });

            await updateProjectPhase(project.id, updatedPhases);
            router.refresh();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Fase: {phase?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nome da Fase</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="startDate">Data de Início</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="endDate">Data de Fim</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={isLoading}>Salvar Alterações</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
