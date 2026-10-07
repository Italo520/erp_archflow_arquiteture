"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { duplicateProject } from "@/app/actions/project";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface DuplicateProjectModalProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function DuplicateProjectModal({ project, isOpen, onClose }: DuplicateProjectModalProps) {
    const [newName, setNewName] = useState(`Cópia de ${project.name}`);
    const [keepPhases, setKeepPhases] = useState(true);
    const [keepTasks, setKeepTasks] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    async function handleDuplicate() {
        if (!newName.trim()) return;
        setIsLoading(true);
        try {
            await duplicateProject(project.id, newName, { keepPhases, keepTasks });
            onClose();
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="">
                    <DialogTitle className="">Duplicar Projeto</DialogTitle>
                    <DialogDescription className="">
                        Crie uma cópia deste projeto. As fases e configurações serão mantidas.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Novo Nome
                        </Label>
                        <Input
                            id="name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="flex flex-col gap-3 ml-24">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="keepPhases"
                                checked={keepPhases}
                                onCheckedChange={(checked) => setKeepPhases(checked === true)}
                            />
                            <Label htmlFor="keepPhases" className="text-sm font-normal">Manter Fases</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="keepTasks"
                                checked={keepTasks}
                                onCheckedChange={(checked) => setKeepTasks(checked === true)}
                            />
                            <Label htmlFor="keepTasks" className="text-sm font-normal">Manter Tarefas</Label>
                        </div>
                    </div>
                </div>
                <DialogFooter className="">
                    <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleDuplicate} disabled={isLoading}>
                        {isLoading ? "Duplicando..." : "Duplicar"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
