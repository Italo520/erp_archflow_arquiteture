"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { ActivityType } from "@prisma/client";
import { createActivity } from "@/app/actions/activity";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Simplified schema for quick add
const quickActivitySchema = z.object({
    title: z.string().min(2, "O título é obrigatório"),
    type: z.nativeEnum(ActivityType),
    startTime: z.string(), // HTML Time input returns string HH:MM
    duration: z.coerce.number().min(15).default(60),
});

interface QuickActivityModalProps {
    dateStr: string; // Pre-selected date from calendar (YYYY-MM-DD)
    trigger?: React.ReactNode;
}

export function QuickActivityModal({ dateStr, trigger }: QuickActivityModalProps) {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Parse the date locally in the client's timezone to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const form = useForm<any>({
        resolver: zodResolver(quickActivitySchema) as any,
        defaultValues: {
            title: "",
            type: "MEETING",
            startTime: "09:00",
            duration: 60,
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: any) {
        // Construct full Date objects
        const startDateTime = new Date(date);
        const [hours, minutes] = values.startTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes));

        const endDateTime = new Date(startDateTime.getTime() + values.duration * 60000);

        const payload = {
            title: values.title,
            type: values.type,
            startTime: startDateTime,
            endTime: endDateTime,
            duration: values.duration,
            status: "SCHEDULED" as const, // Default
        };

        try {
            const result = await createActivity(payload);
            if (result.success) {
                toast.success("Atividade agendada com sucesso");
                setOpen(false);
                form.reset();
                router.refresh();
            } else {
                if (typeof result.error === 'string') {
                    toast.error(result.error);
                } else {
                    toast.error("Falha na validação");
                }
            }
        } catch (error) {
            toast.error("Falha ao criar atividade");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Adição Rápida
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Atividade Rápida</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Reunião com o cliente..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MEETING">Reunião</SelectItem>
                                                <SelectItem value="CALL">Ligação</SelectItem>
                                                <SelectItem value="SITE_VISIT">Visita Técnica</SelectItem>
                                                <SelectItem value="DESIGN">Bloco de Design</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem className="w-[100px]">
                                        <FormLabel>Horário</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração (min)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="15" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Agendar
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
