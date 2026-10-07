"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ActivityForm } from "@/components/activities/ActivityForm";
import { Plus } from "lucide-react";

export function NewActivityButton({ project }: { project: any }) {
    const [open, setOpen] = useState(false);

    const initialData = {
        projectId: project.id,
        clientId: project.clientId || undefined,
        startTime: new Date(),
        endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
        type: "MEETING",
        title: "",
        status: "SCHEDULED"
    };

    const projectsList = [{ id: project.id, name: project.name }];
    const clientsList = project.client ? [{ id: project.client.id, name: project.client.name }] : [];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bold shadow-lg shadow-primary/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Atividade
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Criar Atividade no Projeto</DialogTitle>
                </DialogHeader>
                <ActivityForm
                    initialData={initialData}
                    projects={projectsList}
                    clients={clientsList}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
