import { Role } from "@prisma/client";

export function canCreateProject(role: Role) {
    return role === Role.OWNER || role === Role.EDITOR;
}

export function canDeleteProject(role: Role) {
    return role === Role.OWNER;
}

export function canManageTeam(role: Role) {
    return role === Role.OWNER;
}

export function canEditTask(role: Role) {
    return role === Role.OWNER || role === Role.EDITOR;
}

export function canDeleteTask(role: Role) {
    return role === Role.OWNER || role === Role.EDITOR;
}

export function canCreateClient(role: Role) {
    return role === Role.OWNER || role === Role.EDITOR;
}

// Helper to check if user has access to a project
export function hasProjectAccess(userRole: Role, requiredRole: Role): boolean {
    if (userRole === Role.OWNER) return true;
    if (userRole === Role.EDITOR) return requiredRole !== Role.OWNER;
    if (userRole === Role.VIEWER) return requiredRole === Role.VIEWER;
    return false;
}

export function hasGlobalPermission(userRole: Role, allowedRoles: Role[]): boolean {
    return allowedRoles.includes(userRole);
}
