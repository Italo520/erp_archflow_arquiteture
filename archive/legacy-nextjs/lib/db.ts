import { prisma } from "./prisma";
import { ActivityStatus } from "@prisma/client";

export async function getActivityMetricsByUser(userId: string, startDate: Date, endDate: Date) {
    try {
        const metrics = await prisma.activity.groupBy({
            by: ["type"],
            where: {
                createdById: userId,
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: ActivityStatus.COMPLETED,
            },
            _count: {
                id: true,
            },
            _sum: {
                duration: true,
            },
        });

        return { success: true, data: metrics };
    } catch (error) {
        console.error("Error fetching activity metrics:", error);
        return { success: false, error: "Failed to fetch activity metrics" };
    }
}

export async function getProductivityTrends(userId: string, startDate: Date, endDate: Date) {
    try {
        // Group time logs by date to show trends
        const trends = await prisma.timeLog.groupBy({
            by: ["date"],
            where: {
                userId: userId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            _sum: {
                duration: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        return { success: true, data: trends };
    } catch (error) {
        console.error("Error fetching productivity trends:", error);
        return { success: false, error: "Failed to fetch productivity trends" };
    }
}
