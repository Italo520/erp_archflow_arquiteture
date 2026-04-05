import { createProject, updateProjectPhase, getProjectMetrics } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "@prisma/client";

// Mock dependencies
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

jest.mock("@/auth", () => ({
    auth: jest.fn().mockResolvedValue({ user: { id: "user-123" } }),
}));

jest.mock("@/lib/prisma", () => {
    const { mockDeep } = require("jest-mock-extended");
    return {
        __esModule: true,
        prisma: mockDeep(),
    };
});

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Project Architecture Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createProject (Architectural Fields)", () => {
        it("should create a project with architectural details", async () => {
            const projectData = {
                ownerId: "a8d6707e-8405-422b-b5bb-99b6dec005c1",
                name: "Modern Villa",
                architecturalStyle: "MODERNISTA" as const,
                constructionType: "CONCRETO_ARMADO" as const,
                totalArea: 250.5,
                numberOfFloors: 2,
                numberOfRooms: 8,
                hasBasement: true,
                environmentalLicenseRequired: true,
                hasGarage: true,
                visibility: "TEAM" as const,
                status: "PLANNING",
                phases: [
                    { name: "Briefing", order: 1, status: "COMPLETED" as const },
                    { name: "Anteprojeto", order: 2, status: "IN_PROGRESS" as const }
                ]
            };

            // Mock successful creation
            mockPrisma.project.create.mockResolvedValue({
                id: "proj-1",
                ...projectData,
                ownerId: "user-123",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
                // Add mandatory fields that might be missing from input but present in DB result
                status: "PLANNING",
                clientName: null,
                imageUrl: null,
                address: null,
                startDate: null,
                deliveryDate: null,
                projectType: null,
                clientId: null,
                hasGarage: false,
                parkingSpots: null,
                landscapingArea: null,
                estimatedEndDate: null,
                actualEndDate: null,
                plannedCost: null,
                actualCost: null,
                attachedDocuments: null,
                projectTags: [],
                visibility: "TEAM"
            } as any);

            const result = await createProject(projectData);

            if ('error' in result) throw new Error("Failed to create project");
            expect(result.success).toBe(true);
            expect(mockPrisma.project.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    name: "Modern Villa",
                    architecturalStyle: "MODERNISTA",
                    hasBasement: true,
                    // Phases should be cast to any/JSON in the action
                    phases: expect.any(Object)
                }),
            });
        });
    });

    describe("updateProjectPhase", () => {
        it("should update project phases", async () => {
            const phases = [
                { name: "Briefing", order: 1, status: "COMPLETED" as const },
                { name: "Executivo", order: 3, status: "PENDING" as const }
            ];

            mockPrisma.project.update.mockResolvedValue({
                id: "proj-1",
                phases: phases as any
            } as any);

            const result = await updateProjectPhase("proj-1", phases);

            if ('error' in result) throw new Error("Failed to update project phases");
            expect(result.success).toBe(true);
            expect(mockPrisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { phases: phases as any }
            });
        });
    });

    describe("getProjectMetrics", () => {
        it("should calculate metrics correctly", async () => {
            const projectId = "proj-1";

            // Mock Project
            mockPrisma.project.findUnique.mockResolvedValue({
                id: projectId,
                phases: [
                    { status: "COMPLETED" },
                    { status: "COMPLETED" },
                    { status: "PENDING" },
                    { status: "PENDING" }
                ]
            } as any);

            // Mock TimeLogs
            // @ts-ignore
            mockPrisma.timeLog.groupBy.mockResolvedValue([
                { category: "DESIGN", _sum: { duration: 10.5 } },
                { category: "MEETING", _sum: { duration: 2.0 } }
            ] as any);

            // Mock Budget
            mockPrisma.budget.findUnique.mockResolvedValue({
                projectId,
                totalBudget: 50000,
                spentAmount: 15000
            } as any);

            const result = await getProjectMetrics(projectId);

            if (result.error) throw new Error(result.error);

            expect(result.success).toBe(true);
            expect(result.data?.totalHours).toBe(12.5); // 10.5 + 2.0
            expect(result.data?.budgetSpent).toBe(15000);
            expect(result.data?.progress).toBe(50); // 2 completed out of 4 phases
        });
    });
});
