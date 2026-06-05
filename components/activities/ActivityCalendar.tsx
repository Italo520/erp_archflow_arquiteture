"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Activity } from "@prisma/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"; // Optional for quick peek

interface ActivityCalendarProps {
    activities: Activity[]; // Passing all loaded activities to mark dots
    selectedDateStr: string;
}

export function ActivityCalendar({ activities, selectedDateStr }: ActivityCalendarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Parse the selected date locally in the client's timezone to avoid timezone shifts
    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);

    const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

    // Handlers for navigation
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const handleDateClick = (date: Date) => {
        // Update URL param ?date=YYYY-MM-DD
        const params = new URLSearchParams(searchParams);
        params.set("date", format(date, "yyyy-MM-dd"));
        router.replace(`?${params.toString()}`);
    };

    const handleQuickAdd = (e: React.MouseEvent, date: Date) => {
        e.stopPropagation();
        // Open Quick Add Modal logic here
        // For now we might just emit an event or rely on parent
        console.log("Quick add for", date);
    };

    // Generate calendar grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="font-semibold text-lg capitalize">
                    {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR })}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="px-3" onClick={() => setCurrentMonth(new Date())}>
                        Hoje
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b bg-muted/30">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {day}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 auto-rows-fr h-[400px] sm:h-[500px]">
                {days.map((day) => {
                    const isSelected = isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isCurrentDay = isToday(day);

                    const dayActivities = activities.filter(a => isSameDay(new Date(a.startTime), day));
                    const hasActivities = dayActivities.length > 0;

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => handleDateClick(day)}
                            className={cn(
                                "relative border-r border-b p-2 cursor-pointer transition-colors hover:bg-muted/50 flex flex-col items-center justify-start group",
                                !isCurrentMonth && "text-muted-foreground bg-muted/10",
                                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary z-10"
                            )}
                        >
                            {/* Day Number */}
                            <span className={cn(
                                "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                                isCurrentDay && "bg-primary text-primary-foreground",
                            )}>
                                {format(day, "d")}
                            </span>

                            {/* Activity Indicators */}
                            <div className="flex gap-1 flex-wrap justify-center content-start w-full px-1">
                                {dayActivities.slice(0, 4).map((activity) => (
                                    <div
                                        key={activity.id}
                                        className={cn("w-1.5 h-1.5 rounded-full", getActivityColor(activity.type))} // need helper for dot color
                                    />
                                ))}
                                {dayActivities.length > 4 && (
                                    <span className="text-[10px] text-muted-foreground leading-none">+</span>
                                )}
                            </div>

                            {/* Quick Add Button (Hover) */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => handleQuickAdd(e, day)}
                            >
                                <Plus className="w-3 h-3" />
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Move this to a shared helper later or import
function getActivityColor(type: string) {
    switch (type) {
        case 'MEETING': return 'bg-primary';
        case 'CALL': return 'bg-success';
        case 'SITE_VISIT': return 'bg-destructive';
        case 'DESIGN': return 'bg-primary';
        default: return 'bg-gray-400';
    }
}
