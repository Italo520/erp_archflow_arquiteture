import { listActivities } from "@/app/actions/activity";
import { ActivityCalendar } from "@/components/activities/ActivityCalendar";
import { ActivityList } from "@/components/activities/ActivityList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link"; // Or use a Modal trigger directly
import { QuickActivityModal } from "@/components/activities/QuickActivityModal";
import { ActivityType, Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth, format } from "date-fns";

// Ensure type compatibility with what listActivities returns and what components expect
// Ideally this type comes from shared/types folder
type ActivityWithRelations = Prisma.ActivityGetPayload<{
    include: {
        client: { select: { id: true, name: true } };
        project: { select: { id: true, name: true } };
        createdBy: { select: { fullName: true } };
    }
}>;

interface PageProps {
    searchParams: Promise<{
        date?: string;
    }>;
}

export default async function ActivitiesPage({ searchParams }: PageProps) {
    const params = await searchParams;
    // 1. Resolve selected date (URL or Today)
    const selectedDateStr = params.date || format(new Date(), "yyyy-MM-dd");
    const [year, month, day] = selectedDateStr.split("-").map(Number);
    const selectedDate = new Date(year, month - 1, day);

    // 2. Determine date range for fetching (Month window for dots, specific date for list? 
    // Optimization: Fetch entire month to show dots on calendar, filtering list client-side or separate request.
    // Let's fetch the whole month of the selected date to populate calendar dots.

    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    // Note: listActivities action currently filters by exact date in 'date' param using strict equals? 
    // I updated listActivities in Task 4.1 to do "gte date, lt nextDate" if date provided.
    // To get the WHOLE MONTH, we need to pass a range or modify listActivities.
    // For now, let's just fetch everything for the current month by not passing 'date' filter to listActivities, 
    // but we might need to update the action to support startDate/endDate range for efficiency.
    // Let's assume listActivities can check for month if we pass custom logic, or we just fetch limit=100 for now.
    // ACTUALLY: The safest bet without changing backend again is to filter in memory if volume is low, 
    // OR update backend to support range.
    // Let's modify the page to just Request the day's activities for the LIST, and maybe a separate lightweight query for "days with activities" in the future.
    // FOR MVP: Fetch 100 recent activities to populate the calendar roughly.

    const response = await listActivities({}, 1, 200); // Fetching more to fill calendar
    const activities = (response.success && response.data) ? (response.data as ActivityWithRelations[]) : [];

    return (
        <div className="flex flex-col h-full space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Atividades</h2>
                <div className="flex items-center space-x-2">
                    <QuickActivityModal dateStr={selectedDateStr} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[calc(100vh-140px)]">
                {/* Calendar Section - Span 8 columns */}
                <div className="md:col-span-8 h-full">
                    <ActivityCalendar
                        activities={activities}
                        selectedDateStr={selectedDateStr}
                    />
                </div>

                {/* List Section - Span 4 columns */}
                <div className="md:col-span-4 h-full overflow-hidden">
                    <ActivityList
                        dateStr={selectedDateStr}
                        activities={activities}
                    />
                </div>
            </div>
        </div>
    );
}
