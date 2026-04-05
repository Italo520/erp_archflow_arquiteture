import { startTimeLog, stopTimeLog, createTimeLog, listTimeLogs } from "@/app/actions/timeLog";
import { createProject, deleteProject } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";
import { TimeLogCategory } from "@prisma/client";

// Mock authentication
jest.mock('@/auth', () => ({
    auth: jest.fn(() => Promise.resolve({
        user: { id: 'a8d6707e-8405-422b-b5bb-99b6dec005c1', email: 'test@example.com' }
    }))
}));

describe("Time Tracking Integration Tests", () => {
    let testProjectId: string;
    let activeLogId: string;

    beforeAll(async () => {
        // Create a project for testing
        const project = await createProject({
            ownerId: "a8d6707e-8405-422b-b5bb-99b6dec005c1",
            name: "Time Tracking Test Project",
            status: "PLANNING",
            visibility: "PRIVATE",
            hasGarage: false,
            hasBasement: false,
            environmentalLicenseRequired: false,
        });
        if ('error' in project || !project.success) throw new Error("Failed to create test project");
        testProjectId = project.data.id;
    });

    afterAll(async () => {
        // Cleanup logs and project
        if (testProjectId) {
            await prisma.timeLog.deleteMany({ where: { projectId: testProjectId } });
            await deleteProject(testProjectId);
        }
        await prisma.$disconnect();
    });

    it("should start a timer", async () => {
        const result = await startTimeLog({
            projectId: testProjectId,
            category: TimeLogCategory.DESIGN,
            description: "Testing Timer",
            billable: true,
        });

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data.startTime).toBeDefined();
        expect(result.data.endTime).toBeNull();

        activeLogId = result.data.id;
    });

    it("should stop a timer and calculate duration", async () => {
        if (!activeLogId) throw new Error("No active log to stop");

        // Simulate some time passing (mocking Date is hard in integration if DB uses server time, 
        // but here actions use 'new Date()'. We can't easy wait in test efficiently.
        // We will just stop it immediately. Duration will be ~0 but not null.

        // Wait 100ms to ensure non-zero check if needed?
        await new Promise(r => setTimeout(r, 100));

        const result = await stopTimeLog(activeLogId);

        expect(result.success).toBe(true);
        expect(result.data.endTime).toBeDefined();
        // Duration should be roughly 0 or very small
        expect(typeof result.data.duration).toBe('number');
    });

    it("should manually create a time log", async () => {
        const result = await createTimeLog({
            projectId: testProjectId,
            category: TimeLogCategory.MEETING,
            description: "Manual Log",
            date: new Date(),
            duration: 2.5,
            billable: false,
        });

        expect(result.success).toBe(true);
        expect(result.data.duration).toBe(2.5);
    });

    it("should list time logs", async () => {
        const result = await listTimeLogs(1, 10, { projectId: testProjectId });

        expect(result.success).toBe(true);
        // Should have 2 logs: 1 from timer, 1 manual
        expect(result.data.logs.length).toBeGreaterThanOrEqual(2);
    });
});
