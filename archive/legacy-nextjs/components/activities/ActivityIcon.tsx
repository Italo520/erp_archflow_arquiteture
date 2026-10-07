import { ActivityType } from "@prisma/client";
import {
    Users,
    Phone,
    Mail,
    MapPin,
    PenTool,
    RefreshCw,
    CheckCircle,
    FileText,
    MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityIconProps {
    type: ActivityType;
    className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
    switch (type) {
        case ActivityType.MEETING:
            return <Users className={cn("text-primary", className)} />;
        case ActivityType.CALL:
            return <Phone className={cn("text-indigo-500", className)} />;
        case ActivityType.EMAIL:
            return <Mail className={cn("text-slate-500", className)} />;
        case ActivityType.SITE_VISIT:
            return <MapPin className={cn("text-success", className)} />;
        case ActivityType.DESIGN:
            return <PenTool className={cn("text-primary", className)} />;
        case ActivityType.REVISION:
            return <RefreshCw className={cn("text-warning", className)} />;
        case ActivityType.APPROVAL:
            return <CheckCircle className={cn("text-success", className)} />;
        case ActivityType.ADMIN:
            return <FileText className={cn("text-gray-500", className)} />;
        case ActivityType.OTHER:
        default:
            return <MoreHorizontal className={cn("text-gray-400", className)} />;
    }
}
