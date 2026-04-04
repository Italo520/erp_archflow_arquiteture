import ExcelJS from 'exceljs';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface ExcelSheetData {
    name: string;
    headers: string[];
    rows: (string | number | Date | null)[][];
}

export interface ExcelReportData {
    filename: string;
    sheets: ExcelSheetData[];
    metadata?: {
        title?: string;
        author?: string;
        createdAt?: Date;
    };
}

/**
 * Generate an Excel workbook with multiple sheets
 */
export async function generateReportExcel(data: ExcelReportData): Promise<Blob> {
    const workbook = new ExcelJS.Workbook();

    // Set workbook properties
    workbook.creator = data.metadata?.author || 'ArchFlow ERP';
    workbook.lastModifiedBy = data.metadata?.author || 'ArchFlow ERP';
    workbook.created = data.metadata?.createdAt || new Date();
    workbook.modified = data.metadata?.createdAt || new Date();
    workbook.title = data.metadata?.title || 'Relatório ArchFlow';

    // Create sheets
    for (const sheetData of data.sheets) {
        const worksheet = workbook.addWorksheet(sheetData.name.substring(0, 31)); // Excel sheet name limit

        // Add headers
        worksheet.addRow(sheetData.headers);

        // Style headers
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };

        // Calculate max widths for columns
        const colWidths = sheetData.headers.map((header, index) => {
            let maxContentLength = header.length;
            for (const row of sheetData.rows) {
                const cellValue = row[index];
                if (cellValue !== null && cellValue !== undefined) {
                    let cellLength = 0;
                    if (cellValue instanceof Date) {
                        cellLength = 10; // approximate date length
                    } else {
                        cellLength = String(cellValue).length;
                    }
                    if (cellLength > maxContentLength) {
                        maxContentLength = cellLength;
                    }
                }
            }
            return Math.min(Math.max(maxContentLength + 2, 10), 50);
        });

        worksheet.columns = colWidths.map(width => ({ width }));

        // Add rows
        for (const row of sheetData.rows) {
            worksheet.addRow(row);
        }
    }

    // Generate binary
    const buffer = await workbook.xlsx.writeBuffer();

    return new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
}

/**
 * Generate Business Report Excel
 */
export async function generateBusinessReportExcel(data: {
    totalRevenue: number;
    profitMargin: number;
    newClients: number;
    monthlyPerformance: { month: string; revenue: number; expenses: number; profit: number }[];
    period: string;
}): Promise<Blob> {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    return generateReportExcel({
        filename: `relatorio-negocio-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
        metadata: {
            title: 'Relatório de Negócio',
            author: 'ArchFlow ERP',
            createdAt: new Date(),
        },
        sheets: [
            {
                name: 'Resumo',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Período', data.period],
                    ['Receita Total', formatCurrency(data.totalRevenue)],
                    ['Margem de Lucro', `${data.profitMargin.toFixed(1)}%`],
                    ['Novos Clientes', data.newClients],
                    ['Data de Geração', format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })],
                ],
            },
            {
                name: 'Desempenho Mensal',
                headers: ['Mês', 'Receita', 'Despesas', 'Lucro', 'Margem (%)'],
                rows: data.monthlyPerformance.map((row) => [
                    row.month,
                    row.revenue,
                    row.expenses,
                    row.profit,
                    row.revenue > 0 ? Number(((row.profit / row.revenue) * 100).toFixed(1)) : 0,
                ]),
            },
        ],
    });
}

/**
 * Generate Productivity Report Excel
 */
export async function generateProductivityReportExcel(data: {
    totalHours: number;
    billableHours: number;
    nonBillableHours: number;
    averageUtilization: number;
    userRanking: { name: string; totalHours: number; billableHours: number; utilization: number }[];
    period: string;
}): Promise<Blob> {
    return generateReportExcel({
        filename: `relatorio-produtividade-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
        metadata: {
            title: 'Relatório de Produtividade',
            author: 'ArchFlow ERP',
            createdAt: new Date(),
        },
        sheets: [
            {
                name: 'Resumo',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Período', data.period],
                    ['Total de Horas', `${data.totalHours.toFixed(1)}h`],
                    ['Horas Faturáveis', `${data.billableHours.toFixed(1)}h`],
                    ['Horas Não Faturáveis', `${data.nonBillableHours.toFixed(1)}h`],
                    ['Taxa de Utilização Média', `${data.averageUtilization.toFixed(1)}%`],
                    ['Data de Geração', format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })],
                ],
            },
            {
                name: 'Ranking Produtividade',
                headers: ['Posição', 'Usuário', 'Horas Totais', 'Horas Faturáveis', 'Utilização (%)'],
                rows: data.userRanking.map((user, index) => [
                    index + 1,
                    user.name,
                    Number(user.totalHours.toFixed(1)),
                    Number(user.billableHours.toFixed(1)),
                    Number(user.utilization.toFixed(1)),
                ]),
            },
        ],
    });
}

/**
 * Generate Financial Report Excel (placeholder for future implementation)
 */
export async function generateFinancialReportExcel(data: {
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
}): Promise<Blob> {
    return generateReportExcel({
        filename: `relatorio-financeiro-${format(new Date(), 'yyyy-MM-dd')}.xlsx`,
        metadata: {
            title: 'Relatório Financeiro',
            author: 'ArchFlow ERP',
            createdAt: new Date(),
        },
        sheets: [
            {
                name: 'Resumo Financeiro',
                headers: ['Métrica', 'Valor'],
                rows: [
                    ['Período', data.period],
                    ['Receita', data.revenue],
                    ['Despesas', data.expenses],
                    ['Lucro Líquido', data.profit],
                ],
            },
        ],
    });
}
