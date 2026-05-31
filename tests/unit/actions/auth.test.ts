/**
 * @jest-environment node
 */
import { requestPasswordReset } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";

// Mocking prisma
jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
        },
        passwordResetToken: {
            deleteMany: jest.fn(),
            create: jest.fn(),
        },
    },
}));

// Mocking console.log
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe("Auth Actions - requestPasswordReset", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        consoleSpy.mockRestore();
    });

    it("should request password reset successfully and NOT log sensitive info", async () => {
        const email = "test@example.com";
        const mockUser = { id: "user-1", email };

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
        (prisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
        (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({ id: "token-1" });

        const result = await requestPasswordReset({ email });

        expect(result.success).toBe(true);
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
        expect(prisma.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { email } });
        expect(prisma.passwordResetToken.create).toHaveBeenCalled();

        // Check that console.log was NOT called with sensitive info
        // Before the fix, it would be called several times.
        // After the fix, it should not be called in the success path.
        const logCalls = consoleSpy.mock.calls.map(call => call[0]);
        const hasSensitiveInfo = logCalls.some(log =>
            typeof log === 'string' && (log.includes("PASSWORD RESET") || log.includes(email) || log.includes("reset-password?token="))
        );

        expect(hasSensitiveInfo).toBe(false);
    });

    it("should return success message even if user does not exist (to avoid enumeration)", async () => {
        const email = "nonexistent@example.com";

        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

        const result = await requestPasswordReset({ email });

        expect(result.success).toBe(true);
        expect(result.message).toContain("Se este e-mail estiver cadastrado");
        expect(prisma.passwordResetToken.create).not.toHaveBeenCalled();
    });
});
