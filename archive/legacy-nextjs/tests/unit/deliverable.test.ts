import { submitForReview, reviewDeliverable, submitNewVersion } from "@/app/actions/deliverable";
import { prisma } from "@/lib/prisma";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, DeliverableStatus } from "@prisma/client";

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

describe("Deliverable Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should submit deliverable for review", async () => {
        mockPrisma.deliverable.findUnique.mockResolvedValue({
            id: "1", projectId: "123", status: DeliverableStatus.DRAFT, name: "Proj 1"
        } as any);

        mockPrisma.deliverable.update.mockResolvedValue({ id: "1", status: DeliverableStatus.PENDING_REVIEW } as any);

        const result = await submitForReview("1");

        expect(result.ok).toBe(true);
        expect(mockPrisma.deliverable.update).toHaveBeenCalledWith({
            where: { id: "1" },
            data: expect.objectContaining({ status: DeliverableStatus.PENDING_REVIEW })
        });
    });

    it("should review deliverable as approved", async () => {
        mockPrisma.deliverable.findUnique.mockResolvedValue({
            id: "1", projectId: "123", status: DeliverableStatus.PENDING_REVIEW, name: "Proj 1"
        } as any);

        mockPrisma.deliverable.update.mockResolvedValue({ id: "1", status: DeliverableStatus.APPROVED } as any);

        const result = await reviewDeliverable("1", DeliverableStatus.APPROVED, "Looks good");

        expect(result.ok).toBe(true);
        expect(mockPrisma.deliverable.update).toHaveBeenCalledWith({
            where: { id: "1" },
            data: expect.objectContaining({ status: DeliverableStatus.APPROVED })
        });
    });

    it("should submit new version", async () => {
        mockPrisma.deliverable.findUnique.mockResolvedValue({
            id: "1", projectId: "123", status: DeliverableStatus.REJECTED, version: 1, name: "Proj 1"
        } as any);

        mockPrisma.deliverable.update.mockResolvedValue({ id: "1", status: DeliverableStatus.DRAFT, version: 2 } as any);

        const result = await submitNewVersion("1", "url", 100, "mime");

        expect(result.ok).toBe(true);
        expect(mockPrisma.deliverable.update).toHaveBeenCalledWith({
            where: { id: "1" },
            data: expect.objectContaining({
                version: 2,
                status: DeliverableStatus.DRAFT
            })
        });
    });
});
