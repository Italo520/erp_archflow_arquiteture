import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";
import {
    startOfMonth,
    endOfMonth,
    subMonths,
    format,
    startOfWeek,
    endOfWeek,
    startOfQuarter,
    endOfQuarter,
} from "date-fns";
import { ptBR } from "date-fns/locale";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPeriodDates(
    period: string,
    from?: string | null,
    to?: string | null
) {
    const now = new Date();
    if (period === "custom" && from && to) {
        return { start: new Date(from), end: new Date(to) };
    }
    switch (period) {
        case "today": {
            const s = new Date();
            s.setHours(0, 0, 0, 0);
            const e = new Date();
            e.setHours(23, 59, 59, 999);
            return { start: s, end: e };
        }
        case "week":
            return { start: startOfWeek(now, { locale: ptBR }), end: endOfWeek(now, { locale: ptBR }) };
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
    const projectFilter = projectIds?.length
        ? { projectId: { in: projectIds } }
        : {};

    const [currentTimeLogs, previousTimeLogs, newClients, previousNewClients, allProjects] =
        await Promise.all([
            prisma.timeLog.findMany({
                where: { date: { gte: start, lte: end }, ...projectFilter },
                include: {
                    user: { select: { id: true, fullName: true } },
                    project: { select: { id: true, name: true } },
                },
            }),
            prisma.timeLog.findMany({
                where: { date: { gte: prevStart, lte: prevEnd }, ...projectFilter },
            }),
            prisma.client.count({ where: { createdAt: { gte: start, lte: end } } }),
            prisma.client.count({ where: { createdAt: { gte: prevStart, lte: prevEnd } } }),
            prisma.project.findMany({ select: { id: true, name: true } }),
        ]);

    const currentRevenue = currentTimeLogs
        .filter((l) => l.billable)
        .reduce((s, l) => s + l.duration * Number(l.billRate || 0), 0);

    const previousRevenue = previousTimeLogs
        .filter((l) => l.billable)
        .reduce((s, l) => s + l.duration * Number(l.billRate || 0), 0);

    const totalHours = currentTimeLogs.reduce((s, l) => s + l.duration, 0);
    const billableHours = currentTimeLogs
        .filter((l) => l.billable)
        .reduce((s, l) => s + l.duration, 0);
    const nonBillableHours = totalHours - billableHours;

    // User ranking
    const userMap = new Map<string, { total: number; billable: number; name: string }>();
    currentTimeLogs.forEach((l) => {
        const e = userMap.get(l.userId) || { total: 0, billable: 0, name: l.user.fullName };
        e.total += l.duration;
        if (l.billable) e.billable += l.duration;
        e.name = l.user.fullName;
        userMap.set(l.userId, e);
    });
    const userRanking = Array.from(userMap.entries())
        .map(([id, d]) => ({
            id,
            name: d.name,
            totalHours: d.total,
            billableHours: d.billable,
            utilization: d.total > 0 ? (d.billable / d.total) * 100 : 0,
        }))
        .sort((a, b) => b.totalHours - a.totalHours);

    // Logs detalhados por projeto
    const projectLogsMap = new Map<string, { name: string; hours: number; revenue: number }>();
    currentTimeLogs.forEach((l) => {
        const pName = l.project?.name ?? "Sem Projeto";
        const pId = l.projectId ?? "none";
        const e = projectLogsMap.get(pId) || { name: pName, hours: 0, revenue: 0 };
        e.hours += l.duration;
        if (l.billable) e.revenue += l.duration * Number(l.billRate || 0);
        projectLogsMap.set(pId, e);
    });

    return {
        business: {
            totalRevenue: currentRevenue,
            previousRevenue,
            newClients,
            previousNewClients,
            projectSummary: Array.from(projectLogsMap.values()),
        },
        productivity: {
            userRanking,
            totalHours,
            billableHours,
            nonBillableHours,
        },
        timeLogs: currentTimeLogs,
        period: {
            start,
            end,
            label: `${format(start, "dd/MM/yyyy")} - ${format(end, "dd/MM/yyyy")}`,
        },
    };
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(value);
}

// ── PDF Generation ────────────────────────────────────────────────────────────

async function generatePDF(data: Awaited<ReturnType<typeof getReportData>>, reportType: string) {
    // Dynamic import to avoid SSR issues
    const { jsPDF } = await import("jspdf");
    const { autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const PRIMARY = [59, 130, 246] as [number, number, number]; // blue-500
    const DARK = [15, 23, 42] as [number, number, number];    // slate-900
    const MUTED = [100, 116, 139] as [number, number, number]; // slate-500

    const pageW = doc.internal.pageSize.getWidth();
    const now = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    const reportTitle =
        reportType === "productivity"
            ? "Relatório de Produtividade"
            : reportType === "financial"
                ? "Relatório Financeiro"
                : "Relatório de Negócio";

    // ── Header bar ──
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("ArchFlow ERP", 14, 12);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(reportTitle, 14, 21);

    // right side meta
    doc.setFontSize(8);
    doc.text(`Gerado em: ${now}`, pageW - 14, 12, { align: "right" });
    doc.text(`Período: ${data.period.label}`, pageW - 14, 18, { align: "right" });

    // ── KPI summary ──
    doc.setTextColor(...DARK);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Executivo", 14, 38);

    if (reportType === "business" || reportType === "financial") {
        const kpis = [
            ["Receita Total", formatCurrency(data.business.totalRevenue)],
            ["Receita Anterior", formatCurrency(data.business.previousRevenue)],
            ["Novos Clientes", String(data.business.newClients)],
            ["Horas Faturáveis", `${data.productivity.billableHours.toFixed(1)}h`],
        ];

        let x = 14;
        kpis.forEach(([label, value]) => {
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(x, 42, 42, 20, 2, 2, "F");
            doc.setFontSize(7);
            doc.setTextColor(...MUTED);
            doc.setFont("helvetica", "normal");
            doc.text(label, x + 3, 48);
            doc.setFontSize(11);
            doc.setTextColor(...DARK);
            doc.setFont("helvetica", "bold");
            doc.text(value, x + 3, 56);
            x += 46;
        });

        // Project Summary Table
        autoTable(doc, {
            startY: 68,
            head: [["Projeto", "Horas", "Receita Faturável"]],
            body: data.business.projectSummary.map((p) => [
                p.name,
                `${p.hours.toFixed(1)}h`,
                formatCurrency(p.revenue),
            ]),
            headStyles: {
                fillColor: PRIMARY,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: "bold",
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { cellPadding: 3 },
        });
    }

    if (reportType === "productivity") {
        const kpis = [
            ["Total de Horas", `${data.productivity.totalHours.toFixed(1)}h`],
            ["Horas Faturáveis", `${data.productivity.billableHours.toFixed(1)}h`],
            ["Horas Não-Faturáveis", `${data.productivity.nonBillableHours.toFixed(1)}h`],
            ["Usuários Ativos", String(data.productivity.userRanking.length)],
        ];

        let x = 14;
        kpis.forEach(([label, value]) => {
            doc.setFillColor(248, 250, 252);
            doc.roundedRect(x, 42, 42, 20, 2, 2, "F");
            doc.setFontSize(7);
            doc.setTextColor(...MUTED);
            doc.setFont("helvetica", "normal");
            doc.text(label, x + 3, 48);
            doc.setFontSize(11);
            doc.setTextColor(...DARK);
            doc.setFont("helvetica", "bold");
            doc.text(value, x + 3, 56);
            x += 46;
        });

        // User ranking table
        autoTable(doc, {
            startY: 68,
            head: [["#", "Usuário", "Total de Horas", "Horas Faturáveis", "Utilização"]],
            body: data.productivity.userRanking.map((u, i) => [
                `${i + 1}º`,
                u.name,
                `${u.totalHours.toFixed(1)}h`,
                `${u.billableHours.toFixed(1)}h`,
                `${u.utilization.toFixed(1)}%`,
            ]),
            headStyles: {
                fillColor: PRIMARY,
                textColor: [255, 255, 255],
                fontSize: 9,
                fontStyle: "bold",
            },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { cellPadding: 3 },
        });
    }

    // ── Footer ──
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(...MUTED);
        doc.text(
            `ArchFlow ERP  |  ${reportTitle}  |  Página ${i} de ${totalPages}`,
            pageW / 2,
            doc.internal.pageSize.getHeight() - 6,
            { align: "center" }
        );
    }

    return Buffer.from(doc.output("arraybuffer"));
}

// ── Excel Generation ──────────────────────────────────────────────────────────

async function generateExcel(data: Awaited<ReturnType<typeof getReportData>>, reportType: string) {
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "ArchFlow ERP";
    workbook.created = new Date();

    const PRIMARY_HEX = "3B82F6";
    const HEADER_FONT = { name: "Calibri", bold: true, size: 11, color: { argb: "FFFFFFFF" } };
    const TITLE_FONT = { name: "Calibri", bold: true, size: 14, color: { argb: "FF0F172A" } };

    function autoWidth(sheet: ExcelJS.Worksheet) {
        sheet.columns.forEach((col) => {
            let maxLen = 10;
            col.eachCell?.({ includeEmpty: false }, (cell) => {
                const v = cell.value ? String(cell.value) : "";
                if (v.length > maxLen) maxLen = v.length;
            });
            col.width = Math.min(maxLen + 4, 40);
        });
    }

    // ── Aba: Resumo ──
    const summarySheet = workbook.addWorksheet("Resumo");
    summarySheet.addRow(["ArchFlow ERP – Relatório"]);
    summarySheet.getRow(1).font = TITLE_FONT;
    summarySheet.addRow([`Período: ${data.period.label}`]);
    summarySheet.addRow([`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`]);
    summarySheet.addRow([]);

    if (reportType === "business" || reportType === "financial") {
        summarySheet.addRow(["Métrica", "Valor"]).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
            c.font = HEADER_FONT;
            c.border = {
                bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
            };
        });
        [
            ["Receita Total", formatCurrency(data.business.totalRevenue)],
            ["Receita Período Anterior", formatCurrency(data.business.previousRevenue)],
            ["Novos Clientes", data.business.newClients],
            ["Clientes Período Anterior", data.business.previousNewClients],
            ["Total de Horas", `${data.productivity.totalHours.toFixed(1)}h`],
            ["Horas Faturáveis", `${data.productivity.billableHours.toFixed(1)}h`],
        ].forEach((row) => summarySheet.addRow(row));

        summarySheet.addRow([]);

        // Projeto
        const projectSheet = workbook.addWorksheet("Por Projeto");
        projectSheet.addRow(["Projeto", "Horas", "Receita Faturável"]).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
            c.font = HEADER_FONT;
        });
        data.business.projectSummary.forEach((p) => {
            projectSheet.addRow([p.name, Number(p.hours.toFixed(2)), p.revenue]);
        });
        autoWidth(projectSheet);
    }

    if (reportType === "productivity") {
        summarySheet.addRow(["Métrica", "Valor"]).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
            c.font = HEADER_FONT;
        });
        [
            ["Total de Horas", `${data.productivity.totalHours.toFixed(1)}h`],
            ["Horas Faturáveis", `${data.productivity.billableHours.toFixed(1)}h`],
            ["Horas Não-Faturáveis", `${data.productivity.nonBillableHours.toFixed(1)}h`],
        ].forEach((row) => summarySheet.addRow(row));

        // Ranking de usuários
        const rankSheet = workbook.addWorksheet("Ranking Equipe");
        rankSheet.addRow(["Posição", "Usuário", "Total de Horas", "Horas Faturáveis", "Utilização (%)"]).eachCell(
            (c) => {
                c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
                c.font = HEADER_FONT;
            }
        );
        data.productivity.userRanking.forEach((u, i) => {
            rankSheet.addRow([
                i + 1,
                u.name,
                Number(u.totalHours.toFixed(2)),
                Number(u.billableHours.toFixed(2)),
                Number(u.utilization.toFixed(1)),
            ]);
        });
        autoWidth(rankSheet);
    }

    // Aba: Logs Detalhados
    const logsSheet = workbook.addWorksheet("Logs de Tempo");
    logsSheet
        .addRow(["Data", "Usuário", "Projeto", "Descrição", "Duração (h)", "Faturável", "Taxa (R$)"])
        .eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_HEX } };
            c.font = HEADER_FONT;
        });
    data.timeLogs.forEach((l) => {
        logsSheet.addRow([
            format(new Date(l.date), "dd/MM/yyyy"),
            (l as any).user?.fullName ?? "–",
            (l as any).project?.name ?? "Sem Projeto",
            l.description ?? "–",
            Number(l.duration.toFixed(2)),
            l.billable ? "Sim" : "Não",
            Number(l.billRate ?? 0),
        ]);
    });
    autoWidth(logsSheet);
    autoWidth(summarySheet);

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

// ── CSV Generation ────────────────────────────────────────────────────────────

function generateCSV(data: Awaited<ReturnType<typeof getReportData>>) {
    const rows: string[][] = [
        ["Data", "Usuário", "Projeto", "Descrição", "Duração (h)", "Faturável", "Taxa (R$)"],
    ];
    data.timeLogs.forEach((l) => {
        rows.push([
            format(new Date(l.date), "dd/MM/yyyy"),
            (l as any).user?.fullName ?? "",
            (l as any).project?.name ?? "Sem Projeto",
            l.description ?? "",
            l.duration.toFixed(2),
            l.billable ? "Sim" : "Não",
            String(l.billRate ?? 0),
        ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(";")).join("\r\n");
    // BOM UTF-8 para Excel reconhecer acentos
    return "\uFEFF" + csv;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const exportType = searchParams.get("type") ?? "pdf"; // pdf | excel | csv
        const reportType = searchParams.get("reportType") ?? "business";
        const period = searchParams.get("period") ?? "month";
        const from = searchParams.get("from");
        const to = searchParams.get("to");
        const projectsParam = searchParams.get("projects");
        const projectIds = projectsParam?.split(",").filter(Boolean);

        const periodDates = getPeriodDates(period, from, to);
        const data = await getReportData(periodDates, projectIds);

        const dateStr = format(new Date(), "yyyy-MM-dd");
        const reportLabel =
            reportType === "productivity"
                ? "produtividade"
                : reportType === "financial"
                    ? "financeiro"
                    : "negocios";

        if (exportType === "pdf") {
            const buffer = await generatePDF(data, reportType);
            return new NextResponse(buffer, {
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": `attachment; filename="archflow-${reportLabel}-${dateStr}.pdf"`,
                },
            });
        }

        if (exportType === "excel") {
            const buffer = await generateExcel(data, reportType);
            return new NextResponse(buffer, {
                headers: {
                    "Content-Type":
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "Content-Disposition": `attachment; filename="archflow-${reportLabel}-${dateStr}.xlsx"`,
                },
            });
        }

        if (exportType === "csv") {
            const csv = generateCSV(data);
            return new NextResponse(csv, {
                headers: {
                    "Content-Type": "text/csv; charset=utf-8",
                    "Content-Disposition": `attachment; filename="archflow-${reportLabel}-${dateStr}.csv"`,
                },
            });
        }

        return NextResponse.json({ error: "Tipo inválido. Use: pdf, excel ou csv" }, { status: 400 });
    } catch (err) {
        console.error("[EXPORT_REPORT_ERROR]", err);
        return NextResponse.json({ error: "Erro ao gerar relatório" }, { status: 500 });
    }
}
