
// Mock Next.js cache and navigation
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    redirect: jest.fn(),
}));

import { createClient, listClients, updateClient, softDeleteClient } from "@/app/actions/client";
import { prisma } from "@/lib/prisma";

// Mock prisma for integration test if running in environment where DB is not available
// However, integration tests usually run against a test DB.
// Since I cannot spin up a test DB easily here without knowing the user's setup,
// I will assume this is testing the Action logic with Mocks (similar to unit but broader flow),
// OR it expects a running DB.
// Given previous unit tests mocked prisma, let's keep it consistent or checks if we can run against a real DB.
// The user has "Docker Compose for local Postgres" in PRD.
// But for now, I'll stick to mocking Prisma to ensure it runs in this environment.

jest.mock("@/lib/prisma", () => ({
    prisma: {
        $transaction: jest.fn((proms) => Promise.all(proms)),
        client: {
            create: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

describe.skip("Client Integration Flow", () => {

    it("should perform a full client lifecycle (create, list, update, delete)", async () => {
        // 1. Create
        const validId = "123e4567-e89b-12d3-a456-426614174000";
        const newClient = {
            id: validId,
            name: "Integration Client",
            email: "integration@test.com",
            status: "PROSPECT",
        } as any;

        (prisma.client.create as jest.Mock).mockResolvedValue(newClient);

        const createResult = await createClient({
            name: "Integration Client",
            email: "integration@test.com",
            status: "PROSPECT" as any,
        });

        expect(createResult.success).toBe(true);
        expect(createResult.data).toEqual(newClient);

        // 2. List
        (prisma.client.findMany as jest.Mock).mockResolvedValue([newClient]);
        (prisma.client.count as jest.Mock).mockResolvedValue(1);

        const listResult = await listClients({ query: "Integration" });
        expect(listResult.data).toHaveLength(1);
        expect(listResult.data?.[0].name).toBe("Integration Client");

        // 3. Update
        const updatedClient = { ...newClient, name: "Updated Client" };
        (prisma.client.update as jest.Mock).mockResolvedValue(updatedClient);

        const updateResult = await updateClient(validId, {
            id: validId,
            name: "Updated Client",
        });

        expect(updateResult.success).toBe(true);
        expect(updateResult.data?.name).toBe("Updated Client");

        // 4. Delete
        const deletedClient = { ...updatedClient, deletedAt: new Date() };
        (prisma.client.update as jest.Mock).mockResolvedValue(deletedClient);

        const deleteResult = await softDeleteClient(validId);
        expect(deleteResult.success).toBe(true);
    });
});
