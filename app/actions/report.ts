"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { TimeLogCategory } from "@prisma/client";
import { startOfMonth, endOfMonth, subDays, format } from "date-fns";

type ActionResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
};

// 1. KPI Metrics (Total Hours, Billable Hours for Current Month)
export async function getTimeLogMetrics(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    try {
        const aggregation = await prisma.timeLog.aggregate({
            _sum: {
                duration: true,
            },
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
        });

        const billableAggregation = await prisma.timeLog.aggregate({
            _sum: {
                duration: true,
            },
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
                billable: true,
            },
        });

        // Mock Hourly Rate for now, or fetch from user profile if we add it
        const hourlyRate = 100;

        return {
            success: true,
            data: {
                totalHours: aggregation._sum.duration || 0,
                billableHours: billableAggregation._sum.duration || 0,
                estimatedValue: (billableAggregation._sum.duration || 0) * hourlyRate
            }
        };
    } catch (error) {
        console.error("Failed to get metrics:", error);
        return { success: false, error: "Failed to fetch metrics" };
    }
}

// 2. Category Distribution (Pie Chart)
export async function getTimeDistributionByCategory(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    // Default to last 30 days or current month? Let's do current month to match KPIs
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    try {
        const distribution = await prisma.timeLog.groupBy({
            by: ["category"],
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                    lte: endDate,
                }
            },
            _sum: {
                duration: true,
            },
        });

        const formatted = distribution.map(d => ({
            name: d.category,
            value: d._sum.duration || 0
        }));

        return { success: true, data: formatted };
    } catch (error) {
        console.error("Failed to get distribution:", error);
        return { success: false, error: "Failed to fetch distribution" };
    }
}

// 3. Productivity Trends (Bar Chart - Daily)
export async function getDailyProductivity(days: number = 7): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const startDate = subDays(new Date(), days);

    try {
        const trends = await prisma.timeLog.groupBy({
            by: ["date"],
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                }
            },
            _sum: {
                duration: true,
            },
            orderBy: {
                date: "asc",
            }
        });

        // Format for Recharts
        const formatted = trends.map(t => ({
            date: format(new Date(t.date), "MM/dd"),
            hours: t._sum.duration || 0
        }));

        return { success: true, data: formatted };
    } catch (error) {
        console.error("Failed to get trends:", error);
        return { success: false, error: "Failed to fetch trends" };
    }
}

// 4. Top Projects
export async function getTopProjects(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const startDate = startOfMonth(new Date());

    try {
        // Prisma groupBy doesn't support Include, so we need 2 steps or raw query.
        // GroupBy yields Ids.
        const topProjects = await prisma.timeLog.groupBy({
            by: ["projectId"],
            where: {
                userId: session.user.id,
                date: { gte: startDate }
            },
            _sum: {
                duration: true
            },
            orderBy: {
                _sum: { duration: "desc" }
            },
            take: 5
        });

        // Fetch names
        const projectIds = topProjects.map(t => t.projectId);
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true }
        });

        // Merge - Optimized with Map for O(1) lookup
        const projectMap = new Map(projects.map(p => [p.id, p]));
        const result = topProjects.map(t => {
            const proj = t.projectId ? projectMap.get(t.projectId) : undefined;
            return {
                name: proj?.name || "Unknown",
                hours: t._sum.duration || 0
            };
        });

        return { success: true, data: result };

    } catch (error) {
        console.error("Failed to get top projects:", error);
        return { success: false, error: "Failed to fetch top projects" };
    }
}
// 5. Breakdown by Client
export async function getTimeBreakdownByClient(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const startDate = startOfMonth(new Date());

    try {
        // Group by Client
        const grouped = await prisma.timeLog.groupBy({
            by: ["clientId"],
            where: {
                userId: session.user.id,
                date: { gte: startDate }
            },
            _sum: {
                duration: true
            },
            orderBy: { _sum: { duration: "desc" } }
        });

        const clientIds = grouped.map(g => g.clientId).filter(id => id !== null) as string[];
        const clients = await prisma.client.findMany({
            where: { id: { in: clientIds } },
            select: { id: true, name: true }
        });

        const clientMap = new Map(clients.map(c => [c.id, c]));
        const result = grouped.map(g => {
            const client = g.clientId ? clientMap.get(g.clientId) : undefined;
            return {
                name: client?.name || (g.clientId ? "Unknown Client" : "Internal / No Client"),
                hours: g._sum.duration || 0
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to get client breakdown:", error);
        return { success: false, error: "Failed to fetch client breakdown" };
    }
}

// 6. Full Project List for Report
export async function getFullProjectBreakdown(): Promise<ActionResponse> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Unauthorized" };

    const startDate = startOfMonth(new Date());

    try {
        const grouped = await prisma.timeLog.groupBy({
            by: ["projectId"],
            where: {
                userId: session.user.id,
                date: { gte: startDate }
            },
            _sum: {
                duration: true
            },
            orderBy: { _sum: { duration: "desc" } }
        });

        const projectIds = grouped.map(t => t.projectId);
        const projects = await prisma.project.findMany({
            where: { id: { in: projectIds } },
            select: { id: true, name: true }
        });

        const projectMap = new Map(projects.map(p => [p.id, p]));
        const result = grouped.map(t => {
            const proj = t.projectId ? projectMap.get(t.projectId) : undefined;
            return {
                name: proj?.name || "Unknown",
                hours: t._sum.duration || 0
            };
        });

        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to get project breakdown:", error);
        return { success: false, error: "Failed to fetch project breakdown" };
    }
}
