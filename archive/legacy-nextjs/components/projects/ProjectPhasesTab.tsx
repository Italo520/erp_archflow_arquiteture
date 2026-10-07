"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addProjectPhase, completeProjectPhase } from "@/app/actions/project";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Clock } from "lucide-react";

import { ProjectPhasesDialog } from "./ProjectPhasesDialog";

export default function ProjectPhasesTab({ project }: { project: any }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingPhase, setEditingPhase] = useState<any>(null);
    const [newPhaseName, setNewPhaseName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const phases = (project.phases as any[]) || [];

    async function handleAddPhase() {
        if (!newPhaseName.trim()) return;
        setIsLoading(true);
        try {
            await addProjectPhase(project.id, {
                name: newPhaseName,
                order: phases.length + 1,
                startDate: new Date()
            });
            setNewPhaseName("");
            setIsAdding(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCompletePhase(phaseName: string) {
        setIsLoading(true);
        try {
            await completeProjectPhase(project.id, phaseName);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Cronograma de Fases</h3>
                <Button onClick={() => setIsAdding(!isAdding)} variant="outline">
                    {isAdding ? "Cancelar" : "Nova Fase"}
                </Button>
            </div>

            <ProjectPhasesDialog
                project={project}
                phase={editingPhase}
                isOpen={!!editingPhase}
                onClose={() => setEditingPhase(null)}
            />

            {isAdding && (
                <Card className="mb-6">
                    <CardContent className="pt-6 flex gap-4">
                        <Input
                            placeholder="Nome da Fase (ex: Estudo Preliminar)"
                            value={newPhaseName}
                            onChange={(e) => setNewPhaseName(e.target.value)}
                        />
                        <Button onClick={handleAddPhase} disabled={isLoading}>Adicionar</Button>
                    </CardContent>
                </Card>
            )}

            <div className="relative border-l-2 border-muted ml-4 space-y-8 pb-4">
                {phases.map((phase: any, index: number) => {
                    const isCompleted = phase.status === "COMPLETED";
                    return (
                        <div key={index} className="relative pl-8">
                            <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 ${isCompleted ? "bg-primary border-primary" : "bg-background border-muted"}`}>
                                {isCompleted && <CheckCircle2 className="h-3 w-3 text-primary-foreground absolute -top-[1px] -left-[1px]" />}
                            </div>
                            <Card className={isCompleted ? "opacity-75" : ""}>
                                <CardHeader className="py-4">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base font-semibold">{phase.name}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded-full ${isCompleted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                                {isCompleted ? "Concluído" : "Em Andamento"}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setEditingPhase(phase)}>
                                                    Editar
                                                </Button>
                                                {!isCompleted && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleCompletePhase(phase.name)} disabled={isLoading}>
                                                        <CheckCircle2 className="h-4 w-4 mr-1" />
                                                        Concluir
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pb-4 text-sm text-muted-foreground">
                                    <div className="flex gap-6">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            Início: {phase.startDate ? new Date(phase.startDate).toLocaleDateString() : "N/A"}
                                        </div>
                                        {phase.endDate && (
                                            <div className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3" />
                                                Fim: {new Date(phase.endDate).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
                {phases.length === 0 && (
                    <div className="pl-8 text-muted-foreground italic">Nenhuma fase registrada.</div>
                )}
            </div>
        </div>
    );
}
