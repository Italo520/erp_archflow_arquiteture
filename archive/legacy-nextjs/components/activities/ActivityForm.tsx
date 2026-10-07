"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { activityBaseSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { createActivity, updateActivity } from "@/app/actions/activity";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ActivityType } from "@prisma/client";

const activityTypeLabels: Record<string, string> = {
    MEETING: "Reunião",
    CALL: "Ligação",
    SITE_VISIT: "Visita Técnica",
    DESIGN: "Design",
};

// Use base schema (ZodObject) instead of refined schema (ZodEffects) for react-hook-form compatibility
const formSchema = activityBaseSchema;

interface ActivityFormProps {
    initialData?: any; // Replace with proper type from DB
    onSuccess?: () => void;
    projects?: { id: string; name: string }[];
    clients?: { id: string; name: string }[];
}

export function ActivityForm({ initialData, onSuccess, projects = [], clients = [] }: ActivityFormProps) {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(formSchema) as any,
        defaultValues: initialData || {
            type: "MEETING",
            title: "",
            description: "",
            startTime: new Date(),
            endTime: new Date(new Date().setHours(new Date().getHours() + 1)),
            status: "SCHEDULED",
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            let result;
            if (initialData?.id) {
                result = await updateActivity(initialData.id, values as any);
            } else {
                result = await createActivity(values);
            }

            if (result.success) {
                toast.success(initialData ? "Atividade atualizada com sucesso" : "Atividade criada com sucesso");
                router.refresh(); // Refresh server data
                if (onSuccess) onSuccess();
            } else {
                // Handle Zod validation errors returned from server
                if (typeof result.error === 'string') {
                    toast.error(result.error);
                } else {
                    // If field errors, we could map them back to form, simple alert for now
                    toast.error("Falha na validação. Por favor, verifique os campos.");
                    console.error(result.error);
                }
            }
        } catch (error) {
            toast.error("Algo deu errado");
            console.error(error);
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                {/* Type & Title Row */}
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="w-[180px]">
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {Object.values(ActivityType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {activityTypeLabels[type] || type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Título</FormLabel>
                                <FormControl>
                                    <Input placeholder="Título da atividade" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Date & Time Row */}
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="startTime"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Hora de Início</FormLabel>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP HH:mm", { locale: ptBR })
                                                    ) : (
                                                        <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            <div className="p-3 border-t">
                                                <Input
                                                    type="time"
                                                    onChange={(e) => {
                                                        const date = field.value || new Date();
                                                        const [hours, minutes] = e.target.value.split(':');
                                                        date.setHours(parseInt(hours), parseInt(minutes));
                                                        field.onChange(date);
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endTime"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Hora de Término</FormLabel>
                                <div className="flex gap-2">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP HH:mm", { locale: ptBR })
                                                    ) : (
                                                        <span>Escolha uma data</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value || undefined}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                            <div className="p-3 border-t">
                                                <Input
                                                    type="time"
                                                    onChange={(e) => {
                                                        const date = field.value || new Date();
                                                        const [hours, minutes] = e.target.value.split(':');
                                                        date.setHours(parseInt(hours), parseInt(minutes));
                                                        field.onChange(date);
                                                    }}
                                                />
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Project & Client Row */}
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="projectId"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Projeto (Opcional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o projeto" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {projects.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="clientId"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Cliente (Opcional)</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o cliente" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {clients.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Detalhes sobre a atividade..."
                                    className="resize-none"
                                    {...field}
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Footer Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" type="button" onClick={onSuccess}>Cancelar</Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Atualizar Atividade" : "Criar Atividade"}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
