import { generateReportPDF } from "@/lib/export-pdf";
import { generateReportExcel } from "@/lib/export-excel";

describe("Document Export Utilities (PDF & Excel)", () => {
    describe("generateReportPDF", () => {
        it("should generate a PDF Blob for business report", async () => {
            const mockData = {
                title: "Relatório de Desempenho Arquitetônico",
                period: "Janeiro 2026",
                generatedAt: new Date(),
                summary: [
                    { label: "Projetos Ativos", value: 12 },
                    { label: "Horas Faturadas", value: "350h" },
                ],
                tables: [
                    {
                        title: "Detalhamento de Projetos",
                        headers: ["Projeto", "Cliente", "Status"],
                        rows: [
                            ["Residência Alpha", "Cliente A", "Em Andamento"],
                            ["Edifício Beta", "Cliente B", "Concluído"],
                        ],
                    },
                ],
            };

            const blob = await generateReportPDF(mockData, "business");
            expect(blob).toBeDefined();
            expect(blob.type).toBe("application/pdf");
            expect(blob.size).toBeGreaterThan(0);
        });

        it("should support financial and productivity themes", async () => {
            const mockData = {
                title: "Relatório Financeiro",
                period: "Q1 2026",
                generatedAt: new Date(),
            };

            const blobFinancial = await generateReportPDF(mockData, "financial");
            const blobProductivity = await generateReportPDF(mockData, "productivity");

            expect(blobFinancial.type).toBe("application/pdf");
            expect(blobProductivity.type).toBe("application/pdf");
        });
    });

    describe("generateReportExcel", () => {
        it("should generate an Excel xlsx Blob with sheets and rows", async () => {
            const excelData = {
                filename: "relatorio_financeiro.xlsx",
                sheets: [
                    {
                        name: "Resumo",
                        headers: ["Métrica", "Valor"],
                        rows: [
                            ["Receita Total", "R$ 150.000,00"],
                            ["Horas Trabalhadas", 280],
                        ],
                    },
                    {
                        name: "Projetos",
                        headers: ["ID", "Nome do Projeto", "Custo Planejado"],
                        rows: [
                            ["P-1", "Residência Villa Lobos", 120000],
                            ["P-2", "Loja Conceito Jardins", 45000],
                        ],
                    },
                ],
            };

            const blob = await generateReportExcel(excelData);
            expect(blob).toBeDefined();
            expect(blob.type).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            expect(blob.size).toBeGreaterThan(0);
        });
    });
});
