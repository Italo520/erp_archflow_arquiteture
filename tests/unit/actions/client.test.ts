/**
 * @jest-environment node
 */
import { createClient, listClients, updateClient, softDeleteClient } from "@/app/actions/client";
import { prisma } from "@/lib/prisma";

// Mocking prisma
jest.mock("@/lib/prisma", () => ({
    prisma: {
        client: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            findMany: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn((args) => args),
    },
}));

// Mocking revalidatePath
jest.mock("next/cache", () => ({
    revalidatePath: jest.fn(),
}));

describe.skip("Client Actions", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createClient", () => {
        it("should create a client successfully", async () => {
            const mockData = {
                name: "Test Client",
                email: "test@client.com",
                status: "PROSPECT",
            } as any;

            (prisma.client.create as jest.Mock).mockResolvedValue({ id: "1", ...mockData });

            const result = await createClient(mockData);

            expect(prisma.client.create).toHaveBeenCalledWith({ data: mockData });
            expect(result).toEqual({ success: true, data: { id: "1", ...mockData } });
        });

        it("should return validation error for invalid data", async () => {
            const mockData = {
                name: "T", // too short
                email: "invalid-email",
            } as any;

            const result = await createClient(mockData);

            expect(prisma.client.create).not.toHaveBeenCalled();
            expect(result).toHaveProperty("error");
        });
    });

    describe("listClients", () => {
        it("should list clients with default pagination", async () => {
            const mockClients = [{ id: "1", name: "Client 1" }];
            const mockCount = 1;

            (prisma.client.findMany as jest.Mock).mockResolvedValue(mockClients);
            (prisma.client.count as jest.Mock).mockResolvedValue(mockCount);
            (prisma.$transaction as jest.Mock).mockResolvedValue([mockClients, mockCount]);

            const result = await listClients({});

            expect(prisma.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
                skip: 0,
                take: 10,
                where: { deletedAt: null }
            }));
            // @ts-ignore
            expect(result.data).toEqual(mockClients);
            // @ts-ignore
            expect(result.metadata.total).toBe(mockCount);
        });

        it("should filter by status", async () => {
            // Mock needs to return array structure for transaction
            const mockClients = [{ id: "1", name: "Client 1" }];
            const mockCount = 1;
            (prisma.$transaction as jest.Mock).mockResolvedValue([mockClients, mockCount]);

            await listClients({ status: "ACTIVE" });
            expect(prisma.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.objectContaining({ status: "ACTIVE" })
            }));
        });
    });

    describe("updateClient", () => {
        it("should update client successfully", async () => {
            const mockData = { name: "Updated Name" };
            const mockId = "123e4567-e89b-12d3-a456-426614174000"; // Valid UUID

            (prisma.client.update as jest.Mock).mockResolvedValue({ id: mockId, ...mockData });

            const result = await updateClient(mockId, { ...mockData, id: mockId });

            expect(prisma.client.update).toHaveBeenCalledWith({
                where: { id: mockId },
                data: expect.objectContaining({ name: "Updated Name" }),
            });
            expect(result).toEqual({ success: true, data: { id: mockId, ...mockData } });
        });
    });

    describe("softDeleteClient", () => {
        it("should soft delete client", async () => {
            const mockId = "123e4567-e89b-12d3-a456-426614174000";
            (prisma.client.update as jest.Mock).mockResolvedValue({ id: mockId, status: "INACTIVE" });

            const result = await softDeleteClient(mockId);

            expect(prisma.client.update).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: mockId },
                data: expect.objectContaining({
                    status: "INACTIVE",
                    deletedAt: expect.any(Date),
                }),
            }));
            expect(result).toEqual({ success: true });
        });
    });
});
