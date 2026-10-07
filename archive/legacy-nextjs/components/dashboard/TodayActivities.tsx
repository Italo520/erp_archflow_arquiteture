import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { isSameHour, parseISO, format, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Clock } from "lucide-react";

interface Participant {
    id: string;
    name: string;
    avatarUrl?: string;
}

interface Activity {
    id: string;
    time: string | Date; // ISO string or Date
    title: string;
    type: string;
    participants: Participant[];
}

const typeTranslation: Record<string, string> = {
    MEETING: "REUNIÃO",
    CALL: "LIGAÇÃO",
    SITE_VISIT: "VISITA TÉCNICA",
    DESIGN: "DESIGN",
};

interface TodayActivitiesProps {
    activities: Activity[];
}

export function TodayActivities({ activities }: TodayActivitiesProps) {
    const currentHour = new Date();

    // Sort activities by time just in case
    const sortedActivities = [...activities].sort((a, b) => {
        const dateA = typeof a.time === 'string' ? parseISO(a.time) : a.time;
        const dateB = typeof b.time === 'string' ? parseISO(b.time) : b.time;
        return dateA.getTime() - dateB.getTime();
    });

    return (
        <Card className="col-span-1 h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Agenda de Hoje
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0">
                <ScrollArea className="h-[350px] pr-4">
                    <div className="space-y-0 pl-2">
                        {sortedActivities.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm">
                                <p>Nenhuma atividade agendada.</p>
                            </div>
                        ) : (
                            sortedActivities.map((activity, index) => {
                                const activityTime = typeof activity.time === 'string' ? parseISO(activity.time) : activity.time;
                                const isCurrent = isSameHour(activityTime, currentHour);
                                const isDone = isPast(activityTime) && !isCurrent;

                                return (
                                    <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 group">
                                        {/* Timeline Line */}
                                        <div className={cn(
                                            "absolute left-0 top-2 h-full w-[2px]",
                                            index === sortedActivities.length - 1 ? "h-0" : "bg-border", // Hide line for last item 
                                            // Special gradient or color if current?
                                        )} />

                                        {/* Timeline Dot */}
                                        <div className={cn(
                                            "absolute left-[-5px] top-[6px] h-3 w-3 rounded-full border-2 transition-all",
                                            isCurrent ? "bg-primary border-primary ring-2 ring-primary/30 scale-110" :
                                                isDone ? "bg-muted border-muted" : "bg-background border-primary"
                                        )} />

                                        <div className={cn(
                                            "flex flex-col gap-1 rounded-lg p-2 -mt-2 transition-colors",
                                            isCurrent ? "bg-accent/50" : "hover:bg-accent/20"
                                        )}>
                                            <div className="flex items-center justify-between">
                                                <span className={cn(
                                                    "text-xs font-semibold",
                                                    isCurrent ? "text-primary" : "text-muted-foreground"
                                                )}>
                                                    {format(activityTime, 'HH:mm')}
                                                </span>
                                                <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-wider bg-muted px-1.5 py-0.5 rounded-sm">
                                                    {typeTranslation[activity.type] || activity.type}
                                                </span>
                                            </div>

                                            <Link href={`/activities?id=${activity.id}`} className="block">
                                                <p className={cn(
                                                    "text-sm font-medium leading-tight",
                                                    isDone && "line-through text-muted-foreground"
                                                )}>
                                                    {activity.title}
                                                </p>
                                            </Link>

                                            {activity.participants.length > 0 && (
                                                <div className="flex -space-x-2 mt-2">
                                                    {activity.participants.slice(0, 4).map((participant) => (
                                                        <Avatar key={participant.id} className="h-6 w-6 border-2 border-background ring-1 ring-border/10">
                                                            {participant.avatarUrl && <AvatarImage src={participant.avatarUrl} alt={participant.name} />}
                                                            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
                                                                {participant.name.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ))}
                                                    {activity.participants.length > 4 && (
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[9px] font-medium text-muted-foreground">
                                                            +{activity.participants.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
