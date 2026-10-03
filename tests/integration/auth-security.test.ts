import { requireAuth, requireProjectAccess, withPermission } from "@/lib/server-utils";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

jest.mock("@/auth", () => ({
    auth: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
    prisma: {
        project: {
            findUnique: jest.fn(),
        },
        projectMember: {
            findUnique: jest.fn(),
        },
    },
}));

describe("Security & Authorization Integration Tests (RBAC)", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("requireAuth", () => {
        it("should throw error if session is missing or unauthenticated", async () => {
            (auth as jest.Mock).mockResolvedValue(null);
            await expect(requireAuth()).rejects.toThrow("Unauthorized");
        });

        it("should return valid session when authenticated", async () => {
            const mockSession = { user: { id: "u-1", email: "arq@archflow.com", role: Role.OWNER } };
            (auth as jest.Mock).mockResolvedValue(mockSession);

            const session = await requireAuth();
            expect(session).toEqual(mockSession);
        });
    });

    describe("requireProjectAccess", () => {
        it("should grant immediate access to global OWNER", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "owner-global", role: Role.OWNER },
            });

            const session = await requireProjectAccess("proj-1", [Role.EDITOR]);
            expect(session.user.id).toBe("owner-global");
        });

        it("should grant access if user is project owner", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "proj-creator", role: Role.EDITOR },
            });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({
                ownerId: "proj-creator",
            });

            const session = await requireProjectAccess("proj-1", [Role.EDITOR]);
            expect(session.user.id).toBe("proj-creator");
        });

        it("should throw error if project not found", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-regular", role: Role.EDITOR },
            });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(requireProjectAccess("proj-missing", [Role.EDITOR])).rejects.toThrow("Not Found");
        });

        it("should throw error if user is not a member of the project", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-stranger", role: Role.EDITOR },
            });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({
                ownerId: "other-owner",
            });
            (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(requireProjectAccess("proj-1", [Role.EDITOR])).rejects.toThrow("User is not a member");
        });

        it("should allow project member with allowed role", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-member", role: Role.VIEWER },
            });
            (prisma.project.findUnique as jest.Mock).mockResolvedValue({
                ownerId: "other-owner",
            });
            (prisma.projectMember.findUnique as jest.Mock).mockResolvedValue({
                role: Role.EDITOR,
            });

            const session = await requireProjectAccess("proj-1", [Role.EDITOR, Role.OWNER]);
            expect(session.user.id).toBe("user-member");
        });
    });

    describe("withPermission", () => {
        it("should reject action if role does not match required global role", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-viewer", role: Role.VIEWER },
            });

            const mockAction = jest.fn();
            await expect(withPermission(mockAction, [Role.OWNER])).rejects.toThrow("Forbidden");
            expect(mockAction).not.toHaveBeenCalled();
        });

        it("should execute action if role is authorized", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-owner", role: Role.OWNER },
            });

            const mockAction = jest.fn().mockResolvedValue("action_result");
            const res = await withPermission(mockAction, [Role.OWNER]);
            expect(res).toBe("action_result");
        });
    });
});
