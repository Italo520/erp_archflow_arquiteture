"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/server-utils";

export async function listUsers() {
    try {
        await requireAuth();
        const users = await prisma.user.findMany({
            select: {
                id: true,
                fullName: true,
                email: true,
            },
            orderBy: { fullName: "asc" }
        });
        return { success: true, data: users };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
