import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { ProjectFilter } from "@/components/dashboard/ProjectFilter";
import { BusinessReport } from "@/components/reports/BusinessReport";
import { ProductivityReport } from "@/components/reports/ProductivityReport";
import { ReportActions } from "@/components/reports/ReportActions";
import { startOfMonth, endOfMonth, subMonths, format, startOfQuarter, endOfQuarter, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportsPageProps {
    searchParams: Promise<{
        period?: string;
        from?: string;
        to?: string;
        projects?: string;
        tab?: string;
    }>;
}

function getPeriodDates(period: string, from?: string, to?: string) {
    const now = new Date();

    if (period === "custom" && from && to) {
        return { start: new Date(from), end: new Date(to) };
    }

    switch (period) {
        case "today":
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endToday = new Date();
            endToday.setHours(23, 59, 59, 999);
            return { start: today, end: endToday };
        case "week":
            return { start: startOfWeek(now), end: endOfWeek(now) };
        case "quarter":
            return { start: startOfQuarter(now), end: endOfQuarter(now) };
        case "month":
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
}

async function getReportData(
    periodDates: { start: Date; end: Date },
    projectIds?: string[]
) {
    const { start, end } = periodDates;
    const prevStart = subMonths(start, 1);
    const prevEnd = subMonths(end, 1);

    const projectFilter = projectIds?.length ? { projectId: { in: projectIds } } : {};

    // Fetch data in parallel
    const [
        currentTimeLogs,
        previousTimeLogs,
        newClients,
        previousNewClients,
        allUsers,
        allProjects,
    ] = await Promise.all([
        prisma.timeLog.findMany({
            where: { date: { gte: start, lte: end }, ...projectFilter },
            include: { user: { select: { id: true, fullName: true } } },
        }),
        prisma.timeLog.findMany({
            where: { date: { gte: prevStart, lte: prevEnd }, ...projectFilter },
        }),
        prisma.client.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.client.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),
        prisma.user.findMany({ select: { id: true, fullName: true } }),
        prisma.project.findMany({ select: { id: true, name: true } }),
    ]);

    // Calculate Business Metrics
    const currentRevenue = currentTimeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.duration * Number(log.billRate || 0), 0);

    const previousRevenue = previousTimeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.duration * Number(log.billRate || 0), 0);

    // Simple profit margin calculation (placeholder - would need expenses data)
    const profitMargin = 25; // Placeholder
    const previousMargin = 22; // Placeholder

    // Productivity Metrics
    const totalHours = currentTimeLogs.reduce((sum, log) => sum + log.duration, 0);
    const billableHours = currentTimeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.duration, 0);
    const nonBillableHours = totalHours - billableHours;

    // User ranking
    const userHoursMap = new Map<string, { total: number; billable: number; name: string }>();

    currentTimeLogs.forEach((log) => {
        const existing = userHoursMap.get(log.userId) || { total: 0, billable: 0, name: log.user.fullName };
        existing.total += log.duration;
        if (log.billable) existing.billable += log.duration;
        existing.name = log.user.fullName;
        userHoursMap.set(log.userId, existing);
    });

    const userRanking = Array.from(userHoursMap.entries())
        .map(([id, data]) => ({
            id,
            name: data.name,
            totalHours: data.total,
            billableHours: data.billable,
            utilization: data.total > 0 ? (data.billable / data.total) * 100 : 0,
        }))
        .sort((a, b) => b.totalHours - a.totalHours);

    const averageUtilization =
        userRanking.length > 0
            ? userRanking.reduce((sum, u) => sum + u.utilization, 0) / userRanking.length
            : 0;

    // Monthly performance (simplified - shows current month data)
    const monthlyPerformance = [
        {
            month: format(start, "MMMM yyyy", { locale: ptBR }),
            revenue: currentRevenue,
            expenses: currentRevenue * 0.6, // Placeholder
            profit: currentRevenue * 0.4, // Placeholder
        },
    ];

    return {
        business: {
            totalRevenue: currentRevenue,
            previousRevenue,
            profitMargin,
            previousMargin,
            newClients,
            previousNewClients,
            monthlyPerformance,
        },
        productivity: {
            userRanking,
            billableVsNon: {
                billable: billableHours,
                nonBillable: nonBillableHours,
            },
            totalHours,
            averageUtilization,
        },
        projects: allProjects,
        users: allUsers.map((u) => ({ id: u.id, name: u.fullName })),
    };
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
    const params = await searchParams;
    const user = await getCurrentUser();
    if (!user) {
        return <div>Acesso negado</div>;
    }

    const period = params.period || "month";
    const periodDates = getPeriodDates(period, params.from, params.to);
    const projectIds = params.projects?.split(",").filter(Boolean);
    const activeTab = params.tab || "business";

    const reportData = await getReportData(periodDates, projectIds);

    const periodLabel = `${format(periodDates.start, "dd/MM/yyyy")} - ${format(periodDates.end, "dd/MM/yyyy")}`;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
                    <p className="text-muted-foreground">
                        Análise detalhada de performance e métricas
                    </p>
                </div>

                <ReportActions
                    reportType={activeTab}
                    period={period}
                    from={params.from}
                    to={params.to}
                    projects={params.projects}
                />
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Filtros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Suspense fallback={<Skeleton className="h-10 w-[160px]" />}>
                            <PeriodSelector />
                        </Suspense>
                        <Suspense fallback={<Skeleton className="h-10 w-[220px]" />}>
                            <ProjectFilter projects={reportData.projects} />
                        </Suspense>
                    </div>
                </CardContent>
            </Card>

            {/* Report Tabs */}
            <Tabs defaultValue={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="business">Negócio</TabsTrigger>
                    <TabsTrigger value="productivity">Produtividade</TabsTrigger>
                    <TabsTrigger value="financial">Financeiro</TabsTrigger>
                </TabsList>

                <TabsContent value="business" className="space-y-4">
                    <BusinessReport data={reportData.business} period={periodLabel} />
                </TabsContent>

                <TabsContent value="productivity" className="space-y-4">
                    <ProductivityReport data={reportData.productivity} period={periodLabel} />
                </TabsContent>

                <TabsContent value="financial" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Relatório Financeiro</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                Em desenvolvimento. Inclirá análise detalhada de receitas, despesas e fluxo de caixa.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
