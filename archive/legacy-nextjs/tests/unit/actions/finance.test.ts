import { getProjectFinancials, syncProjectFinancials, saveBudget, saveEstimate } from "@/app/actions/finance";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";
import { BudgetStatus, EstimateStatus } from "@prisma/client";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        project: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        budget: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
        },
        estimate: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
        },
        timeLog: {
            findMany: jest.fn(),
        },
        $transaction: jest.fn(async (cb) => {
            if (typeof cb === "function") {
                return await cb({
                    project: { update: jest.fn() },
                    budget: { update: jest.fn() },
                    estimate: { update: jest.fn() },
                });
            }
            return Promise.all(cb);
        }),
    },
}));

jest.mock("@/lib/server-utils", () => ({
    requireProjectAccess: jest.fn(),
}));

jest.mock("@/app/actions/audit", () => ({
    logAudit: jest.fn().mockResolvedValue(true),
}));

describe("Finance Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getProjectFinancials", () => {
        it("should return NotFound if project doesn't exist", async () => {
            (requireProjectAccess as jest.Mock).mockResolvedValue({ id: "user-1", role: "OWNER" });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.budget.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.estimate.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.timeLog.findMany as jest.Mock).mockResolvedValue([]);

            const res = await getProjectFinancials("proj-notfound");
            expect(res.ok).toBe(false);
            expect(res.error).toBe("NotFound");
        });

        it("should calculate metrics correctly for hours and budget", async () => {
            (requireProjectAccess as jest.Mock).mockResolvedValue({ id: "user-1", role: "OWNER" });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({
                id: "proj-1",
                name: "Residência Alphaville",
                plannedCost: 50000,
                actualCost: 15000,
            });
            (prisma.budget.findUnique as jest.Mock).mockResolvedValue({
                id: "bud-1",
                projectId: "proj-1",
                totalBudget: 50000,
                status: BudgetStatus.ACTIVE,
            });
            (prisma.estimate.findUnique as jest.Mock).mockResolvedValue({
                id: "est-1",
                projectId: "proj-1",
                estimatedHours: 100,
                estimatedCost: 20000,
                actualHours: 25,
                actualCost: 5000,
            });
            (prisma.timeLog.findMany as jest.Mock).mockResolvedValue([
                { id: "tl-1", duration: 10, billable: true, billRate: 200, user: { fullName: "Arquiteto 1" } },
                { id: "tl-2", duration: 5, billable: false, billRate: 0, user: { fullName: "Estagiário" } },
            ]);

            const res = await getProjectFinancials("proj-1");
            expect(res.ok).toBe(true);
            expect(res.data.metrics.totalHours).toBe(15);
            expect(res.data.metrics.billableHours).toBe(10);
            expect(res.data.metrics.nonBillableHours).toBe(5);
            expect(res.data.metrics.actualCostOfHours).toBe(2000); // 10 * 200
            expect(res.data.budget.spentAmount).toBe(2000);
            expect(res.data.budget.remainingAmount).toBe(48000);
        });

        it("should flag status as EXCEEDED when budget is exceeded", async () => {
            (requireProjectAccess as jest.Mock).mockResolvedValue({ id: "user-1", role: "OWNER" });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({
                id: "proj-1",
                name: "Edifício Prime",
                plannedCost: 1000,
            });
            (prisma.budget.findUnique as jest.Mock).mockResolvedValue({
                id: "bud-1",
                projectId: "proj-1",
                totalBudget: 1000,
                status: BudgetStatus.ACTIVE,
            });
            (prisma.estimate.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.timeLog.findMany as jest.Mock).mockResolvedValue([
                { id: "tl-1", duration: 10, billable: true, billRate: 200, user: { fullName: "Arquiteto" } }, // 2000 > 1000
            ]);

            const res = await getProjectFinancials("proj-1");
            expect(res.ok).toBe(true);
            expect(res.data.budget.status).toBe(BudgetStatus.EXCEEDED);
            expect(res.data.metrics.isCritical).toBe(true);
        });
    });

    describe("saveBudget", () => {
        it("should save and upsert budget with calculated spent amount", async () => {
            (requireProjectAccess as jest.Mock).mockResolvedValue({ id: "user-1", role: "OWNER" });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: "proj-1" });
            (prisma.timeLog.findMany as jest.Mock).mockResolvedValue([
                { id: "tl-1", duration: 5, billable: true, billRate: 100 },
            ]);
            (prisma.budget.upsert as jest.Mock).mockResolvedValue({
                id: "bud-1",
                projectId: "proj-1",
                totalBudget: 10000,
                spentAmount: 500,
                remainingAmount: 9500,
                status: BudgetStatus.ACTIVE,
            });

            const res = await saveBudget("proj-1", { totalBudget: 10000 });
            expect(res.ok).toBe(true);
            expect(prisma.budget.upsert).toHaveBeenCalled();
            expect(prisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { plannedCost: 10000 },
            });
        });
    });

    describe("saveEstimate", () => {
        it("should save estimate and recalculate actual totals from timeLogs", async () => {
            (requireProjectAccess as jest.Mock).mockResolvedValue({ id: "user-1", role: "OWNER" });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({ id: "proj-1" });
            (prisma.timeLog.findMany as jest.Mock).mockResolvedValue([
                { id: "tl-1", duration: 8, billable: true, billRate: 150 },
            ]);
            (prisma.estimate.upsert as jest.Mock).mockResolvedValue({
                id: "est-1",
                projectId: "proj-1",
                estimatedHours: 80,
                estimatedCost: 12000,
                actualHours: 8,
                actualCost: 1200,
                status: EstimateStatus.IN_PROGRESS,
            });

            const res = await saveEstimate("proj-1", { estimatedHours: 80, estimatedCost: 12000, notes: "Fase conceitual" });
            expect(res.ok).toBe(true);
            expect(prisma.estimate.upsert).toHaveBeenCalled();
        });
    });
});
