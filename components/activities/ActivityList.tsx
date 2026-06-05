"use client";

import { ActivityCard } from "./ActivityCard";
import { format, isSameDay } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Activity } from "@prisma/client";

import { ptBR } from "date-fns/locale";

interface ActivityListProps {
    dateStr: string;
    activities: (Activity & {
        client: { id: string; name: string } | null;
        project: { id: string; name: string } | null;
        createdBy: { fullName: string } | null;
    })[];
}

export function ActivityList({ dateStr, activities }: ActivityListProps) {
    // Parse the selected date locally in the client's timezone to avoid timezone shifts
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const formattedDate = format(date, "EEEE, d 'de' MMMM", { locale: ptBR });

    // Filter for the selected date
    const todaysActivities = activities.filter(activity =>
        isSameDay(new Date(activity.startTime), date)
    );

    // Group by Morning (before 12) / Afternoon
    const morningActivities = todaysActivities.filter(a => new Date(a.startTime).getHours() < 12);
    const afternoonActivities = todaysActivities.filter(a => new Date(a.startTime).getHours() >= 12);

    return (
        <div className="flex flex-col h-full border rounded-xl bg-card">
            <div className="p-4 border-b bg-muted/30">
                <h3 className="font-semibold text-lg capitalize">{formattedDate}</h3>
                <p className="text-sm text-muted-foreground">
                    {todaysActivities.length} {todaysActivities.length === 1 ? 'atividade agendada' : 'atividades agendadas'}
                </p>
            </div>

            <ScrollArea className="flex-1 p-4">
                {todaysActivities.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-muted-foreground text-center">
                        <p className="mb-2">Nenhuma atividade para este dia.</p>
                        <p className="text-xs max-w-[200px]">Clique no calendário para adicionar uma nova atividade rapidamente.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {morningActivities.length > 0 && (
                            <section>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-1">Manhã</h4>
                                {morningActivities.map(activity => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </section>
                        )}

                        {afternoonActivities.length > 0 && (
                            <section>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 pl-1">Tarde</h4>
                                {afternoonActivities.map(activity => (
                                    <ActivityCard key={activity.id} activity={activity} />
                                ))}
                            </section>
                        )}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
