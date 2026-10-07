import { updateStageOrder, updateStage, createStage, deleteStage } from "@/app/actions/stage";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        stage: {
            update: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn((arr) => Promise.all(arr)),
    },
}));

describe("Stage Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createStage", () => {
        it("should reject unauthenticated request", async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const res = await createStage("proj-1", { name: "Estudo Preliminar", order: 1 });
            expect(res.success).toBe(false);
            expect(res.error).toBe("Não autorizado");
        });

        it("should reject VIEWER role from creating stages", async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "VIEWER" } });

            const res = await createStage("proj-1", { name: "Estudo Preliminar", order: 1 });
            expect(res.success).toBe(false);
            expect(res.error).toContain("permissão");
        });

        it("should create stage for OWNER role", async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "OWNER" } });
            (prisma.stage.create as jest.Mock).mockResolvedValue({
                id: "stg-1",
                name: "Anteprojeto",
                order: 2,
                projectId: "proj-1",
            });

            const res = await createStage("proj-1", { name: "Anteprojeto", order: 2 });
            expect(res.success).toBe(true);
            expect(res.stage?.name).toBe("Anteprojeto");
        });
    });

    describe("updateStageOrder", () => {
        it("should update order of multiple stages in a transaction", async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "EDITOR" } });

            const res = await updateStageOrder("proj-1", [
                { id: "stg-1", order: 2 },
                { id: "stg-2", order: 1 },
            ]);

            expect(res.success).toBe(true);
            expect(prisma.$transaction).toHaveBeenCalled();
        });
    });

    describe("deleteStage", () => {
        it("should delete stage when authorized", async () => {
            (auth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "OWNER" } });
            (prisma.stage.delete as jest.Mock).mockResolvedValue({ id: "stg-1" });

            const res = await deleteStage("stg-1", "proj-1");
            expect(res.success).toBe(true);
            expect(prisma.stage.delete).toHaveBeenCalledWith({ where: { id: "stg-1" } });
        });
    });
});
