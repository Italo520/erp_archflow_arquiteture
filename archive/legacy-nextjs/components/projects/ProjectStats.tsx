"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Clock,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectStatsProps {
    stats: {
        budget: {
            total: number;
            spent: number;
            remaining: number;
            percentage: number;
        };
        tasks: {
            total: number;
            completed: number;
            pending: number;
        };
        time: {
            daysElapsed: number;
            totalDays: number;
            percentage: number;
        };
    };
    className?: string;
}

export function ProjectStats({ stats, className }: ProjectStatsProps) {
    const items = [
        {
            title: "Orçamento",
            value: `R$ ${stats.budget.spent.toLocaleString('pt-BR')}`,
            description: `${stats.budget.percentage}% do planejado`,
            icon: DollarSign,
            color: "text-success",
            bgColor: "bg-success/10",
        },
        {
            title: "Tarefas",
            value: `${stats.tasks.completed}/${stats.tasks.total}`,
            description: `${stats.tasks.pending} pendentes`,
            icon: CheckCircle2,
            color: "text-primary",
            bgColor: "bg-primary/10",
        },
        {
            title: "Cronograma",
            value: `${stats.time.daysElapsed} dias`,
            description: `de ${stats.time.totalDays} totais`,
            icon: Clock,
            color: "text-warning",
            bgColor: "bg-warning/10",
        },
        {
            title: "Eficiência",
            value: `${Math.round((stats.tasks.completed / (stats.tasks.total || 1)) * 100)}%`,
            description: "Taxa de entrega",
            icon: AlertCircle,
            color: "text-muted-foreground",
            bgColor: "bg-secondary",
        },
    ];

    return (
        <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
            {items.map((item, idx) => (
                <Card key={idx} className="border-none shadow-sm bg-background/50 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {item.title}
                        </CardTitle>
                        <div className={cn("p-2 rounded-lg", item.bgColor)}>
                            <item.icon className={cn("h-4 w-4", item.color)} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.value}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {item.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
