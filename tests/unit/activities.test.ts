import { activitySchema, timeLogSchema } from "@/lib/validations";
import { calculateBillableHours } from "@/app/actions/timeLog";
import { prisma } from "@/lib/prisma";
import { ActivityType, TimeLogCategory } from "@prisma/client";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
    prisma: {
        timeLog: {
            aggregate: jest.fn(),
        },
        activity: {
            findMany: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn((promises) => Promise.all(promises)),
    },
}));

// Mock Next Cache
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

// Mock Auth
jest.mock("@/auth", () => ({
    auth: jest.fn(() => Promise.resolve({ user: { id: "user-123" } })),
}));

describe.skip("Activity Unit Tests", () => {
    describe("Zod Validation", () => {
        it("should fail validation if endTime is before startTime", () => {
            const invalidData = {
                type: ActivityType.MEETING,
                title: "Invalid Meeting",
                startTime: new Date("2023-01-01T10:00:00"),
                endTime: new Date("2023-01-01T09:00:00"),
            };

            const result = activitySchema.safeParse(invalidData);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.flatten().fieldErrors.endTime).toBeDefined();
            }
        });

        it("should pass validation if endTime is after startTime", () => {
            const validData = {
                type: ActivityType.MEETING,
                title: "Valid Meeting",
                startTime: new Date("2023-01-01T10:00:00"),
                endTime: new Date("2023-01-01T11:00:00"),
            };

            const result = activitySchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should fail validation if time log duration is not positive", () => {
            const invalidLog = {
                duration: -1,
                category: TimeLogCategory.DESIGN,
                date: new Date(),
                projectId: "uuid-123",
                billable: true
            };
            // Note: projectId needs to be a valid uuid format in schema validation usually? 
            // schema uses z.string().uuid()

            // Let's use a mock uuid
            invalidLog.projectId = "123e4567-e89b-12d3-a456-426614174000";

            const result = timeLogSchema.safeParse(invalidLog);
            expect(result.success).toBe(false);
        });
    });

    describe("calculateBillableHours", () => {
        it("should correctly sum billable duration", async () => {
            const mockProjectId = "project-123";
            const mockTotal = 15.5;

            // Mock prisma response
            (prisma.timeLog.aggregate as jest.Mock).mockResolvedValueOnce({
                _sum: {
                    duration: mockTotal,
                },
            });

            const result = await calculateBillableHours(mockProjectId);

            expect(prisma.timeLog.aggregate).toHaveBeenCalledWith({
                _sum: { duration: true },
                where: {
                    projectId: mockProjectId,
                    billable: true,
                },
            });

            expect(result.success).toBe(true);
            expect(result.data?.totalBillableHours).toBe(mockTotal);
        });

        it("should return 0 if no billable hours found", async () => {
            (prisma.timeLog.aggregate as jest.Mock).mockResolvedValueOnce({
                _sum: {
                    duration: null,
                },
            });

            const result = await calculateBillableHours("project-empty");
            expect(result.data?.totalBillableHours).toBe(0);
        });
    });
});

import { listActivities } from "@/app/actions/activity";

describe.skip("listActivities", () => {
    it("should apply filters correctly", async () => {
        // Mock return value
        (prisma.activity.findMany as jest.Mock).mockResolvedValueOnce([]);
        (prisma.activity.count as jest.Mock).mockResolvedValueOnce(0);

        const filters = {
            type: ActivityType.MEETING,
            date: "2023-01-01"
        };

        await listActivities(filters, 1, 10);

        const expectedDateStart = new Date("2023-01-01");
        const expectedDateEnd = new Date("2023-01-02");

        // Verify prisma call arguments
        expect(prisma.activity.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                type: ActivityType.MEETING,
                startTime: {
                    gte: expectedDateStart,
                    lt: expectedDateEnd
                }
            })
        }));
    });
});
