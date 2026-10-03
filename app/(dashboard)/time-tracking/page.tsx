import { listTimeLogs } from "@/app/actions/timeLog";
import {
    getTimeLogMetrics,
    getTimeDistributionByCategory,
    getDailyProductivity,
    getTopProjects,
    getTimeBreakdownByClient
} from "@/app/actions/report";
import { Timer } from "@/components/activities/Timer";
import { ManualTimeLogForm } from "@/components/activities/ManualTimeLogForm";
import { TimesheetTable } from "@/components/activities/TimesheetTable";
import { ActivityDashboard, ActivityDashboardSkeleton } from "@/components/activities/ActivityDashboard";
import { ProductivityReport, ProductivityReportSkeleton } from "@/components/activities/ProductivityReport";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";


interface PageProps {
    searchParams: Promise<{
        projectId?: string;
        startDate?: string;
        endDate?: string;
    }>;
}

export default async function TimeTrackingPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const session = await auth();

    // Parallel data fetching with resilience
    const [
        projectsData,
        recentLogsData,
        metricsData,
        distributionData,
        trendsData,
        topProjectsData,
        clientData
    ] = await Promise.all([
        // 1. Projects
        prisma.project.findMany({ select: { id: true, name: true } }).catch(() => []),
        // 2. Recent Logs with Filters from URL
        listTimeLogs(1, 50, {
            projectId: params?.projectId,
            startDate: params?.startDate,
            endDate: params?.endDate
        }).catch(() => ({ success: false })),
        // 3. Metrics
        getTimeLogMetrics().catch(() => ({ success: false })),
        // 4. Distribution
        getTimeDistributionByCategory().catch(() => ({ success: false })),
        // 5. Trends
        getDailyProductivity().catch(() => ({ success: false })),
        // 6. Top Projects
        getTopProjects().catch(() => ({ success: false })),
        // 7. Client Breakdown
        getTimeBreakdownByClient().catch(() => ({ success: false }))
    ]);

    const projects = JSON.parse(JSON.stringify(projectsData || []));
    const logs = (recentLogsData && 'data' in recentLogsData && recentLogsData.data && typeof recentLogsData.data === 'object' && 'logs' in (recentLogsData.data as any)) 
        ? JSON.parse(JSON.stringify((recentLogsData.data as any).logs)) 
        : [];

    // Safe unwrap for reports
    const metrics = (metricsData && 'data' in metricsData && metricsData.data) ? (metricsData.data as any) : { totalHours: 0, billableHours: 0, estimatedValue: 0 };
    const distribution = (distributionData && 'data' in distributionData && distributionData.data) ? (distributionData.data as any) : [];
    const trends = (trendsData && 'data' in trendsData && trendsData.data) ? (trendsData.data as any) : [];
    const topProjects = (topProjectsData && 'data' in topProjectsData && topProjectsData.data) ? (topProjectsData.data as any) : [];
    const clientBreakdown = (clientData && 'data' in clientData && clientData.data) ? (clientData.data as any) : [];

    return (
        <div className="flex flex-col space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Controle de Horas</h2>
            </div>

            <Tabs defaultValue="tracker" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="tracker">Cronômetro e Planilha</TabsTrigger>
                    <TabsTrigger value="reports">Análise e Relatórios</TabsTrigger>
                </TabsList>

                <TabsContent value="tracker" className="space-y-6">
                    {/* Active Timer Section */}
                    <section>
                        <Timer projects={projects} />
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Timesheet - 2 cols */}
                        <section className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium">Atividade recente</h3>
                                {/* Filter controls could go here */}
                            </div>
                            <TimesheetTable logs={logs} />
                        </section>

                        {/* Sidebar Manual Entry - 1 col */}
                        <section className="lg:col-span-1">
                            <ManualTimeLogForm projects={projects} />
                        </section>
                    </div>
                </TabsContent>

                <TabsContent value="reports" className="space-y-6">
                    <Suspense fallback={
                        <div className="space-y-6">
                            <ActivityDashboardSkeleton />
                            <ProductivityReportSkeleton />
                        </div>
                    }>
                        <ActivityDashboard metrics={metrics} distribution={distribution} />
                        <ProductivityReport
                            trends={trends}
                            topProjects={topProjects}
                            clientBreakdown={clientBreakdown}
                            categoryBreakdown={distribution}
                        />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </div>
    );
}
