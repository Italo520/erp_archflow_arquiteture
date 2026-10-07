import { getSystemNotificationRules, updateSystemNotificationRule, getUserNotificationPreferences, updateUserNotificationPreference } from "@/app/actions/notificationSettings";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-utils";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        systemNotificationRule: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
        userNotificationPreference: {
            findMany: jest.fn(),
            upsert: jest.fn(),
        },
    },
}));

jest.mock("@/lib/server-utils", () => ({
    requireAuth: jest.fn(),
}));

describe("Notification Settings Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getSystemNotificationRules", () => {
        it("should forbid non-OWNER users", async () => {
            (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "VIEWER" } });

            const res = await getSystemNotificationRules();
            expect(res.success).toBe(false);
            expect(res.error).toContain("Permissão negada");
        });

        it("should return rules for OWNER user", async () => {
            (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "OWNER" } });
            (prisma.systemNotificationRule.findMany as jest.Mock).mockResolvedValue([
                { id: "r-1", role: "OWNER", eventType: "TASK_ASSIGNED", enabled: true },
            ]);

            const res = await getSystemNotificationRules();
            expect(res.success).toBe(true);
            expect(res.data).toHaveLength(1);
        });
    });

    describe("updateSystemNotificationRule", () => {
        it("should upsert rule for OWNER", async () => {
            (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "u-1", role: "OWNER" } });
            (prisma.systemNotificationRule.upsert as jest.Mock).mockResolvedValue({
                id: "r-1",
                role: "EDITOR",
                eventType: "COMMENT",
                enabled: false,
            });

            const res = await updateSystemNotificationRule("EDITOR", "COMMENT", false);
            expect(res.success).toBe(true);
            expect(prisma.systemNotificationRule.upsert).toHaveBeenCalled();
        });
    });

    describe("getUserNotificationPreferences and updateUserNotificationPreference", () => {
        it("should retrieve preferences for authenticated user", async () => {
            (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "u-2", role: "EDITOR" } });
            (prisma.userNotificationPreference.findMany as jest.Mock).mockResolvedValue([
                { id: "p-1", userId: "u-2", eventType: "MENTION", enabled: true },
            ]);

            const res = await getUserNotificationPreferences();
            expect(res.success).toBe(true);
            expect(res.data).toHaveLength(1);
        });

        it("should upsert preference for user", async () => {
            (requireAuth as jest.Mock).mockResolvedValue({ user: { id: "u-2", role: "EDITOR" } });
            (prisma.userNotificationPreference.upsert as jest.Mock).mockResolvedValue({
                id: "p-1",
                userId: "u-2",
                eventType: "DEADLINE_APPROACHING",
                enabled: false,
            });

            const res = await updateUserNotificationPreference("DEADLINE_APPROACHING", false);
            expect(res.success).toBe(true);
            expect(res.data?.enabled).toBe(false);
        });
    });
});
