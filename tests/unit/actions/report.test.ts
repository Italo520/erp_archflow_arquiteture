import { getTopProjects, getTimeBreakdownByClient, getFullProjectBreakdown } from "@/app/actions/report";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("@/auth", () => ({
    auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => {
    const { mockDeep } = require("jest-mock-extended");
    return {
        __esModule: true,
        prisma: mockDeep(),
    };
});

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
const mockAuth = auth as jest.Mock;

describe("Report Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    });

    describe("getTopProjects", () => {
        it("should return top projects with names", async () => {
            mockPrisma.timeLog.groupBy.mockResolvedValue([
                { projectId: "p1", _sum: { duration: 10 } },
                { projectId: "p2", _sum: { duration: 5 } },
            ] as any);

            mockPrisma.project.findMany.mockResolvedValue([
                { id: "p1", name: "Project 1" },
                { id: "p2", name: "Project 2" },
            ] as any);

            const result = await getTopProjects();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { name: "Project 1", hours: 10 },
                { name: "Project 2", hours: 5 },
            ]);
        });

        it("should handle unknown projects", async () => {
            mockPrisma.timeLog.groupBy.mockResolvedValue([
                { projectId: "p1", _sum: { duration: 10 } },
            ] as any);

            mockPrisma.project.findMany.mockResolvedValue([]);

            const result = await getTopProjects();

            expect(result.success).toBe(true);
            expect(result.data[0].name).toBe("Unknown");
        });
    });

    describe("getTimeBreakdownByClient", () => {
        it("should return client breakdown with names", async () => {
            mockPrisma.timeLog.groupBy.mockResolvedValue([
                { clientId: "c1", _sum: { duration: 15 } },
                { clientId: null, _sum: { duration: 5 } },
            ] as any);

            mockPrisma.client.findMany.mockResolvedValue([
                { id: "c1", name: "Client 1" },
            ] as any);

            const result = await getTimeBreakdownByClient();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { name: "Client 1", hours: 15 },
                { name: "Internal / No Client", hours: 5 },
            ]);
        });
    });

    describe("getFullProjectBreakdown", () => {
        it("should return full project breakdown", async () => {
             mockPrisma.timeLog.groupBy.mockResolvedValue([
                { projectId: "p1", _sum: { duration: 20 } },
            ] as any);

            mockPrisma.project.findMany.mockResolvedValue([
                { id: "p1", name: "Project 1" },
            ] as any);

            const result = await getFullProjectBreakdown();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([
                { name: "Project 1", hours: 20 },
            ]);
        });
    });
});
