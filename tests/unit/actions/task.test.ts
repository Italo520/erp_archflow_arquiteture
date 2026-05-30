import { createTask } from "@/app/actions/task";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, Role, Priority } from "@prisma/client";

jest.mock("@/lib/prisma", () => {
    const { mockDeep } = require("jest-mock-extended");
    return {
        __esModule: true,
        prisma: mockDeep(),
    };
});

jest.mock("@/lib/server-utils", () => ({
    requireProjectAccess: jest.fn(),
}));

jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
const mockRequireProjectAccess = requireProjectAccess as jest.Mock;
const mockRevalidatePath = revalidatePath as jest.Mock;

describe("Task Actions - createTask", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireProjectAccess.mockResolvedValue({
            user: { id: "user-1", name: "Test User", email: "test@example.com" },
        });
    });

    it("should create a task successfully", async () => {
        const inputData = {
            title: "Test Task",
            description: "Test Description",
            projectId: "proj-1",
            stageId: "stage-1",
        };

        mockPrisma.task.findFirst.mockResolvedValue(null);
        mockPrisma.task.create.mockResolvedValue({ id: "task-1", ...inputData } as any);

        const result = await createTask(inputData);

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(mockPrisma.task.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    title: "Test Task",
                    projectId: "proj-1",
                    stageId: "stage-1",
                    position: 0,
                    historico: expect.arrayContaining([
                        expect.objectContaining({
                            type: "CREATED",
                            userId: "user-1",
                        })
                    ])
                }),
            })
        );
        expect(mockRevalidatePath).toHaveBeenCalledWith("/projects/proj-1");
    });

    it("should return an error if validation fails", async () => {
        const invalidData = {
            title: "", // Title is required and must be min 1 char
            projectId: "proj-1",
            stageId: "stage-1"
        };

        const result = await createTask(invalidData);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Dados inválidos");
        expect(mockRequireProjectAccess).not.toHaveBeenCalled();
        expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });

    it("should handle error when requireProjectAccess throws", async () => {
        mockRequireProjectAccess.mockRejectedValue(new Error("Forbidden"));

        const inputData = {
            title: "Test Task",
            projectId: "proj-1",
            stageId: "stage-1",
        };

        const result = await createTask(inputData);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Falha ao criar tarefa: Forbidden");
        expect(mockPrisma.task.create).not.toHaveBeenCalled();
    });

    it("should correctly calculate the position based on the last task", async () => {
        const inputData = {
            title: "Test Task 2",
            projectId: "proj-1",
            stageId: "stage-1",
        };

        mockPrisma.task.findFirst.mockResolvedValue({ position: 5 } as any);
        mockPrisma.task.create.mockResolvedValue({ id: "task-2", ...inputData } as any);

        const result = await createTask(inputData);

        expect(result.success).toBe(true);
        expect(mockPrisma.task.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    position: 6
                })
            })
        );
    });

    it("should handle errors during database creation", async () => {
        const inputData = {
            title: "Test Task",
            projectId: "proj-1",
            stageId: "stage-1",
        };

        mockPrisma.task.findFirst.mockResolvedValue(null);
        mockPrisma.task.create.mockRejectedValue(new Error("Database Error"));

        const result = await createTask(inputData);

        expect(result.success).toBe(false);
        expect(result.error).toContain("Falha ao criar tarefa: Database Error");
    });
});
