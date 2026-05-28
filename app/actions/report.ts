"use server";

import * as reports from "./reports";

export async function getTimeLogMetrics() {
    return reports.getTimeLogMetrics();
}

export async function getTimeDistributionByCategory() {
    return reports.getTimeDistributionByCategory();
}

export async function getDailyProductivity(days: number = 7) {
    return reports.getDailyProductivity(days);
}

export async function getTopProjects() {
    return reports.getTopProjects();
}

export async function getTimeBreakdownByClient() {
    return reports.getTimeBreakdownByClient();
}

export async function getFullProjectBreakdown() {
    return reports.getFullProjectBreakdown();
}
