import { Activity } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { ActivityIcon } from "./ActivityIcon";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Extended type to include relations likely present
export interface ActivityWithRelations extends Activity {
    project?: { name: string } | null;
    client?: { name: string } | null;
}

interface ActivityCardProps {
    activity: ActivityWithRelations;
    className?: string;
    onClick?: () => void;
}

export function ActivityCard({ activity, className, onClick }: ActivityCardProps) {
    return (
        <Card
            className={cn(
                "hover:bg-accent/50 transition-colors cursor-pointer border-l-4",
                "border-l-transparent", // Default border
                activity.type === 'MEETING' && "border-l-primary",
                activity.type === 'SITE_VISIT' && "border-l-success",
                activity.type === 'DESIGN' && "border-l-primary",
                // Add more specific left borders if desired, or rely on Icon color
                className
            )}
            onClick={onClick}
        >
            <CardContent className="p-4 flex items-center gap-4">
                {/* Time Column */}
                <div className="flex flex-col items-center min-w-[60px] text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                        {format(new Date(activity.startTime), "HH:mm")}
                    </span>
                    {activity.endTime && (
                        <span className="text-xs">
                            {format(new Date(activity.endTime), "HH:mm")}
                        </span>
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="h-8 w-[1px] bg-border" />

                {/* Icon */}
                <div className="flex-shrink-0">
                    <ActivityIcon type={activity.type} className="h-5 w-5" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate leading-none mb-1">
                        {activity.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        {activity.project && (
                            <span className="font-medium text-primary/80">
                                {activity.project.name}
                            </span>
                        )}
                        {activity.project && activity.client && <span>•</span>}
                        {activity.client && (
                            <span>{activity.client.name}</span>
                        )}
                        {!activity.project && !activity.client && (
                            <span>{activity.description || "Sem descrição"}</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
