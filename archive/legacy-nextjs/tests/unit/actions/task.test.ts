import { updateTask } from "@/app/actions/task";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

// Mocking dependencies
jest.mock("@/lib/prisma", () => ({
    prisma: {
        task: {
            update: jest.fn(),
        },
    },
}));

jest.mock("@/lib/server-utils", () => ({
    requireProjectAccess: jest.fn(),
}));

jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe("Task Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("updateTask", () => {
        it("should successfully update a task", async () => {
            const taskId = "task-123";
            const projectId = "proj-123";
            const mockData = { title: "Updated Title", description: "Updated Desc" };

            (requireProjectAccess as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
            (prisma.task.update as jest.Mock).mockResolvedValue({ id: taskId, ...mockData });

            const result = await updateTask(taskId, projectId, mockData as any);

            expect(requireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR]);
            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: taskId, projectId },
                data: expect.objectContaining({
                    ...mockData,
                    dueDate: undefined // Matches the spreading and undefined assignment in implementation
                }),
            });
            expect(revalidatePath).toHaveBeenCalledWith(`/projects/${projectId}`);
            expect(result).toEqual({ success: true });
        });

        it("should parse dueDate correctly if provided", async () => {
            const taskId = "task-123";
            const projectId = "proj-123";
            const dateStr = "2024-01-01T10:00:00.000Z";
            const mockData = { dueDate: dateStr };

            (requireProjectAccess as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
            (prisma.task.update as jest.Mock).mockResolvedValue({ id: taskId, dueDate: new Date(dateStr) });

            const result = await updateTask(taskId, projectId, mockData as any);

            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: taskId, projectId },
                data: expect.objectContaining({ dueDate: new Date(dateStr) }),
            });
            expect(result).toEqual({ success: true });
        });

        it("should return an error if requireProjectAccess throws", async () => {
            const taskId = "task-123";
            const projectId = "proj-123";
            const mockData = { title: "Test" };
            const errorMessage = "Access denied";

            (requireProjectAccess as jest.Mock).mockRejectedValue(new Error(errorMessage));

            const result = await updateTask(taskId, projectId, mockData as any);

            expect(requireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR]);
            expect(prisma.task.update).not.toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: expect.stringContaining(errorMessage) });
        });

        it("should return an error if prisma.task.update throws", async () => {
            const taskId = "task-123";
            const projectId = "proj-123";
            const mockData = { title: "Test" };
            const errorMessage = "Database error";

            (requireProjectAccess as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
            (prisma.task.update as jest.Mock).mockRejectedValue(new Error(errorMessage));

            const result = await updateTask(taskId, projectId, mockData as any);

            expect(prisma.task.update).toHaveBeenCalled();
            expect(result).toEqual({ success: false, error: expect.stringContaining(errorMessage) });
        });
    });
});
