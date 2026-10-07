import { Role } from "@prisma/client";
import {
    canCreateProject,
    canDeleteProject,
    canManageTeam,
    canEditTask,
    canDeleteTask,
    canCreateClient,
    hasProjectAccess
} from "@/lib/permissions";

describe("Permissions", () => {
    describe("Project Permissions", () => {
        it("should allow OWNER and EDITOR to create projects", () => {
            expect(canCreateProject(Role.OWNER)).toBe(true);
            expect(canCreateProject(Role.EDITOR)).toBe(true);
            expect(canCreateProject(Role.VIEWER)).toBe(false);
        });

        it("should allow only OWNER to delete projects", () => {
            expect(canDeleteProject(Role.OWNER)).toBe(true);
            expect(canDeleteProject(Role.EDITOR)).toBe(false);
            expect(canDeleteProject(Role.VIEWER)).toBe(false);
        });
    });

    describe("Task Permissions", () => {
        it("should allow OWNER and EDITOR to edit tasks", () => {
            expect(canEditTask(Role.OWNER)).toBe(true);
            expect(canEditTask(Role.EDITOR)).toBe(true);
            expect(canEditTask(Role.VIEWER)).toBe(false);
        });
    });

    describe("Project Access", () => {
        it("OWNER should have access to everything", () => {
            expect(hasProjectAccess(Role.OWNER, Role.OWNER)).toBe(true);
            expect(hasProjectAccess(Role.OWNER, Role.VIEWER)).toBe(true);
        });

        it("EDITOR should not have access to OWNER actions if strict match needed", () => {
            // Logic depends on how hasProjectAccess is used. 
            // Current implementation: if user is EDITOR, requiredRole !== OWNER
            expect(hasProjectAccess(Role.EDITOR, Role.OWNER)).toBe(false);
            expect(hasProjectAccess(Role.EDITOR, Role.EDITOR)).toBe(true);
        });
    });
});
