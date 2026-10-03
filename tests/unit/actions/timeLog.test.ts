import { createTimeLog, startTimeLog, stopTimeLog, getTimeLogById, updateTimeLog, deleteTimeLog, listTimeLogs, calculateBillableHours, getRunningTimeLog } from "@/app/actions/timeLog";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/server-utils";
import { TimeLogCategory } from "@prisma/client";

const VALID_PROJECT_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const VALID_LOG_ID = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        timeLog: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            count: jest.fn(),
            aggregate: jest.fn(),
        },
        $transaction: jest.fn((arr) => Promise.all(arr)),
    },
}));

jest.mock("@/lib/server-utils", () => ({
    requireAuth: jest.fn().mockResolvedValue({ user: { id: "user-1", role: "OWNER" } }),
    requireProjectAccess: jest.fn().mockResolvedValue({ user: { id: "user-1", role: "OWNER" } }),
}));

describe("TimeLog Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createTimeLog", () => {
        it("should validate and create a valid time log", async () => {
            const validData = {
                duration: 2.5,
                category: TimeLogCategory.DESIGN,
                projectId: VALID_PROJECT_ID,
                date: new Date(),
                billable: true,
                billRate: 150,
                description: "Desenho da planta baixa",
            };

            (prisma.timeLog.create as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                ...validData,
                userId: "user-1",
            });

            const res = await createTimeLog(validData as any);
            expect(res.ok).toBe(true);
            expect(prisma.timeLog.create).toHaveBeenCalled();
        });

        it("should return validation error for negative duration", async () => {
            const invalidData = {
                duration: -1,
                category: TimeLogCategory.DESIGN,
                projectId: VALID_PROJECT_ID,
                date: new Date(),
            };

            const res = await createTimeLog(invalidData as any);
            expect(res.ok).toBe(false);
            expect(res.error).toBeDefined();
        });
    });

    describe("startTimeLog and stopTimeLog", () => {
        it("should start a timer with 0 initial duration", async () => {
            (prisma.timeLog.create as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                duration: 0,
                category: TimeLogCategory.MEETING,
                projectId: VALID_PROJECT_ID,
            });

            const res = await startTimeLog({
                projectId: VALID_PROJECT_ID,
                category: TimeLogCategory.MEETING,
                billable: true,
            });

            expect(res.ok).toBe(true);
            expect(res.data.id).toBe(VALID_LOG_ID);
        });

        it("should stop an active timer and calculate duration", async () => {
            const startTime = new Date(Date.now() - 3600 * 1000); // 1 hr ago
            (prisma.timeLog.findUnique as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                projectId: VALID_PROJECT_ID,
                startTime,
                endTime: null,
            });
            (prisma.timeLog.update as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                duration: 1.0,
            });

            const res = await stopTimeLog(VALID_LOG_ID);
            expect(res.ok).toBe(true);
            expect(prisma.timeLog.update).toHaveBeenCalled();
        });

        it("should reject stopping an already stopped timer", async () => {
            (prisma.timeLog.findUnique as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                projectId: VALID_PROJECT_ID,
                startTime: new Date(),
                endTime: new Date(),
            });

            const res = await stopTimeLog(VALID_LOG_ID);
            expect(res.ok).toBe(false);
            expect(res.error).toBe("Timer already stopped");
        });
    });

    describe("calculateBillableHours", () => {
        it("should aggregate billable hours correctly", async () => {
            (prisma.timeLog.aggregate as jest.Mock).mockResolvedValue({
                _sum: { duration: 42.5 },
            });

            const res = await calculateBillableHours(VALID_PROJECT_ID);
            expect(res.ok).toBe(true);
            expect(res.data.totalBillableHours).toBe(42.5);
        });
    });

    describe("getRunningTimeLog", () => {
        it("should return running log if exists", async () => {
            (prisma.timeLog.findFirst as jest.Mock).mockResolvedValue({
                id: VALID_LOG_ID,
                endTime: null,
            });

            const res = await getRunningTimeLog();
            expect(res.ok).toBe(true);
            expect(res.data.id).toBe(VALID_LOG_ID);
        });
    });
});
