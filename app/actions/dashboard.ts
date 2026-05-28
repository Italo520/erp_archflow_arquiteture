'use server';

import { prisma as db } from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays, format } from "date-fns";
import { ActivityType } from "@prisma/client";

export interface DashboardMetrics {
    kpi: {
        activeProjects: number;
        monthlyRevenue: number;
        totalClients: number;
    };
    lists: {
        urgentProjects: {
            id: string;
            name: string;
            clientName: string;
            deadline: Date | null;
        }[];
        todaysAgenda: {
            id: string;
            time: Date;
            title: string;
            type: ActivityType;
            participants: {
                id: string;
                name: string;
                avatarUrl?: string;
            }[];
        }[];
    };
    charts: {
        productivity: {
            date: string;
            hours: number;
        }[];
        projectDistribution: {
            status: string;
            count: number;
        }[];
    };
}

export async function getDashboardMetrics(userId?: string): Promise<DashboardMetrics> {
    // Default empty state
    const defaultMetrics: DashboardMetrics = {
        kpi: { activeProjects: 0, monthlyRevenue: 0, totalClients: 0 },
        lists: { urgentProjects: [], todaysAgenda: [] },
        charts: { productivity: [], projectDistribution: [] },
    };

    try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const todayStart = startOfDay(now);
        const todayEnd = endOfDay(now);
        const sevenDaysAgo = subDays(now, 7);

        // Prepare queries
        // 1. KPI: Active Projects (Status is not COMPLETED or ARQUIVADO)
        // Note: Adjust specific status strings based on your app's convention
        const activeProjectsQuery = db.project.count({
            where: {
                status: {
                    notIn: ['COMPLETED', 'ARCHIVED', 'CANCELLED']
                }
            }
        });

        // 2. KPI: Monthly Revenue (Billable TimeLogs * BillRate)
        const revenueQuery = db.timeLog.findMany({
            where: {
                date: {
                    gte: monthStart,
                    lte: monthEnd
                },
                billable: true
            },
            select: {
                duration: true,
                billRate: true
            }
        });

        // 3. KPI: Total Active Clients
        const totalClientsQuery = db.client.count({
            where: {
                status: {
                    not: 'INACTIVE'
                }
            }
        });

        // 4. List: Urgent Projects (Deadline in future, closest first)
        const urgentProjectsQuery = db.project.findMany({
            where: {
                estimatedEndDate: {
                    gte: now
                },
                status: {
                    notIn: ['COMPLETED', 'ARCHIVED']
                }
            },
            orderBy: {
                estimatedEndDate: 'asc'
            },
            take: 5,
            select: {
                id: true,
                name: true,
                clientName: true,
                estimatedEndDate: true,
                client: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // 5. List: Today's Agenda
        const todayActivitiesQuery = db.activity.findMany({
            where: {
                startTime: {
                    gte: todayStart,
                    lte: todayEnd
                }
            },
            orderBy: {
                startTime: 'asc'
            },
            select: {
                id: true,
                title: true,
                type: true,
                startTime: true,
                participants: true // Returns string[] of IDs
            }
        });

        // 6. Chart: Productivity (Last 7 days)
        const productivityQuery = db.timeLog.groupBy({
            by: ['date'],
            where: {
                date: {
                    gte: sevenDaysAgo
                }
            },
            _sum: {
                duration: true
            }
        });

        // 7. Chart: Project Status Distribution
        const projectDistQuery = db.project.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        // Execute parallel queries
        const [
            activeProjectsCount,
            revenueLogs,
            totalClientsCount,
            urgentProjects,
            todayActivities,
            productivityLogs,
            projectDist
        ] = await Promise.all([
            activeProjectsQuery,
            revenueQuery,
            totalClientsQuery,
            urgentProjectsQuery,
            todayActivitiesQuery,
            productivityQuery,
            projectDistQuery
        ]);

        // Process Revenue
        const monthlyRevenue = revenueLogs.reduce((acc, log) => {
            const rate = log.billRate ? Number(log.billRate) : 0;
            return acc + (log.duration * rate);
        }, 0);

        // Process Today's Agenda (Resolve Participants)
        // Collect all participant IDs
        const allParticipantIds = Array.from(new Set(todayActivities.flatMap(a => a.participants)));

        // Fetch user details for these IDs
        const users = await db.user.findMany({
            where: {
                id: { in: allParticipantIds }
            },
            select: {
                id: true,
                fullName: true
                // avatar not in User model in schema provided, assuming fullName initials logic in frontend
            }
        });

        const userMap = new Map(users.map(u => [u.id, u]));

        const formattedAgenda = todayActivities.map(activity => ({
            id: activity.id,
            time: activity.startTime,
            title: activity.title,
            type: activity.type,
            participants: activity.participants.map(id => {
                const user = userMap.get(id);
                return {
                    id,
                    name: user ? user.fullName : 'Unknown',
                };
            })
        }));

        // Process Productivity Curve (Fill in missing days)
        const productivityMap = new Map();
        productivityLogs.forEach(log => {
            // log.date is DateTime (start of day usually for date type in prisma if mapped correctly, but check schema)
            // schema: date DateTime @db.Date. Prisma Client maps this to Date object.
            const dateKey = format(log.date, 'yyyy-MM-dd');
            productivityMap.set(dateKey, log._sum.duration || 0);
        });

        const formattedProductivity: { date: string; hours: number }[] = [];
        for (let i = 0; i < 7; i++) {
            const d = subDays(new Date(), i); // 0 = today, 1 = yesterday...
            const dateKey = format(d, 'yyyy-MM-dd');
            // We want chronological order usually, so maybe reverse loop or reverse after
            formattedProductivity.push({
                date: dateKey,
                hours: productivityMap.get(dateKey) || 0
            });
        }
        formattedProductivity.reverse(); // Now oldest to newest

        return {
            kpi: {
                activeProjects: activeProjectsCount,
                monthlyRevenue,
                totalClients: totalClientsCount,
            },
            lists: {
                urgentProjects: urgentProjects.map(p => ({
                    id: p.id,
                    name: p.name,
                    clientName: p.client?.name || p.clientName || 'Cliente',
                    deadline: p.estimatedEndDate
                })),
                todaysAgenda: formattedAgenda,
            },
            charts: {
                productivity: formattedProductivity,
                projectDistribution: projectDist.map(p => ({
                    status: p.status,
                    count: p._count.id
                })),
            }
        };

    } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
        return defaultMetrics;
    }
}
