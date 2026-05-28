import { logAudit, getProjectAuditLogs } from "@/app/actions/audit";
import { prisma } from "@/lib/prisma";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

jest.mock("@/lib/prisma", () => {
    const { mockDeep } = require("jest-mock-extended");
    return {
        __esModule: true,
        prisma: mockDeep(),
    };
});

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

// Mock requireAuth
jest.mock("@/lib/server-utils", () => ({
    requireAuth: jest.fn().mockResolvedValue({
        user: { id: "a8d6707e-8405-422b-b5bb-99b6dec005c1", role: "OWNER" }
    }),
    requireProjectAccess: jest.fn().mockResolvedValue({
        user: { id: "a8d6707e-8405-422b-b5bb-99b6dec005c1", role: "OWNER" }
    })
}));

describe("Audit Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should log audit and trigger expiration", async () => {
        mockPrisma.auditLog.create.mockResolvedValue({ id: "1" } as any);
        mockPrisma.auditLog.deleteMany.mockResolvedValue({ count: 5 });

        await logAudit({
            action: "UPDATE",
            entityType: "PROJECT",
            entityId: "123",
            projectId: "123",
            changes: { name: "Test" }
        });

        expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                action: "UPDATE",
                entityType: "PROJECT",
            })
        });

        expect(mockPrisma.auditLog.deleteMany).toHaveBeenCalled();
    });

    it("should fetch project audit logs if user is OWNER", async () => {
        mockPrisma.projectMember.findUnique.mockResolvedValue({ role: "OWNER" } as any);
        mockPrisma.auditLog.findMany.mockResolvedValue([
            { id: "1", action: "UPDATE", entityType: "PROJECT" }
        ] as any);

        const result = await getProjectAuditLogs("123");

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
    });
});
