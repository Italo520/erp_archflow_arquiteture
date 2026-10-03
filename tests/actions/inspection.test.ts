import {
  createSiteInspection,
  addPunchListItem,
  resolvePunchListItem,
  updatePunchListItemStatus,
  completeSiteInspection,
  getProjectInspections,
  getProjectPunchListItems,
  deletePunchListItem
} from "@/app/actions/inspection";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    siteInspection: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn()
    },
    punchListItem: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn()
    }
  }
}));

jest.mock("@/lib/server-utils", () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: "user-1", role: "OWNER" } }),
  requireProjectAccess: jest.fn().mockResolvedValue({ user: { id: "user-1", role: "OWNER" } })
}));

jest.mock("@/app/actions/audit", () => ({
  logAudit: jest.fn().mockResolvedValue(true)
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn()
}));

jest.mock("@/lib/storage", () => ({
  DiskStorageProvider: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({
      fileKey: "mock-photo.jpg",
      fileUrl: "/api/storage/download?key=mock-photo.jpg"
    })
  }))
}));

describe("Site Inspection Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSiteInspection", () => {
    it("deve criar vistoria técnica com sucesso", async () => {
      const mockInspection = {
        id: "insp-1",
        title: "Vistoria #01",
        date: new Date(),
        status: "DRAFT",
        projectId: "proj-1",
        inspectorId: "user-1"
      };

      (prisma.siteInspection.create as jest.Mock).mockResolvedValue(mockInspection);

      const res = await createSiteInspection("proj-1", {
        title: "Vistoria #01",
        weatherCondition: "Ensolarado"
      });

      expect(res.ok).toBe(true);
      expect(res.data).toEqual(mockInspection);
      expect(prisma.siteInspection.create).toHaveBeenCalled();
    });

    it("deve rejeitar vistoria com dados inválidos", async () => {
      const res = await createSiteInspection("proj-1", {
        title: ""
      });

      expect(res.ok).toBe(false);
      expect(res.errors).toBeDefined();
    });
  });

  describe("addPunchListItem", () => {
    it("deve cadastrar item de pendência com foto do Antes", async () => {
      (prisma.siteInspection.findUnique as jest.Mock).mockResolvedValue({
        id: "insp-1",
        projectId: "proj-1"
      });

      const mockItem = {
        id: "item-1",
        environment: "Cozinha",
        contractorTrade: "Gesso",
        contractorName: "Gesso Silva",
        description: "Forro trincado",
        severity: "HIGH",
        status: "PENDING",
        beforePhotoUrl: "/api/storage/download?key=mock-photo.jpg",
        inspectionId: "insp-1",
        projectId: "proj-1"
      };

      (prisma.punchListItem.create as jest.Mock).mockResolvedValue(mockItem);

      const formData = new FormData();
      formData.append("environment", "Cozinha");
      formData.append("contractorTrade", "Gesso");
      formData.append("contractorName", "Gesso Silva");
      formData.append("description", "Forro trincado");
      formData.append("severity", "HIGH");
      formData.append("beforePhoto", new Blob(["fake-image-bytes"], { type: "image/jpeg" }), "antes.jpg");

      const res = await addPunchListItem("insp-1", formData);

      expect(res.ok).toBe(true);
      expect(res.data).toEqual(mockItem);
      expect(prisma.punchListItem.create).toHaveBeenCalled();
    });

    it("deve rejeitar item sem foto do Antes", async () => {
      (prisma.siteInspection.findUnique as jest.Mock).mockResolvedValue({
        id: "insp-1",
        projectId: "proj-1"
      });

      const formData = new FormData();
      formData.append("environment", "Cozinha");
      formData.append("contractorTrade", "Gesso");
      formData.append("description", "Forro trincado");

      const res = await addPunchListItem("insp-1", formData);
      expect(res.ok).toBe(false);
      expect(res.message).toContain("foto do problema (Antes) é obrigatória");
    });
  });

  describe("resolvePunchListItem", () => {
    it("deve resolver pendência com nota de resolução e foto do Depois", async () => {
      const existingItem = {
        id: "item-1",
        projectId: "proj-1",
        status: "PENDING",
        afterPhotoUrl: null
      };

      const resolvedItem = {
        ...existingItem,
        status: "RESOLVED",
        resolutionNotes: "Forro reparado com junta de dilatação",
        afterPhotoUrl: "/api/storage/download?key=mock-photo.jpg",
        resolvedAt: new Date()
      };

      (prisma.punchListItem.findUnique as jest.Mock).mockResolvedValue(existingItem);
      (prisma.punchListItem.update as jest.Mock).mockResolvedValue(resolvedItem);

      const formData = new FormData();
      formData.append("resolutionNotes", "Forro reparado com junta de dilatação");
      formData.append("afterPhoto", new Blob(["fake-after-bytes"], { type: "image/jpeg" }), "depois.jpg");

      const res = await resolvePunchListItem("item-1", formData);

      expect(res.ok).toBe(true);
      expect(res.data?.status).toBe("RESOLVED");
      expect(prisma.punchListItem.update).toHaveBeenCalled();
    });
  });

  describe("completeSiteInspection", () => {
    it("deve marcar vistoria como COMPLETED", async () => {
      (prisma.siteInspection.findUnique as jest.Mock).mockResolvedValue({
        id: "insp-1",
        projectId: "proj-1"
      });

      (prisma.siteInspection.update as jest.Mock).mockResolvedValue({
        id: "insp-1",
        status: "COMPLETED"
      });

      const res = await completeSiteInspection("insp-1");
      expect(res.ok).toBe(true);
      expect(res.data?.status).toBe("COMPLETED");
    });
  });

  describe("Consultas e Deleções", () => {
    it("getProjectInspections retorna lista de vistorias", async () => {
      const mockList = [{ id: "insp-1", title: "Vistoria 1" }];
      (prisma.siteInspection.findMany as jest.Mock).mockResolvedValue(mockList);

      const res = await getProjectInspections("proj-1");
      expect(res.ok).toBe(true);
      expect(res.data).toEqual(mockList);
    });

    it("getProjectPunchListItems retorna itens de pendência", async () => {
      const mockItems = [{ id: "item-1", environment: "Sala" }];
      (prisma.punchListItem.findMany as jest.Mock).mockResolvedValue(mockItems);

      const res = await getProjectPunchListItems("proj-1");
      expect(res.ok).toBe(true);
      expect(res.data).toEqual(mockItems);
    });

    it("deletePunchListItem exclui item com sucesso", async () => {
      (prisma.punchListItem.findUnique as jest.Mock).mockResolvedValue({
        id: "item-1",
        projectId: "proj-1"
      });
      (prisma.punchListItem.delete as jest.Mock).mockResolvedValue({ id: "item-1" });

      const res = await deletePunchListItem("item-1");
      expect(res.ok).toBe(true);
    });
  });
});
