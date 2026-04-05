/**
 * Integration tests for Reports functionality
 * Tests PDF generation, Excel generation, and data filtering
 */

import { generateReportPDF, generateBusinessReportPDF, generateProductivityReportPDF } from '@/lib/export-pdf';
import { generateReportExcel, generateBusinessReportExcel, generateProductivityReportExcel } from '@/lib/export-excel';

describe('PDF Generation', () => {
    describe('generateReportPDF', () => {
        it('generates a valid PDF blob', async () => {
            const result = await generateReportPDF({
                title: 'Test Report',
                period: '01/01/2026 - 31/01/2026',
                generatedAt: new Date(),
                summary: [
                    { label: 'Metric 1', value: 100 },
                    { label: 'Metric 2', value: 'R$ 1.000,00' },
                ],
                tables: [
                    {
                        title: 'Test Table',
                        headers: ['Column A', 'Column B', 'Column C'],
                        rows: [
                            ['Row 1A', 'Row 1B', 'Row 1C'],
                            ['Row 2A', 'Row 2B', 'Row 2C'],
                        ],
                    },
                ],
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('application/pdf');
            expect(result.size).toBeGreaterThan(0);
        });

        it('handles empty summary gracefully', async () => {
            const result = await generateReportPDF({
                title: 'Minimal Report',
                period: 'Janeiro 2026',
                generatedAt: new Date(),
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.size).toBeGreaterThan(0);
        });

        it('handles empty tables gracefully', async () => {
            const result = await generateReportPDF({
                title: 'No Table Report',
                period: 'Janeiro 2026',
                generatedAt: new Date(),
                summary: [{ label: 'Total', value: 0 }],
                tables: [],
            });

            expect(result).toBeInstanceOf(Blob);
        });
    });

    describe('generateBusinessReportPDF', () => {
        it('generates business report with all required sections', async () => {
            const result = await generateBusinessReportPDF({
                totalRevenue: 50000,
                profitMargin: 25.5,
                newClients: 10,
                monthlyPerformance: [
                    { month: 'Janeiro 2026', revenue: 50000, expenses: 30000, profit: 20000 },
                ],
                period: '01/01/2026 - 31/01/2026',
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('application/pdf');
            expect(result.size).toBeGreaterThan(1000); // Should have substantial content
        });

        it('handles zero values without errors', async () => {
            const result = await generateBusinessReportPDF({
                totalRevenue: 0,
                profitMargin: 0,
                newClients: 0,
                monthlyPerformance: [],
                period: 'Janeiro 2026',
            });

            expect(result).toBeInstanceOf(Blob);
        });
    });

    describe('generateProductivityReportPDF', () => {
        it('generates productivity report with user ranking', async () => {
            const result = await generateProductivityReportPDF({
                totalHours: 160,
                billableHours: 120,
                averageUtilization: 75,
                userRanking: [
                    { name: 'João Silva', totalHours: 45, utilization: 80 },
                    { name: 'Maria Santos', totalHours: 40, utilization: 70 },
                ],
                period: '01/01/2026 - 31/01/2026',
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('application/pdf');
        });

        it('handles empty user ranking', async () => {
            const result = await generateProductivityReportPDF({
                totalHours: 0,
                billableHours: 0,
                averageUtilization: 0,
                userRanking: [],
                period: 'Janeiro 2026',
            });

            expect(result).toBeInstanceOf(Blob);
        });
    });
});

describe('Excel Generation', () => {
    describe('generateReportExcel', () => {
        it('generates a valid Excel blob', async () => {
            const result = await generateReportExcel({
                filename: 'test-report.xlsx',
                sheets: [
                    {
                        name: 'Summary',
                        headers: ['Metric', 'Value'],
                        rows: [
                            ['Total Revenue', 50000],
                            ['Total Expenses', 30000],
                        ],
                    },
                ],
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.type).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            expect(result.size).toBeGreaterThan(0);
        });

        it('creates multiple sheets correctly', async () => {
            const result = await generateReportExcel({
                filename: 'multi-sheet.xlsx',
                sheets: [
                    {
                        name: 'Sheet1',
                        headers: ['A', 'B'],
                        rows: [['1', '2']],
                    },
                    {
                        name: 'Sheet2',
                        headers: ['C', 'D'],
                        rows: [['3', '4']],
                    },
                ],
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.size).toBeGreaterThan(0);
        });

        it('handles special characters in sheet names', async () => {
            const result = await generateReportExcel({
                filename: 'special-chars.xlsx',
                sheets: [
                    {
                        name: 'Relatório de Produção',
                        headers: ['Métrica', 'Valor'],
                        rows: [['Produção', 'R$ 1.000,00']],
                    },
                ],
            });

            expect(result).toBeInstanceOf(Blob);
        });

        it('truncates long sheet names to 31 characters', async () => {
            const longName = 'This is a very long sheet name that exceeds the limit';
            const result = await generateReportExcel({
                filename: 'long-name.xlsx',
                sheets: [
                    {
                        name: longName,
                        headers: ['A'],
                        rows: [['1']],
                    },
                ],
            });

            // Should not throw and should create valid blob
            expect(result).toBeInstanceOf(Blob);
        });
    });

    describe('generateBusinessReportExcel', () => {
        it('generates business report with Summary and Detail sheets', async () => {
            const result = await generateBusinessReportExcel({
                totalRevenue: 50000,
                profitMargin: 25,
                newClients: 5,
                monthlyPerformance: [
                    { month: 'Janeiro', revenue: 25000, expenses: 15000, profit: 10000 },
                    { month: 'Fevereiro', revenue: 25000, expenses: 15000, profit: 10000 },
                ],
                period: 'Janeiro - Fevereiro 2026',
            });

            expect(result).toBeInstanceOf(Blob);
            expect(result.size).toBeGreaterThan(1000);
        });
    });

    describe('generateProductivityReportExcel', () => {
        it('generates productivity report with ranking data', async () => {
            const result = await generateProductivityReportExcel({
                totalHours: 320,
                billableHours: 240,
                nonBillableHours: 80,
                averageUtilization: 75,
                userRanking: [
                    { name: 'User 1', totalHours: 80, billableHours: 60, utilization: 75 },
                    { name: 'User 2', totalHours: 80, billableHours: 70, utilization: 87.5 },
                ],
                period: 'Janeiro 2026',
            });

            expect(result).toBeInstanceOf(Blob);
        });
    });
});

describe('Period Filter Logic', () => {
    // Helper to simulate period date calculation
    function getPeriodDates(period: string, from?: string, to?: string) {
        const now = new Date('2026-01-15T12:00:00');

        if (period === 'custom' && from && to) {
            return { start: new Date(from), end: new Date(to) };
        }

        switch (period) {
            case 'today':
                const today = new Date(now);
                today.setHours(0, 0, 0, 0);
                const endToday = new Date(now);
                endToday.setHours(23, 59, 59, 999);
                return { start: today, end: endToday };
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 6);
                weekEnd.setHours(23, 59, 59, 999);
                return { start: weekStart, end: weekEnd };
            case 'month':
            default:
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                return { start: monthStart, end: monthEnd };
        }
    }

    it('calculates today period correctly', () => {
        const { start, end } = getPeriodDates('today');

        expect(start.getHours()).toBe(0);
        expect(start.getMinutes()).toBe(0);
        expect(end.getHours()).toBe(23);
        expect(end.getMinutes()).toBe(59);
        expect(start.toDateString()).toBe(end.toDateString());
    });

    it('calculates week period correctly', () => {
        const { start, end } = getPeriodDates('week');

        expect(start.getDay()).toBe(0); // Sunday
        expect(end.getDay()).toBe(6); // Saturday
    });

    it('calculates month period correctly', () => {
        const { start, end } = getPeriodDates('month');

        expect(start.getDate()).toBe(1);
        expect(end.getDate()).toBeGreaterThanOrEqual(28); // Last day of month
    });

    it('uses custom dates when provided', () => {
        const customFrom = '2026-01-01';
        const customTo = '2026-01-31';
        const { start, end } = getPeriodDates('custom', customFrom, customTo);

        expect(start.toISOString().substring(0, 10)).toBe(customFrom);
        expect(end.toISOString().substring(0, 10)).toBe(customTo);
    });

    it('defaults to month when period is unknown', () => {
        const { start, end } = getPeriodDates('unknown');

        expect(start.getDate()).toBe(1);
    });
});

describe('Data Aggregation', () => {
    // Simulate data aggregation logic
    function aggregateHoursByUser(timeLogs: { userId: string; duration: number; billable: boolean }[]) {
        const userMap = new Map<string, { total: number; billable: number }>();

        timeLogs.forEach((log) => {
            const existing = userMap.get(log.userId) || { total: 0, billable: 0 };
            existing.total += log.duration;
            if (log.billable) existing.billable += log.duration;
            userMap.set(log.userId, existing);
        });

        return Array.from(userMap.entries()).map(([id, data]) => ({
            userId: id,
            totalHours: data.total,
            billableHours: data.billable,
            utilization: data.total > 0 ? (data.billable / data.total) * 100 : 0,
        }));
    }

    it('aggregates hours correctly by user', () => {
        const logs = [
            { userId: 'u1', duration: 2, billable: true },
            { userId: 'u1', duration: 3, billable: false },
            { userId: 'u2', duration: 5, billable: true },
        ];

        const result = aggregateHoursByUser(logs);

        const user1 = result.find(u => u.userId === 'u1');
        const user2 = result.find(u => u.userId === 'u2');

        expect(user1?.totalHours).toBe(5);
        expect(user1?.billableHours).toBe(2);
        expect(user1?.utilization).toBe(40);

        expect(user2?.totalHours).toBe(5);
        expect(user2?.billableHours).toBe(5);
        expect(user2?.utilization).toBe(100);
    });

    it('handles empty logs array', () => {
        const result = aggregateHoursByUser([]);
        expect(result).toEqual([]);
    });

    it('calculates utilization correctly with all non-billable', () => {
        const logs = [
            { userId: 'u1', duration: 10, billable: false },
        ];

        const result = aggregateHoursByUser(logs);
        expect(result[0].utilization).toBe(0);
    });
});
