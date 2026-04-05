import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInDays, parseISO } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Project {
    id: string;
    name: string;
    clientName: string;
    deadline: string | Date;
}

interface DeadlineAlertsProps {
    projects: Project[];
}

export function DeadlineAlerts({ projects }: DeadlineAlertsProps) {
    const getDeadlineStatus = (deadline: string | Date) => {
        const today = new Date();
        // Normalize to start of day for accurate day difference
        today.setHours(0, 0, 0, 0);

        let date = typeof deadline === 'string' ? parseISO(deadline) : deadline;
        date.setHours(0, 0, 0, 0);

        const days = differenceInDays(date, today);

        if (days < 0) return { label: "Atrasado", variant: "destructive", color: "bg-red-500", days };
        if (days < 3) return { label: "Crítico", variant: "destructive", color: "bg-red-500", days };
        if (days < 7) return { label: "Atenção", variant: "warning", color: "bg-yellow-500", days };

        return { label: "No prazo", variant: "secondary", color: "bg-gray-500", days };
    };

    return (
        <Card className="col-span-1 h-full">
            <CardHeader>
                <CardTitle>Prazos Próximos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto max-h-[300px]">
                {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum prazo próximo nos próximos dias.</p>
                ) : (
                    projects.map((project) => {
                        const status = getDeadlineStatus(project.deadline);
                        const daysLeft = status.days;

                        // Custom styling for Warning since it's not a default shadcn variant usually
                        // We use 'secondary' as base and override if needed, or 'default' with custom cleanup.
                        // But simpler is to rely on className overrides.

                        let badgeClasses = "";
                        let badgeVariant: "default" | "secondary" | "destructive" | "outline" = "secondary";

                        if (status.variant === 'destructive') {
                            badgeVariant = "destructive";
                        } else if (status.variant === 'warning') {
                            badgeVariant = "secondary";
                            badgeClasses = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80 dark:bg-yellow-900/30 dark:text-yellow-400";
                        } else {
                            badgeVariant = "secondary";
                        }

                        return (
                            <div key={project.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        <Link href={`/projects/${project.id}`} className="hover:underline">
                                            {project.name}
                                        </Link>
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {project.clientName} • {daysLeft >= 0 ?
                                            (daysLeft === 0 ? "Hoje" : (daysLeft === 1 ? "Amanhã" : `${daysLeft} dias`))
                                            : `${Math.abs(daysLeft)} dias atrasado`}
                                    </p>
                                </div>
                                <Badge variant={badgeVariant} className={cn(badgeClasses)}>
                                    {status.label}
                                </Badge>
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    );
}
