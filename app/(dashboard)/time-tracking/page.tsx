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

    // Parallel data fetching
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
        prisma.project.findMany({ select: { id: true, name: true } }),
        // 2. Recent Logs with Filters from URL
        listTimeLogs(1, 50, {
            projectId: params?.projectId,
            startDate: params?.startDate,
            endDate: params?.endDate
        }),
        // 3. Metrics
        getTimeLogMetrics(),
        // 4. Distribution
        getTimeDistributionByCategory(),
        // 5. Trends
        getDailyProductivity(),
        // 6. Top Projects
        getTopProjects(),
        // 7. Client Breakdown
        getTimeBreakdownByClient()
    ]);

    const projects = projectsData;
    const logs = (recentLogsData.success && recentLogsData.data?.logs) ? recentLogsData.data.logs : [];

    // Safe unwrap for reports
    const metrics = metricsData.success && metricsData.data ? metricsData.data : { totalHours: 0, billableHours: 0, estimatedValue: 0 };
    const distribution = distributionData.success && distributionData.data ? distributionData.data : [];
    const trends = trendsData.success && trendsData.data ? trendsData.data : [];
    const topProjects = topProjectsData.success && topProjectsData.data ? topProjectsData.data : [];
    const clientBreakdown = clientData.success && clientData.data ? clientData.data : [];

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
