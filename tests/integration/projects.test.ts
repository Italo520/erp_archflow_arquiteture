import { createProject, updateProject, duplicateProject, listProjects, deleteProject } from "@/app/actions/project";
import { prisma } from "@/lib/prisma";

// Mock authentication
jest.mock('@/auth', () => ({
    auth: jest.fn(() => Promise.resolve({
        user: { id: 'a8d6707e-8405-422b-b5bb-99b6dec005c1', email: 'test@example.com' }
    }))
}));

describe("Project Management Integration Tests", () => {
    let testProjectId: string;

    it("should create a new project", async () => {
        const projectData = {
            ownerId: "a8d6707e-8405-422b-b5bb-99b6dec005c1",
            name: "Integração Teste",
            status: "PLANNING",
        };

        console.log("Calling createProject with:", projectData);
        const result = await createProject(projectData as any);
        console.log("Result received:", result);

        expect(result).toBeDefined();
        if ('error' in result) {
            throw new Error(`Failed to create project: ${JSON.stringify(result.error)}`);
        }
        expect(result.success).toBe(true);
        testProjectId = result.data.id;
    });

    it("should list projects", async () => {
        const result = await listProjects();
        if ('error' in result) {
            throw new Error(`Failed to list projects: ${result.error}`);
        }
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThan(0);
    });

    it("should update project", async () => {
        const result = await updateProject(testProjectId, { id: testProjectId, name: "Updated" } as any);
        if ('error' in result) {
            throw new Error(`Failed to update project: ${JSON.stringify(result.error)}`);
        }
        expect(result.success).toBe(true);
        expect(result.data.name).toBe("Updated");
    });

    it("should duplicate project", async () => {
        const result = await duplicateProject(testProjectId, "Copy");
        if ('error' in result) {
            throw new Error(`Failed to duplicate project: ${result.error}`);
        }
        expect(result.success).toBe(true);
        expect(result.data.name).toBe("Copy");
    });

    it("should delete project", async () => {
        const result = await deleteProject(testProjectId);
        if ('error' in result) {
            throw new Error(`Failed to delete project: ${result.error}`);
        }
        expect(result.success).toBe(true);
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });
});
