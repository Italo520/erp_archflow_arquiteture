import {
    clientSchema,
    activitySchema,
    projectSchema,
    taskSchema,
    deliverableSchema,
    timeLogSchema,
    budgetSchema,
    estimateSchema,
} from "@/lib/validations";
import {
    ActivityType,
    ClientStatus,
    ClientLegalType,
    ClientCategory,
    Priority,
    ArchitecturalStyle,
    ConstructionType,
    DeliverableType,
    DeliverableStatus,
    TimeLogCategory,
} from "@prisma/client";

const VALID_UUID_1 = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const VALID_UUID_2 = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";

describe("Validations Suite (PRD v3.0)", () => {
    describe("Client Schema", () => {
        it("should validate a correct client PF", () => {
            const validClient = {
                name: "Mariana Vasconcelos",
                email: "mariana@archflow.com",
                legalType: ClientLegalType.PF,
                status: ClientStatus.ACTIVE,
                category: ClientCategory.RESIDENTIAL,
            };
            const result = clientSchema.safeParse(validClient);
            expect(result.success).toBe(true);
        });

        it("should validate client PJ with full fields", () => {
            const validPJ = {
                name: "Construtora Alfa",
                email: "contato@alfa.com.br",
                legalType: ClientLegalType.PJ,
                razaoSocial: "Alfa Empreendimentos SA",
                category: ClientCategory.COMMERCIAL,
                status: ClientStatus.ACTIVE,
                address: {
                    street: "Av Paulista",
                    number: "1000",
                    city: "São Paulo",
                    state: "SP",
                    cep: "01310-100",
                },
            };
            const result = clientSchema.safeParse(validPJ);
            expect(result.success).toBe(true);
        });

        it("should fail with invalid email", () => {
            const result = clientSchema.safeParse({
                name: "Acme Corp",
                email: "not-an-email",
            });
            expect(result.success).toBe(false);
        });

        it("should fail with short name (< 2 chars)", () => {
            const result = clientSchema.safeParse({
                name: "A",
                email: "contact@acme.com",
            });
            expect(result.success).toBe(false);
        });
    });

    describe("Project Schema", () => {
        it("should validate an architectural project with all specifics", () => {
            const validProject = {
                name: "Residência Alphaville",
                architecturalStyle: ArchitecturalStyle.CONTEMPORANEO,
                constructionType: ConstructionType.CONCRETO_ARMADO,
                totalArea: 350.5,
                numberOfFloors: 2,
                numberOfRooms: 4,
                hasBasement: false,
                hasGarage: true,
                parkingSpots: 3,
                plannedCost: 250000,
                ownerId: VALID_UUID_1,
            };
            const result = projectSchema.safeParse(validProject);
            expect(result.success).toBe(true);
        });

        it("should fail project without a valid name", () => {
            const invalidProject = {
                name: "",
            };
            const result = projectSchema.safeParse(invalidProject);
            expect(result.success).toBe(false);
        });
    });

    describe("Task Schema", () => {
        it("should validate a complete task", () => {
            const validTask = {
                title: "Detalhamento de Esquadrias",
                priority: Priority.HIGH,
                projectId: VALID_UUID_1,
                stageId: VALID_UUID_2,
                dueDate: new Date(),
                tags: ["detalhamento", "esquadrias"],
            };
            const result = taskSchema.safeParse(validTask);
            expect(result.success).toBe(true);
        });

        it("should reject task without title", () => {
            const invalidTask = {
                projectId: VALID_UUID_1,
                stageId: VALID_UUID_2,
            };
            const result = taskSchema.safeParse(invalidTask);
            expect(result.success).toBe(false);
        });
    });

    describe("Activity Schema", () => {
        it("should validate a correct activity", () => {
            const validActivity = {
                type: ActivityType.MEETING,
                title: "Reunião de Briefing Inicial",
                startTime: new Date(),
                duration: 90,
                location: "Escritório Central",
            };
            const result = activitySchema.safeParse(validActivity);
            expect(result.success).toBe(true);
        });

        it("should fail validation if missing title", () => {
            const invalidActivity = {
                type: ActivityType.CALL,
                startTime: new Date(),
            };
            const result = activitySchema.safeParse(invalidActivity);
            expect(result.success).toBe(false);
        });
    });

    describe("Deliverable Schema", () => {
        it("should validate deliverable with version and status", () => {
            const validDeliv = {
                name: "Render 3D Fachada Principal",
                type: DeliverableType.RENDER_3D,
                fileUrl: "https://storage.archflow.com/renders/fachada-v1.png",
                fileSize: 4500000,
                version: 1,
                status: DeliverableStatus.DRAFT,
                taskId: VALID_UUID_1,
                projectId: VALID_UUID_2,
            };
            const result = deliverableSchema.safeParse(validDeliv);
            expect(result.success).toBe(true);
        });
    });

    describe("TimeLog Schema", () => {
        it("should validate time log with billable calculation attributes", () => {
            const validTimeLog = {
                duration: 3.5,
                category: TimeLogCategory.DESIGN,
                projectId: VALID_UUID_1,
                date: new Date(),
                billable: true,
                billRate: 180,
                description: "Modelagem 3D volumétrica",
            };
            const result = timeLogSchema.safeParse(validTimeLog);
            expect(result.success).toBe(true);
        });

        it("should fail for duration <= 0", () => {
            const invalidTimeLog = {
                duration: 0,
                category: TimeLogCategory.DESIGN,
                projectId: VALID_UUID_1,
                date: new Date(),
            };
            const result = timeLogSchema.safeParse(invalidTimeLog);
            expect(result.success).toBe(false);
        });
    });

    describe("Budget & Estimate Schemas", () => {
        it("should validate budget schema", () => {
            const validBudget = {
                totalBudget: 150000,
                projectId: VALID_UUID_1,
            };
            const result = budgetSchema.safeParse(validBudget);
            expect(result.success).toBe(true);
        });

        it("should validate estimate schema", () => {
            const validEstimate = {
                estimatedHours: 120,
                estimatedCost: 24000,
                projectId: VALID_UUID_1,
                notes: "Estimativa baseada em projetos similares",
            };
            const result = estimateSchema.safeParse(validEstimate);
            expect(result.success).toBe(true);
        });
    });
});
