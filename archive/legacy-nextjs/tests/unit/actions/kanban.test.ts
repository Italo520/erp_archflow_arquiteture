import { getKanbanColumns, createKanbanColumn, updateKanbanColumn, deleteKanbanColumn, updateProjectStatus } from "@/app/actions/kanban";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireProjectAccess } from "@/lib/server-utils";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        projectKanbanColumn: {
            findMany: jest.fn(),
            createMany: jest.fn(),
            findFirst: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        project: {
            updateMany: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("@/lib/server-utils", () => ({
    requireAuth: jest.fn().mockResolvedValue({ id: "u-1" }),
    requireProjectAccess: jest.fn().mockResolvedValue({ id: "u-1", role: "OWNER" }),
}));

describe("Kanban Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getKanbanColumns", () => {
        it("should return empty data when no projectId is provided", async () => {
            const res = await getKanbanColumns();
            expect(res.ok).toBe(true);
            expect(res.data).toEqual([]);
        });

        it("should return existing columns for a project", async () => {
            const mockCols = [
                { id: "col-1", title: "Planejamento", order: 0, projectId: "proj-1" },
                { id: "col-2", title: "Em Andamento", order: 1, projectId: "proj-1" },
            ];
            (prisma.projectKanbanColumn.findMany as jest.Mock).mockResolvedValue(mockCols);

            const res = await getKanbanColumns("proj-1");
            expect(res.ok).toBe(true);
            expect(res.data).toEqual(mockCols);
        });

        it("should initialize default columns if project has none", async () => {
            (prisma.projectKanbanColumn.findMany as jest.Mock)
                .mockResolvedValueOnce([]) // First call returns none
                .mockResolvedValueOnce([
                    { id: "col-1", title: "Planejamento", order: 0 },
                    { id: "col-2", title: "Em Andamento", order: 1 },
                ]); // Second call returns initialized columns

            const res = await getKanbanColumns("proj-1");
            expect(res.ok).toBe(true);
            expect(prisma.projectKanbanColumn.createMany).toHaveBeenCalled();
        });
    });

    describe("createKanbanColumn", () => {
        it("should reject if projectId or title are missing", async () => {
            const res = await createKanbanColumn("", "");
            expect(res.ok).toBe(false);
            expect(res.error).toContain("obrigatórios");
        });

        it("should create column with incremental order", async () => {
            (prisma.projectKanbanColumn.findFirst as jest.Mock).mockResolvedValue({ order: 2 });
            (prisma.projectKanbanColumn.create as jest.Mock).mockResolvedValue({
                id: "col-3",
                title: "Revisão Técnica",
                order: 3,
                projectId: "proj-1",
            });

            const res = await createKanbanColumn("proj-1", "Revisão Técnica", "bg-purple-500");
            expect(res.ok).toBe(true);
            expect(prisma.projectKanbanColumn.create).toHaveBeenCalledWith({
                data: {
                    title: "Revisão Técnica",
                    color: "bg-purple-500",
                    order: 3,
                    projectId: "proj-1",
                },
            });
        });
    });

    describe("updateKanbanColumn", () => {
        it("should update column properties", async () => {
            (prisma.projectKanbanColumn.findUnique as jest.Mock).mockResolvedValue({
                id: "col-1",
                projectId: "proj-1",
            });
            (prisma.projectKanbanColumn.update as jest.Mock).mockResolvedValue({
                id: "col-1",
                title: "Aprovado",
                projectId: "proj-1",
            });

            const res = await updateKanbanColumn("col-1", { title: "Aprovado" });
            expect(res.ok).toBe(true);
            expect(res.data.title).toBe("Aprovado");
        });
    });

    describe("deleteKanbanColumn", () => {
        it("should return error if column not found", async () => {
            (prisma.projectKanbanColumn.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await deleteKanbanColumn("col-notfound");
            expect(res.ok).toBe(false);
            expect(res.error).toContain("não encontrada");
        });

        it("should reassign projects in column before deleting", async () => {
            (prisma.projectKanbanColumn.findUnique as jest.Mock).mockResolvedValue({
                id: "col-delete",
                projectId: "proj-1",
            });
            (prisma.projectKanbanColumn.findFirst as jest.Mock).mockResolvedValue({
                id: "col-first",
                projectId: "proj-1",
            });
            (prisma.projectKanbanColumn.delete as jest.Mock).mockResolvedValue({ id: "col-delete" });

            const res = await deleteKanbanColumn("col-delete");
            expect(res.ok).toBe(true);
            expect(prisma.project.updateMany).toHaveBeenCalledWith({
                where: { currentColumnId: "col-delete" },
                data: { currentColumnId: "col-first" },
            });
            expect(prisma.projectKanbanColumn.delete).toHaveBeenCalledWith({ where: { id: "col-delete" } });
        });
    });

    describe("updateProjectStatus", () => {
        it("should update project currentColumnId", async () => {
            (prisma.projectKanbanColumn.findFirst as jest.Mock).mockResolvedValue({
                id: "col-in-progress",
                title: "Em Andamento",
            });
            (prisma.project.update as jest.Mock).mockResolvedValue({
                id: "proj-1",
                currentColumnId: "col-in-progress",
            });

            const res = await updateProjectStatus("proj-1", "IN_PROGRESS");
            expect(res.ok).toBe(true);
            expect(prisma.project.update).toHaveBeenCalledWith({
                where: { id: "proj-1" },
                data: { currentColumnId: "col-in-progress" },
            });
        });
    });
});
