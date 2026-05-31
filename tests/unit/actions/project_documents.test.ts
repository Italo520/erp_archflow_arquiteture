import { deleteProjectDocument } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

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

describe("Project Document Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("deleteProjectDocument", () => {
        it("should return Unauthorized if no session", async () => {
            mockAuth.mockResolvedValue(null);
            const result = await deleteProjectDocument("proj-1", "doc-url");
            expect(result).toEqual({ error: "Unauthorized" });
        });

        it("should return Project not found if project doesn't exist", async () => {
            mockAuth.mockResolvedValue({ user: { id: "user-1" } });
            mockPrisma.project.findUnique.mockResolvedValue(null);

            const result = await deleteProjectDocument("proj-1", "doc-url");
            expect(result).toEqual({ error: "Project not found" });
        });

        it("should handle empty documents list", async () => {
            mockAuth.mockResolvedValue({ user: { id: "user-1" } });
            mockPrisma.project.findUnique.mockResolvedValue({
                id: "proj-1",
                attachedDocuments: null
            } as any);

            const result = await deleteProjectDocument("proj-1", "doc-url");

            expect(result).toEqual({ success: true });
            expect(mockPrisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { attachedDocuments: [] }
            });
        });

        it("should not change list if document URL not found", async () => {
            const docs = [{ name: "Doc 1", url: "url-1" }];
            mockAuth.mockResolvedValue({ user: { id: "user-1" } });
            mockPrisma.project.findUnique.mockResolvedValue({
                id: "proj-1",
                attachedDocuments: docs
            } as any);

            const result = await deleteProjectDocument("proj-1", "url-2");

            expect(result).toEqual({ success: true });
            expect(mockPrisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { attachedDocuments: docs }
            });
        });

        it("should delete the document successfully", async () => {
            const docs = [
                { name: "Doc 1", url: "url-1" },
                { name: "Doc 2", url: "url-2" }
            ];
            mockAuth.mockResolvedValue({ user: { id: "user-1" } });
            mockPrisma.project.findUnique.mockResolvedValue({
                id: "proj-1",
                attachedDocuments: docs
            } as any);

            const result = await deleteProjectDocument("proj-1", "url-1");

            expect(result).toEqual({ success: true });
            expect(mockPrisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { attachedDocuments: [{ name: "Doc 2", url: "url-2" }] }
            });
            expect(revalidatePath).toHaveBeenCalledWith("/projects/proj-1");
        });

        it("should return error on database failure", async () => {
            mockAuth.mockResolvedValue({ user: { id: "user-1" } });
            mockPrisma.project.findUnique.mockRejectedValue(new Error("DB Error"));

            const result = await deleteProjectDocument("proj-1", "url-1");
            expect(result).toEqual({ error: "Failed to delete document" });
        });
    });
});
