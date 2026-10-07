import { createNotification } from "@/app/actions/notification";
import { prisma } from "@/lib/prisma";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient, NotificationType } from "@prisma/client";

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

describe("Notification Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should create a notification if user did not opt-out", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" } as any);
        mockPrisma.systemNotificationRule.findUnique.mockResolvedValue(null as any);
        mockPrisma.userNotificationPreference.findUnique.mockResolvedValue(null as any); // Sem opt-out
        mockPrisma.notification.create.mockResolvedValue({ id: "1" } as any);

        const result = await createNotification(
            "user1",
            {
                type: "SYSTEM",
                title: "Test",
                message: "Test notification",
                relatedEntityId: "123",
                relatedEntityType: "PROJECT"
            }
        );

        expect(result.success).toBe(true);
        expect(mockPrisma.notification.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({
                    userId: "user1",
                    type: "SYSTEM",
                    message: "Test notification"
                })
            })
        );
    });

    it("should NOT create a notification if user opted out", async () => {
        mockPrisma.user.findUnique.mockResolvedValue({ role: "ADMIN" } as any);
        mockPrisma.systemNotificationRule.findUnique.mockResolvedValue(null as any);
        mockPrisma.userNotificationPreference.findUnique.mockResolvedValue({
            userId: "user1",
            eventType: "SYSTEM",
            enabled: false
        } as any);

        const result = await createNotification(
            "user1",
            {
                type: "SYSTEM",
                title: "Test",
                message: "Test notification",
                relatedEntityId: "123",
                relatedEntityType: "PROJECT"
            }
        );

        expect(result.success).toBe(true);
        expect(result.message).toBe("Notificação suprimida pela preferência do usuário");
        expect(mockPrisma.notification.create).not.toHaveBeenCalled();
    });
});
