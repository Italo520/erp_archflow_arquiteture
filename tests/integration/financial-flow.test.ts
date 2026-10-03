import { getProjectFinancials, saveBudget, saveEstimate, syncProjectFinancials } from "@/app/actions/finance";
import { prisma } from "@/lib/prisma";
import { BudgetStatus } from "@prisma/client";

jest.mock("@/lib/prisma", () => {
    let mockDB = {
        project: {
            id: "proj-lifecycle-1",
            name: "Centro Cultural e Comercial",
            plannedCost: 100000,
            actualCost: 0,
        },
        budget: null as any,
        estimate: null as any,
        timeLogs: [] as any[],
    };

    return {
        prisma: {
            project: {
                findUnique: jest.fn(async () => mockDB.project),
                update: jest.fn(async ({ data }) => {
                    mockDB.project = { ...mockDB.project, ...data };
                    return mockDB.project;
                }),
            },
            budget: {
                findUnique: jest.fn(async () => mockDB.budget),
                upsert: jest.fn(async ({ create, update }) => {
                    mockDB.budget = mockDB.budget ? { ...mockDB.budget, ...update } : { id: "b-1", ...create };
                    return mockDB.budget;
                }),
                update: jest.fn(async ({ data }) => {
                    mockDB.budget = { ...mockDB.budget, ...data };
                    return mockDB.budget;
                }),
            },
            estimate: {
                findUnique: jest.fn(async () => mockDB.estimate),
                upsert: jest.fn(async ({ create, update }) => {
                    mockDB.estimate = mockDB.estimate ? { ...mockDB.estimate, ...update } : { id: "e-1", ...create };
                    return mockDB.estimate;
                }),
                update: jest.fn(async ({ data }) => {
                    mockDB.estimate = { ...mockDB.estimate, ...data };
                    return mockDB.estimate;
                }),
            },
            timeLog: {
                findMany: jest.fn(async () => mockDB.timeLogs),
                create: jest.fn(async ({ data }) => {
                    const log = { id: `tl-${mockDB.timeLogs.length + 1}`, ...data };
                    mockDB.timeLogs.push(log);
                    return log;
                }),
            },
            $transaction: jest.fn(async (cb) => {
                if (typeof cb === "function") {
                    return await cb({
                        project: {
                            update: jest.fn(async ({ data }: any) => {
                                mockDB.project = { ...mockDB.project, ...data };
                            }),
                        },
                        budget: {
                            update: jest.fn(async ({ data }: any) => {
                                mockDB.budget = { ...mockDB.budget, ...data };
                            }),
                        },
                        estimate: {
                            update: jest.fn(async ({ data }: any) => {
                                mockDB.estimate = { ...mockDB.estimate, ...data };
                            }),
                        },
                    });
                }
                return Promise.all(cb);
            }),
            _resetDB: () => {
                mockDB = {
                    project: {
                        id: "proj-lifecycle-1",
                        name: "Centro Cultural e Comercial",
                        plannedCost: 100000,
                        actualCost: 0,
                    },
                    budget: null,
                    estimate: null,
                    timeLogs: [],
                };
            },
            _setMockLogs: (logs: any[]) => {
                mockDB.timeLogs = logs;
            },
        },
    };
});

jest.mock("@/lib/server-utils", () => ({
    requireProjectAccess: jest.fn().mockResolvedValue({ id: "user-owner", role: "OWNER" }),
}));

jest.mock("@/app/actions/audit", () => ({
    logAudit: jest.fn().mockResolvedValue(true),
}));

describe("Financial Flow End-to-End Integration", () => {
    beforeEach(() => {
        (prisma as any)._resetDB();
        jest.clearAllMocks();
    });

    it("should execute full lifecycle: Estimate -> Budget -> TimeLogs -> Overrun Analysis", async () => {
        const projectId = "proj-lifecycle-1";

        // 1. Salvar Estimativa Inicial
        const estRes = await saveEstimate(projectId, {
            estimatedHours: 200,
            estimatedCost: 40000,
            notes: "Estimativa inicial para fase de concepção e aprovação legal",
        });
        expect(estRes.ok).toBe(true);
        expect(estRes.data.estimatedHours).toBe(200);

        // 2. Salvar Orçamento Aprovado pelo Cliente
        const budRes = await saveBudget(projectId, {
            totalBudget: 50000,
        });
        expect(budRes.ok).toBe(true);
        expect(budRes.data.totalBudget).toBe(50000);

        // 3. Simular Apontamento de Horas abaixo do Orçamento
        (prisma as any)._setMockLogs([
            { id: "tl-1", duration: 50, billable: true, billRate: 200, user: { fullName: "Arquiteto Sênior" } },
            { id: "tl-2", duration: 30, billable: true, billRate: 150, user: { fullName: "Arquiteto Pleno" } },
            { id: "tl-3", duration: 20, billable: false, billRate: 0, user: { fullName: "Estagiário" } },
        ]);

        let finRes = await getProjectFinancials(projectId);
        expect(finRes.ok).toBe(true);
        expect(finRes.data.metrics.totalHours).toBe(100);
        expect(finRes.data.metrics.billableHours).toBe(80);
        expect(finRes.data.metrics.nonBillableHours).toBe(20);
        
        // Custo Real: (50 * 200) + (30 * 150) = 10000 + 4500 = 14500
        expect(finRes.data.metrics.actualCostOfHours).toBe(14500);
        expect(finRes.data.budget.spentAmount).toBe(14500);
        expect(finRes.data.budget.remainingAmount).toBe(35500);
        expect(finRes.data.metrics.isCritical).toBe(false);

        // 4. Simular Apontamento adicional que ESTOURA o orçamento (> 50.000)
        (prisma as any)._setMockLogs([
            { id: "tl-1", duration: 50, billable: true, billRate: 200, user: { fullName: "Arquiteto Sênior" } },
            { id: "tl-2", duration: 30, billable: true, billRate: 150, user: { fullName: "Arquiteto Pleno" } },
            { id: "tl-4", duration: 200, billable: true, billRate: 200, user: { fullName: "Arquiteto Sênior" } }, // +40.000 => Total 54.500
        ]);

        finRes = await getProjectFinancials(projectId);
        expect(finRes.ok).toBe(true);
        expect(finRes.data.metrics.actualCostOfHours).toBe(54500);
        expect(finRes.data.budget.status).toBe(BudgetStatus.EXCEEDED);
        expect(finRes.data.metrics.isCritical).toBe(true);

        // 5. Sincronizar dados financeiros no banco
        const syncRes = await syncProjectFinancials(projectId);
        expect(syncRes.ok).toBe(true);
    });
});
