import { getKanbanColumns } from "@/app/actions/kanban";
import { prisma } from "@/lib/prisma";
import { DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, Role } from "@prisma/client";
import { requireAuth, requireProjectAccess } from "@/lib/server-utils";

jest.mock("@/lib/server-utils", () => ({
    requireAuth: jest.fn(),
    requireProjectAccess: jest.fn()
}));

jest.mock("@/lib/prisma", () => {
    const { mockDeep } = require("jest-mock-extended");
    return {
        __esModule: true,
        prisma: mockDeep(),
    };
});

const mockPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
const mockRequireAuth = requireAuth as jest.Mock;
const mockRequireProjectAccess = requireProjectAccess as jest.Mock;

describe("Kanban Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRequireAuth.mockResolvedValue({ user: { id: "user-1", role: "OWNER" } });
        mockRequireProjectAccess.mockResolvedValue(true);
        (mockPrisma as any).projectKanbanColumn = {
            findMany: jest.fn(),
            create: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findUnique: jest.fn(),
        };
        (mockPrisma as any).ProjectKanbanColumn = (mockPrisma as any).projectKanbanColumn;
    });

    describe("getKanbanColumns", () => {
        it("should return empty array when no projectId is provided", async () => {
            const result = await getKanbanColumns();

            expect(mockRequireAuth).toHaveBeenCalled();
            expect(result).toEqual({ ok: true, success: true, data: [] });
            expect((mockPrisma as any).projectKanbanColumn.findMany).not.toHaveBeenCalled();
        });

        it("should require project access and return existing columns", async () => {
            const projectId = "proj-1";
            const mockColumns = [
                { id: "col-1", title: "To Do", order: 0, projectId },
                { id: "col-2", title: "Done", order: 1, projectId }
            ];

            (mockPrisma as any).projectKanbanColumn.findMany.mockResolvedValue(mockColumns);

            const result = await getKanbanColumns(projectId);

            expect(mockRequireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);
            expect((mockPrisma as any).projectKanbanColumn.findMany).toHaveBeenCalledWith({
                where: { projectId },
                orderBy: { order: 'asc' }
            });
            expect(result).toEqual({ ok: true, success: true, data: mockColumns });
        });

        it("should initialize default columns if none exist", async () => {
             const projectId = "proj-1";
             const defaultCols = [
                { title: 'Planejamento', color: 'bg-blue-500', order: 0, projectId },
                { title: 'Em Andamento', color: 'bg-emerald-500', order: 1, projectId },
                { title: 'Pausado', color: 'bg-amber-500', order: 2, projectId },
                { title: 'Concluído', color: 'bg-slate-500', order: 3, projectId }
            ];

            // First call returns empty, second call returns newly created
            (mockPrisma as any).projectKanbanColumn.findMany
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(defaultCols.map((c, i) => ({ id: `new-${i}`, ...c })));

            (mockPrisma as any).projectKanbanColumn.create.mockResolvedValue({});

            const result = await getKanbanColumns(projectId);

            expect((mockPrisma as any).projectKanbanColumn.create).toHaveBeenCalledTimes(4);
            expect((mockPrisma as any).projectKanbanColumn.findMany).toHaveBeenCalledTimes(2);
            expect(result.data).toHaveLength(4);
            expect(result.data[0].title).toBe('Planejamento');
        });

        it("should handle and return errors", async () => {
            const projectId = "proj-1";
            const errorMsg = "Database failure";

            mockRequireProjectAccess.mockRejectedValue(new Error(errorMsg));

            const result = await getKanbanColumns(projectId);

            expect(result.ok).toBe(false);
            expect(result.success).toBe(false);
            expect(result.error).toBe(errorMsg);
        });
    });

    describe("createKanbanColumn", () => {
        it("should create a column with explicit projectId and title", async () => {
            const projectId = "proj-1";
            const title = "New Column";
            const color = "bg-red-500";

            (mockPrisma as any).projectKanbanColumn.findFirst.mockResolvedValue({ order: 1 });
            (mockPrisma as any).projectKanbanColumn.create.mockResolvedValue({ id: "new-col", title, color, order: 2, projectId });

            const result = await import("@/app/actions/kanban").then(m => m.createKanbanColumn(projectId, title, color));

            expect(mockRequireAuth).toHaveBeenCalled();
            expect(mockRequireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR]);
            expect((mockPrisma as any).projectKanbanColumn.create).toHaveBeenCalledWith({
                data: { title, color, order: 2, projectId }
            });
            expect(result.ok).toBe(true);
            expect(result.data).toBeDefined();
        });

        it("should return error if projectId or title is missing", async () => {
            const result = await import("@/app/actions/kanban").then(m => m.createKanbanColumn("", ""));

            expect(result.ok).toBe(false);
            expect(result.error).toBe("ID e título obrigatórios");
        });

        it("should fallback to first active project if title is not provided (using first arg as title)", async () => {
            const title = "First Proj Col";
            const firstProj = { id: "first-proj" };
            (mockPrisma as any).project = { findFirst: jest.fn().mockResolvedValue(firstProj) };
            (mockPrisma as any).Project = (mockPrisma as any).project;

            (mockPrisma as any).projectKanbanColumn.findFirst.mockResolvedValue(null);
            (mockPrisma as any).projectKanbanColumn.create.mockResolvedValue({ id: "col", title, order: 0, projectId: firstProj.id });

            const result = await import("@/app/actions/kanban").then(m => m.createKanbanColumn(title));

            expect((mockPrisma as any).project.findFirst).toHaveBeenCalledWith({ where: { deletedAt: null } });
            expect(mockRequireProjectAccess).toHaveBeenCalledWith(firstProj.id, [Role.OWNER, Role.EDITOR]);
            expect(result.ok).toBe(true);
            expect((mockPrisma as any).projectKanbanColumn.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ projectId: firstProj.id, title })
            }));
        });
    });

    describe("updateKanbanColumn", () => {
        it("should update an existing column", async () => {
            const id = "col-1";
            const data = { title: "Updated Title" };
            const existingCol = { id, projectId: "proj-1" };

            (mockPrisma as any).projectKanbanColumn.findUnique.mockResolvedValue(existingCol);
            (mockPrisma as any).projectKanbanColumn.update.mockResolvedValue({ ...existingCol, ...data });

            const result = await import("@/app/actions/kanban").then(m => m.updateKanbanColumn(id, data));

            expect(mockRequireAuth).toHaveBeenCalled();
            expect((mockPrisma as any).projectKanbanColumn.findUnique).toHaveBeenCalledWith({ where: { id } });
            expect(mockRequireProjectAccess).toHaveBeenCalledWith(existingCol.projectId, [Role.OWNER, Role.EDITOR]);
            expect((mockPrisma as any).projectKanbanColumn.update).toHaveBeenCalledWith({ where: { id }, data });
            expect(result.ok).toBe(true);
            expect(result.data?.title).toBe("Updated Title");
        });

        it("should handle error during update", async () => {
            const id = "col-1";
            const errorMsg = "Update failed";
            (mockPrisma as any).projectKanbanColumn.findUnique.mockResolvedValue({ id, projectId: "proj-1" });
            mockRequireProjectAccess.mockRejectedValue(new Error(errorMsg));

            const result = await import("@/app/actions/kanban").then(m => m.updateKanbanColumn(id, {}));

            expect(result.ok).toBe(false);
            expect(result.error).toBe(errorMsg);
        });
    });

    describe("deleteKanbanColumn", () => {
        it("should return error if column not found", async () => {
             (mockPrisma as any).projectKanbanColumn.findUnique.mockResolvedValue(null);

             const result = await import("@/app/actions/kanban").then(m => m.deleteKanbanColumn("non-existent"));

             expect(result.ok).toBe(false);
             expect(result.error).toBe("Coluna não encontrada");
        });

        it("should delete column and reassign project status", async () => {
             const id = "col-to-delete";
             const projectId = "proj-1";
             const existingCol = { id, projectId };
             const firstCol = { id: "col-first", projectId };

             (mockPrisma as any).projectKanbanColumn.findUnique.mockResolvedValue(existingCol);
             (mockPrisma as any).projectKanbanColumn.findFirst.mockResolvedValue(firstCol);
             (mockPrisma as any).project = { updateMany: jest.fn().mockResolvedValue({ count: 1 }) };
             (mockPrisma as any).Project = (mockPrisma as any).project;
             (mockPrisma as any).projectKanbanColumn.delete.mockResolvedValue(existingCol);

             const result = await import("@/app/actions/kanban").then(m => m.deleteKanbanColumn(id));

             expect(mockRequireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR]);
             expect((mockPrisma as any).project.updateMany).toHaveBeenCalledWith({
                 where: { id: projectId, status: id },
                 data: { status: firstCol.id }
             });
             expect((mockPrisma as any).projectKanbanColumn.delete).toHaveBeenCalledWith({ where: { id } });
             expect(result.ok).toBe(true);
        });
    });

    describe("updateProjectStatus", () => {
        it("should update project status", async () => {
             const projectId = "proj-1";
             const statusId = "status-1";
             const updatedProject = { id: projectId, status: statusId };

             (mockPrisma as any).project = { update: jest.fn().mockResolvedValue(updatedProject) };
             (mockPrisma as any).Project = (mockPrisma as any).project;

             const result = await import("@/app/actions/kanban").then(m => m.updateProjectStatus(projectId, statusId));

             expect(mockRequireProjectAccess).toHaveBeenCalledWith(projectId, [Role.OWNER, Role.EDITOR]);
             expect((mockPrisma as any).project.update).toHaveBeenCalledWith({
                 where: { id: projectId },
                 data: { status: statusId }
             });
             expect(result.ok).toBe(true);
        });

        it("should handle error during status update", async () => {
            const projectId = "proj-1";
            const statusId = "status-1";
            const errorMsg = "Update project status failed";

            mockRequireProjectAccess.mockRejectedValue(new Error(errorMsg));

            const result = await import("@/app/actions/kanban").then(m => m.updateProjectStatus(projectId, statusId));

            expect(result.ok).toBe(false);
            expect(result.error).toBe(errorMsg);
        });
    });
});
