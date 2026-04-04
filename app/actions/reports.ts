'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';
import { generateBusinessReportPDF, generateProductivityReportPDF } from '@/lib/export-pdf';
import { generateBusinessReportExcel, generateProductivityReportExcel } from '@/lib/export-excel';
import { startOfMonth, endOfMonth, subMonths, format, startOfWeek, endOfWeek, startOfQuarter, endOfQuarter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type ReportType = 'business' | 'productivity' | 'financial';
export type ExportFormat = 'pdf' | 'excel';

interface ReportFilters {
    period: 'today' | 'week' | 'month' | 'quarter' | 'custom';
    from?: string;
    to?: string;
    projectIds?: string[];
}

function getPeriodDates(filters: ReportFilters): { start: Date; end: Date } {
    const now = new Date();

    if (filters.period === 'custom' && filters.from && filters.to) {
        return { start: new Date(filters.from), end: new Date(filters.to) };
    }

    switch (filters.period) {
        case 'today':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endToday = new Date();
            endToday.setHours(23, 59, 59, 999);
            return { start: today, end: endToday };
        case 'week':
            return { start: startOfWeek(now), end: endOfWeek(now) };
        case 'quarter':
            return { start: startOfQuarter(now), end: endOfQuarter(now) };
        case 'month':
        default:
            return { start: startOfMonth(now), end: endOfMonth(now) };
    }
}

async function fetchReportData(filters: ReportFilters, type: ReportType) {
    const { start, end } = getPeriodDates(filters);
    const prevStart = subMonths(start, 1);
    const prevEnd = subMonths(end, 1);

    const projectFilter = filters.projectIds?.length
        ? { projectId: { in: filters.projectIds } }
        : {};

    const [currentTimeLogs, previousTimeLogs, newClients, previousNewClients] = await Promise.all([
        prisma.timeLog.findMany({
            where: { date: { gte: start, lte: end }, ...projectFilter },
            include: { user: { select: { id: true, fullName: true } } },
        }),
        prisma.timeLog.findMany({
            where: { date: { gte: prevStart, lte: prevEnd }, ...projectFilter },
        }),
        prisma.client.count({ where: { createdAt: { gte: start, lte: end } } }),
        prisma.client.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),
    ]);

    const periodLabel = `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;

    // Calculate common metrics
    const totalHours = currentTimeLogs.reduce((sum, log) => sum + log.duration, 0);
    const billableHours = currentTimeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.duration, 0);
    const nonBillableHours = totalHours - billableHours;

    const currentRevenue = currentTimeLogs
        .filter((log) => log.billable)
        .reduce((sum, log) => sum + log.duration * Number(log.billRate || 0), 0);

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

    return {
        period: periodLabel,
        business: {
            totalRevenue: currentRevenue,
            profitMargin: 25, // Placeholder
            newClients,
            monthlyPerformance: [
                {
                    month: format(start, 'MMMM yyyy', { locale: ptBR }),
                    revenue: currentRevenue,
                    expenses: currentRevenue * 0.6,
                    profit: currentRevenue * 0.4,
                },
            ],
        },
        productivity: {
            totalHours,
            billableHours,
            nonBillableHours,
            averageUtilization,
            userRanking,
        },
    };
}

/**
 * Download report as PDF or Excel
 * Returns base64 encoded data for client-side download
 */
export async function downloadReport(
    filters: ReportFilters,
    type: ReportType,
    format: ExportFormat
): Promise<{ success: boolean; data?: string; filename?: string; error?: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Não autorizado' };
        }

        const reportData = await fetchReportData(filters, type);
        let blob: Blob;
        let filename: string;

        if (format === 'pdf') {
            if (type === 'business') {
                blob = await generateBusinessReportPDF({
                    ...reportData.business,
                    period: reportData.period,
                });
                filename = `relatorio-negocio-${Date.now()}.pdf`;
            } else if (type === 'productivity') {
                blob = await generateProductivityReportPDF({
                    ...reportData.productivity,
                    period: reportData.period,
                });
                filename = `relatorio-produtividade-${Date.now()}.pdf`;
            } else {
                return { success: false, error: 'Tipo de relatório não suportado para PDF' };
            }
        } else {
            if (type === 'business') {
                blob = await generateBusinessReportExcel({
                    ...reportData.business,
                    period: reportData.period,
                });
                filename = `relatorio-negocio-${Date.now()}.xlsx`;
            } else if (type === 'productivity') {
                blob = await generateProductivityReportExcel({
                    ...reportData.productivity,
                    period: reportData.period,
                });
                filename = `relatorio-produtividade-${Date.now()}.xlsx`;
            } else {
                return { success: false, error: 'Tipo de relatório não suportado para Excel' };
            }
        }

        // Convert blob to base64 for transmission
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        return { success: true, data: base64, filename };
    } catch (error) {
        console.error('Error generating report:', error);
        return { success: false, error: 'Erro ao gerar relatório' };
    }
}

/**
 * Email report to user
 * Generates PDF and sends via email (placeholder - requires email service setup)
 */
export async function emailReport(
    filters: ReportFilters,
    type: ReportType
): Promise<{ success: boolean; error?: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Não autorizado' };
        }

        // Generate PDF
        const reportData = await fetchReportData(filters, type);
        let blob: Blob;

        if (type === 'business') {
            blob = await generateBusinessReportPDF({
                ...reportData.business,
                period: reportData.period,
            });
        } else if (type === 'productivity') {
            blob = await generateProductivityReportPDF({
                ...reportData.productivity,
                period: reportData.period,
            });
        } else {
            return { success: false, error: 'Tipo de relatório não suportado' };
        }

        // TODO: Implement email sending with Resend
        // const arrayBuffer = await blob.arrayBuffer();
        // const buffer = Buffer.from(arrayBuffer);
        // 
        // await resend.emails.send({
        //   from: 'ArchFlow <reports@archflow.com>',
        //   to: user.email,
        //   subject: `Relatório de ${type === 'business' ? 'Negócio' : 'Produtividade'} - ArchFlow`,
        //   html: `<p>Segue em anexo o relatório solicitado.</p>`,
        //   attachments: [
        //     {
        //       filename: `relatorio-${type}-${Date.now()}.pdf`,
        //       content: buffer,
        //     },
        //   ],
        // });

        console.log('Email would be sent to:', user.email);

        return { success: true };
    } catch (error) {
        console.error('Error sending report email:', error);
        return { success: false, error: 'Erro ao enviar email' };
    }
}

/**
 * Get report preview data without generating file
 */
export async function getReportPreview(
    filters: ReportFilters,
    type: ReportType
): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Não autorizado' };
        }

        const reportData = await fetchReportData(filters, type);

        if (type === 'business') {
            return { success: true, data: { ...reportData.business, period: reportData.period } };
        } else if (type === 'productivity') {
            return { success: true, data: { ...reportData.productivity, period: reportData.period } };
        }

        return { success: false, error: 'Tipo de relatório não suportado' };
    } catch (error) {
        console.error('Error fetching report preview:', error);
        return { success: false, error: 'Erro ao carregar preview' };
    }
}
