import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { prisma } from "./prisma";
import { hasGlobalPermission } from "./permissions";

export async function requireAuth() {
    const session = await auth();
    if (!session || !session.user || !session.user.id || !session.user.role) {
        throw new Error("Unauthorized: User not authenticated or missing required fields");
    }
    return session;
}

export async function requireProjectAccess(projectId: string, allowedRoles: Role[]) {
    const session = await requireAuth();
    const userId = session.user.id as string;
    const userRole = session.user.role as Role;

    console.log("[DEBUG] requireProjectAccess - UserID:", userId, "UserRole:", userRole, "SessionRole:", session.user?.role);

    // Administradores globais (OWNER) do escritório têm acesso total a qualquer projeto
    if (userRole === Role.OWNER) {
        return session;
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
    });

    if (!project) {
        throw new Error("Not Found: Project does not exist");
    }

    // O dono do projeto implicitamente tem permissão total para o projeto
    if (project.ownerId === userId) {
        return session;
    }

    const member = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId,
                projectId
            }
        }
    });

    if (!member) {
        throw new Error("Forbidden: User is not a member of this project");
    }

    if (!allowedRoles.includes(member.role)) {
        throw new Error("Forbidden: User does not have the required role for this project");
    }

    return session;
}

export async function withPermission<T>(action: (session: any) => Promise<T>, allowedRoles: Role[]): Promise<T> {
    const session = await requireAuth();
    
    if (!hasGlobalPermission(session.user.role as Role, allowedRoles)) {
        throw new Error("Forbidden: User does not have the required global role");
    }

    return action(session);
}