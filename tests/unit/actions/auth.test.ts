import { signUp, getCurrentUser, updateProfile, requestPasswordReset, resetPassword, signIn, signOut } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { auth, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "@/auth";
import bcrypt from "bcryptjs";

jest.mock("@/lib/prisma", () => ({
    prisma: {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        passwordResetToken: {
            deleteMany: jest.fn(),
            create: jest.fn(),
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
        $transaction: jest.fn((promises) => Promise.all(promises)),
    },
}));

jest.mock("bcryptjs", () => ({
    hash: jest.fn().mockResolvedValue("hashed_password_123"),
}));

describe("Auth Server Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("signUp", () => {
        it("should return validation error for invalid data", async () => {
            const result = await signUp({
                name: "A", // too short
                email: "invalid-email",
                password: "123", // too short
            });
            expect(result.error).toBeDefined();
        });

        it("should return error if user already exists", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "u-1", email: "existing@archflow.com" });

            const result = await signUp({
                name: "Arquitetura Teste",
                email: "existing@archflow.com",
                password: "password123",
            });

            expect(result.error).toBe("User already exists");
        });

        it("should create user and return success", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            (prisma.user.create as jest.Mock).mockResolvedValue({
                id: "u-2",
                email: "novo@archflow.com",
                fullName: "Novo Usuário",
                role: "OWNER",
            });

            const result = await signUp({
                name: "Novo Usuário",
                email: "novo@archflow.com",
                password: "password123",
            });

            expect(result.success).toBe(true);
            expect(prisma.user.create).toHaveBeenCalledWith({
                data: {
                    email: "novo@archflow.com",
                    fullName: "Novo Usuário",
                    passwordHash: "hashed_password_123",
                    role: "OWNER",
                },
            });
        });
    });

    describe("getCurrentUser", () => {
        it("should return current session user", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-1", email: "user@archflow.com", name: "User 1" },
            });

            const user = await getCurrentUser();
            expect(user).toEqual({ id: "user-1", email: "user@archflow.com", name: "User 1" });
        });

        it("should return undefined if no session exists", async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const user = await getCurrentUser();
            expect(user).toBeUndefined();
        });
    });

    describe("updateProfile", () => {
        it("should return Unauthorized when no session", async () => {
            (auth as jest.Mock).mockResolvedValue(null);

            const res = await updateProfile({ fullName: "Novo Nome" });
            expect(res.error).toBe("Unauthorized");
        });

        it("should update user profile successfully", async () => {
            (auth as jest.Mock).mockResolvedValue({
                user: { id: "user-1", email: "user@archflow.com" },
            });
            (prisma.user.update as jest.Mock).mockResolvedValue({
                id: "user-1",
                fullName: "Novo Nome",
                email: "user@archflow.com",
            });

            const res = await updateProfile({ fullName: "Novo Nome" });
            expect(res.success).toBe(true);
            expect(res.data?.fullName).toBe("Novo Nome");
        });
    });

    describe("requestPasswordReset", () => {
        it("should return error for invalid email format", async () => {
            const res = await requestPasswordReset({ email: "invalid-email" });
            expect(res.error).toBe("Formato de e-mail inválido.");
        });

        it("should handle non-existent user with generic success message", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await requestPasswordReset({ email: "notfound@archflow.com" });
            expect(res.success).toBe(true);
        });

        it("should create reset token when user exists", async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: "user-1",
                email: "user@archflow.com",
            });
            (prisma.passwordResetToken.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });
            (prisma.passwordResetToken.create as jest.Mock).mockResolvedValue({
                id: "t-1",
                email: "user@archflow.com",
                token: "token-123",
            });

            const res = await requestPasswordReset({ email: "user@archflow.com" });
            expect(res.success).toBe(true);
            expect(prisma.passwordResetToken.create).toHaveBeenCalled();
        });
    });

    describe("resetPassword", () => {
        it("should reject passwords shorter than 6 characters", async () => {
            const res = await resetPassword({ password: "123", token: "tok-1" });
            expect(res.error).toBe("A senha deve ter pelo menos 6 caracteres.");
        });

        it("should return error if token is not found", async () => {
            (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await resetPassword({ password: "novasenha123", token: "invalid-tok" });
            expect(res.error).toBe("Token inválido ou já utilizado.");
        });

        it("should return error if token is expired", async () => {
            (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
                id: "tok-1",
                email: "user@archflow.com",
                token: "tok-1",
                expires: new Date(Date.now() - 10000), // Expired
            });

            const res = await resetPassword({ password: "novasenha123", token: "tok-1" });
            expect(res.error).toBe("Token expirado. Solicite um novo link.");
        });

        it("should reset password and delete token on success", async () => {
            (prisma.passwordResetToken.findUnique as jest.Mock).mockResolvedValue({
                id: "tok-1",
                email: "user@archflow.com",
                token: "tok-1",
                expires: new Date(Date.now() + 3600000), // Valid
            });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue({
                id: "user-1",
                email: "user@archflow.com",
            });

            const res = await resetPassword({ password: "novasenha123", token: "tok-1" });
            expect(res.success).toBe(true);
            expect(res.message).toBe("Senha atualizada com sucesso!");
        });
    });

    describe("signIn and signOut", () => {
        it("should delegate to nextAuthSignIn and nextAuthSignOut", async () => {
            (nextAuthSignIn as jest.Mock).mockResolvedValue({ ok: true });
            (nextAuthSignOut as jest.Mock).mockResolvedValue({ ok: true });

            await signIn("credentials", { redirect: false });
            expect(nextAuthSignIn).toHaveBeenCalledWith("credentials", { redirect: false });

            await signOut();
            expect(nextAuthSignOut).toHaveBeenCalled();
        });
    });
});
