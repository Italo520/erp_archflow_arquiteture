"use server";

import { signIn as nextAuthSignIn, signOut as nextAuthSignOut, auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

const signUpSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    companyName: z.string().optional(),
    phone: z.string().optional(),
    businessType: z.string().optional(),
});

const updateProfileSchema = z.object({
    fullName: z.string().min(2).optional(),
    email: z.string().email().optional(),
    // Add other profile fields as needed
});

const forgotPasswordSchema = z.object({
    email: z.string().email(),
});

const resetPasswordSchema = z.object({
    password: z.string().min(6),
    token: z.string(),
});


export async function signIn(provider: string, options?: any) {
    return await nextAuthSignIn(provider, options);
}

export async function signOut() {
    return await nextAuthSignOut();
}

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        await nextAuthSignIn("credentials", formData);
    } catch (error) {
        if ((error as Error).message.includes("CredentialsSignin")) {
            return "CredentialSignin";
        }
        throw error;
    }
}

export async function signUp(data: z.infer<typeof signUpSchema>) {
    const result = signUpSchema.safeParse(data);
    if (!result.success) {
        return { error: result.error.flatten().fieldErrors };
    }

    const { email, password, name } = result.data;

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "User already exists" };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                email,
                fullName: name,
                passwordHash,
                // These fields are not in the current Schema, but we accept them to avoid errors.
                // In the future, they could be mapped to a Company model or user metadata.
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to sign up:", error);
        return { error: "Failed to create account." };
    }
}

export async function getCurrentUser() {
    const session = await auth();
    return session?.user;
}

export async function updateProfile(data: z.infer<typeof updateProfileSchema>) {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    const result = updateProfileSchema.safeParse(data);
    if (!result.success) return { error: result.error.flatten().fieldErrors };

    try {
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: result.data,
        });

        revalidatePath("/profile");
        return { success: true, data: updatedUser };
    } catch (error) {
        console.error("Update profile failed:", error);
        return { error: "Failed to update profile" };
    }
}

export async function requestPasswordReset(data: z.infer<typeof forgotPasswordSchema>) {
    const result = forgotPasswordSchema.safeParse(data);
    if (!result.success) {
        return { error: "Formato de e-mail inválido." };
    }

    const { email } = result.data;

    try {
        const user = await (prisma as any).user.findUnique({
            where: { email },
        });

        if (!user) {
            // Avoid leaking user existence, but return a generic success message
            return { success: true, message: "Se este e-mail estiver cadastrado, um link de recuperação será enviado." };
        }

        // Generate token
        const token = crypto.randomUUID();
        const expires = new Date(Date.now() + 3600 * 1000); // 1 hour

        // Save token (delete existing ones for this email first)
        await (prisma as any).passwordResetToken.deleteMany({
            where: { email },
        });

        await (prisma as any).passwordResetToken.create({
            data: {
                email,
                token,
                expires,
            },
        });

        // Send email (MOCK)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const resetLink = `${baseUrl}/reset-password?token=${token}`;

        console.log("\n--- PASSWORD RESET ---");
        console.log(`User: ${email}`);
        console.log(`Link: ${resetLink}`);
        console.log("----------------------\n");

        return { success: true, message: "Link de recuperação enviado para o seu e-mail." };
    } catch (error) {
        console.error("Password reset request failed:", error);
        return { error: "Ocorreu um erro ao processar a solicitação." };
    }
}

export async function resetPassword(data: z.infer<typeof resetPasswordSchema>) {
    const result = resetPasswordSchema.safeParse(data);
    if (!result.success) {
        return { error: "A senha deve ter pelo menos 6 caracteres." };
    }

    const { password, token } = result.data;

    try {
        // Find token
        const existingToken = await (prisma as any).passwordResetToken.findUnique({
            where: { token },
        });

        if (!existingToken) {
            return { error: "Token inválido ou já utilizado." };
        }

        // Check expiration
        if (new Date(existingToken.expires).getTime() < Date.now()) {
            return { error: "Token expirado. Solicite um novo link." };
        }

        // Find user
        const user = await (prisma as any).user.findUnique({
            where: { email: existingToken.email },
        });

        if (!user) {
            return { error: "Usuário não encontrado." };
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(password, 10);

        // Update user and delete token
        await (prisma as any).$transaction([
            (prisma as any).user.update({
                where: { id: user.id },
                data: { passwordHash },
            }),
            (prisma as any).passwordResetToken.delete({
                where: { id: existingToken.id },
            }),
        ]);

        return { success: true, message: "Senha atualizada com sucesso!" };
    } catch (error) {
        console.error("Password reset failed:", error);
        return { error: "Falha ao redefinir a senha." };
    }
}

