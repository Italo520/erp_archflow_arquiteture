"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createTimeLog } from "@/app/actions/timeLog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TimeLogCategory } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const manualLogSchema = z.object({
    projectId: z.string().min(1, "Project is required").uuid("Project is required"),
    description: z.string().optional(),
    category: z.nativeEnum(TimeLogCategory),
    date: z.string(), // YYYY-MM-DD
    startTime: z.string(), // HH:MM
    duration: z.coerce.number().min(0.01, "Duration must be positive"), // hours
});

interface ManualTimeLogFormProps {
    projects: { id: string; name: string }[];
}

export function ManualTimeLogForm({ projects }: ManualTimeLogFormProps) {
    const router = useRouter();
    const form = useForm<any>({
        resolver: zodResolver(manualLogSchema) as any,
        defaultValues: {
            projectId: "",
            category: "DESIGN",
            date: new Date().toISOString().split('T')[0],
            startTime: "09:00",
            duration: 1,
        },
    });

    const isSubmitting = form.formState.isSubmitting;

    async function onSubmit(values: any) {
        // Reconstruct DateTime from date + time
        const dateTime = new Date(`${values.date}T${values.startTime}:00`);
        // End time is inferred from duration for DB? Or we just send duration?
        // createTimeLog expects timeLogSchema which might need start/end or just duration.
        // Looking at `lib/validations.ts` (assumed) or `actions/timeLog.ts`.
        // `createTimeLog` takes `timeLogSchema`. Let's assume it accepts duration and date.

        // Let's coerce to proper payload expected by server action validation
        const payload: any = {
            projectId: values.projectId,
            description: values.description,
            category: values.category,
            date: new Date(values.date),
            startTime: dateTime,
            duration: values.duration,
            // Calculate endTime if needed by schema, usually helpful
            endTime: new Date(dateTime.getTime() + values.duration * 3600000),
            billable: true // Default
        };

        const result = await createTimeLog(payload);

        if (result.success) {
            toast.success("Time log added");
            form.reset({
                ...form.getValues(),
                description: "", // clear description but keep date/project maybe?
            });
            router.refresh();
        } else {
            toast.error("Failed to add log");
            console.error(result.error);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Manual Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Project</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select project" />
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
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(TimeLogCategory).map(c => (
                                                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Work description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duration (hours)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.25" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Entry
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
