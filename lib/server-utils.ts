import { auth } from "@/auth";
import { Role } from "@prisma/client";

export async function withPermission<T>(action: (session: any) => Promise<T>, allowedRoles: Role[]): Promise<T> {
    const session = await auth();
    if (!session || !session.user || !session.user.role) {
        throw new Error("Unauthorized: User not authenticated or role not found");
    }

    const { hasGlobalPermission } = await import("@/lib/permissions");
    if (!hasGlobalPermission(session.user.role, allowedRoles)) {
        throw new Error("Forbidden: User does not have the required role");
    }

    return action(session);
}