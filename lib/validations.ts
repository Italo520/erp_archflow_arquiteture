import { z } from "zod";
import {
    Priority,
    ClientLegalType,
    ClientCategory,
    ClientStatus,
    ContactPreference,
    ActivityType,
    ActivityStatus,
    TimeLogCategory,
    DeliverableType,
    DeliverableStatus,
    ArchitecturalStyle,
    ConstructionType,
    ProjectVisibility
} from "@prisma/client";

// --- Enums as Zod Enums ---
export const PriorityEnum = z.nativeEnum(Priority);

export const ClientLegalTypeEnum = z.nativeEnum(ClientLegalType);
export const ClientCategoryEnum = z.nativeEnum(ClientCategory);
export const ClientStatusEnum = z.nativeEnum(ClientStatus);
export const ContactPreferenceEnum = z.nativeEnum(ContactPreference);
export const ActivityTypeEnum = z.nativeEnum(ActivityType);
export const ActivityStatusEnum = z.nativeEnum(ActivityStatus);
export const TimeLogCategoryEnum = z.nativeEnum(TimeLogCategory);
export const DeliverableTypeEnum = z.nativeEnum(DeliverableType);
export const DeliverableStatusEnum = z.nativeEnum(DeliverableStatus);
export const ArchitecturalStyleEnum = z.nativeEnum(ArchitecturalStyle);
export const ConstructionTypeEnum = z.nativeEnum(ConstructionType);
export const ProjectVisibilityEnum = z.nativeEnum(ProjectVisibility);

// --- Client Schemas ---
// --- Address Schema ---
export const addressSchema = z.object({
    cep: z.string().optional().or(z.literal("")),
    street: z.string().optional().or(z.literal("")),
    number: z.string().optional().or(z.literal("")),
    complement: z.string().optional().or(z.literal("")),
    neighborhood: z.string().optional().or(z.literal("")),
    city: z.string().optional().or(z.literal("")),
    state: z.string().optional().or(z.literal("")),
});

// --- Client Schemas ---
export const clientSchema = z.object({
    name: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Endereço de email inválido"),
    phone: z.string().optional().nullable(),
    website: z.string().url("URL inválida").optional().nullable().or(z.literal("")),
    legalType: ClientLegalTypeEnum.optional().nullable(),
    document: z.string().optional().nullable(),
    razaoSocial: z.string().optional().nullable(),
    inscricaoEstadual: z.string().optional().nullable(),
    address: addressSchema.optional().nullable(),
    geoLocation: z.any().optional().nullable(),
    category: ClientCategoryEnum.optional().nullable(),
    status: ClientStatusEnum.default(ClientStatus.PROSPECT),
    rating: z.number().min(0).max(5).optional().nullable(),
    totalSpent: z.number().nonnegative().optional().nullable(),
    avatar: z.string().url("URL de imagem inválida").optional().nullable().or(z.literal("")),
    notes: z.string().optional().nullable(),
    contactPreference: ContactPreferenceEnum.optional().nullable(),
    userId: z.string().uuid().optional().nullable(),
    tags: z.array(z.string()).optional(),
    metadata: z.any().optional().nullable(),
});

export const updateClientSchema = clientSchema.partial().extend({
    id: z.string().uuid(),
});

// --- Activity Schemas ---
export const activityBaseSchema = z.object({
    type: ActivityTypeEnum,
    title: z.string().min(2, "O título é obrigatório"),
    description: z.string().optional().nullable(),
    duration: z.number().int().nonnegative().optional().nullable(), // minutes
    startTime: z.coerce.date(),
    endTime: z.coerce.date().optional().nullable(),
    location: z.string().optional().nullable(),
    participants: z.array(z.string()).optional(),
    clientId: z.string().uuid().optional().nullable(),
    projectId: z.string().uuid().optional().nullable(),
    taskId: z.string().uuid().optional().nullable(),
    status: ActivityStatusEnum.default(ActivityStatus.SCHEDULED),
    notes: z.string().optional().nullable(),
    attachments: z.array(z.any()).optional(),
});

export const activitySchema = activityBaseSchema.refine((data) => {
    if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, {
    message: "A data/hora de término deve ser após a data/hora de início",
    path: ["endTime"],
});

export const updateActivitySchema = activityBaseSchema.partial().extend({
    id: z.string().uuid(),
});

// --- TimeLog Schemas ---
export const timeLogSchema = z.object({
    duration: z.number().positive("A duração deve ser positiva"), // hours
    category: TimeLogCategoryEnum,
    description: z.string().optional().nullable(),
    date: z.coerce.date(),
    startTime: z.coerce.date().optional().nullable(),
    endTime: z.coerce.date().optional().nullable(),
    projectId: z.string().uuid(),
    taskId: z.string().uuid().optional().nullable(),
    clientId: z.string().uuid().optional().nullable(),
    billable: z.boolean().default(false),
    billRate: z.number().nonnegative().optional().nullable(),
    tags: z.array(z.string()).optional(),
});

export const updateTimeLogSchema = timeLogSchema.partial().extend({
    id: z.string().uuid(),
});

// --- Deliverable Schemas ---
export const deliverableSchema = z.object({
    name: z.string().min(2, "O nome é obrigatório"),
    type: DeliverableTypeEnum,
    description: z.string().optional().nullable(),
    fileUrl: z.string().url("A URL do arquivo é obrigatória"),
    fileSize: z.number().int().nonnegative().optional().nullable(),
    mimeType: z.string().optional().nullable(),
    version: z.number().int().positive().default(1),
    status: DeliverableStatusEnum.default(DeliverableStatus.DRAFT),
    taskId: z.string().uuid(),
    projectId: z.string().uuid(),
    dueDates: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

export const updateDeliverableSchema = deliverableSchema.partial().extend({
    id: z.string().uuid(),
});

// --- Project Schemas ---
export const projectArchitectureSchema = z.object({
    architecturalStyle: ArchitecturalStyleEnum.optional().nullable(),
    constructionType: ConstructionTypeEnum.optional().nullable(),
    numberOfFloors: z.number().int().nonnegative().optional().nullable(),
    numberOfRooms: z.number().int().nonnegative().optional().nullable(),
    hasBasement: z.boolean().default(false),
    hasGarage: z.boolean().default(false),
    parkingSpots: z.number().int().nonnegative().optional().nullable(),
    landscapingArea: z.number().nonnegative().optional().nullable(),
    environmentalLicenseRequired: z.boolean().default(false),
    projectTags: z.array(z.string()).optional(),
    visibility: ProjectVisibilityEnum.default(ProjectVisibility.TEAM),
});

export const projectPhaseSchema = z.object({
    name: z.string().min(2),
    order: z.number().int(),
    startDate: z.coerce.date().optional().nullable(),
    endDate: z.coerce.date().optional().nullable(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).default("PENDING"),
});

export const projectSchema = z.object({
    name: z.string().min(2, "O nome do projeto é obrigatório"),
    clientName: z.string().optional().nullable(),
    status: z.string().default("PLANNING"),
    imageUrl: z.string().url("URL de imagem inválida").optional().nullable().or(z.literal("")),
    clientId: z.string().uuid().optional().nullable(),
    projectType: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    startDate: z.coerce.date().optional().nullable(),
    deliveryDate: z.coerce.date().optional().nullable(), // Legacy field map
    estimatedEndDate: z.coerce.date().optional().nullable(),
    actualEndDate: z.coerce.date().optional().nullable(),
    totalArea: z.number().nonnegative().optional().nullable(),
    plannedCost: z.number().optional().nullable(), // Decimal handled as number in Zod input
    actualCost: z.number().optional().nullable(), // Decimal handled as number in Zod input
    attachedDocuments: z.any().optional().nullable(),
    ownerId: z.string().uuid(),
    // Spread architectural fields
    ...projectArchitectureSchema.shape,
    phases: z.array(projectPhaseSchema).optional(),
});

export const updateProjectSchema = projectSchema.partial().extend({
    id: z.string().uuid(),
    phases: z.array(projectPhaseSchema).optional(),
});

// --- User Schemas ---
export const userSchema = z.object({
    fullName: z.string().min(2, "O nome completo deve ter pelo menos 2 caracteres"),
    email: z.string().email("Endereço de email inválido"),
    passwordHash: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export const updateUserSchema = userSchema.partial().extend({
    id: z.string().uuid(),
});

// --- Task Schemas ---
export const taskAttachmentSchema = z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url("URL de anexo inválida"),
    type: z.string().optional()
});

export const taskCommentSchema = z.object({
    id: z.string(),
    text: z.string().min(1, "O comentário não pode ser vazio"),
    userId: z.string().uuid(),
    userName: z.string(),
    createdAt: z.string()
});

export const taskChecklistItemSchema = z.object({
    id: z.string(),
    text: z.string().min(1, "O item do checklist não pode ser vazio"),
    checked: z.boolean().default(false)
});

export const taskHistoryItemSchema = z.object({
    date: z.string(),
    userId: z.string(),
    userName: z.string(),
    type: z.string(),
    details: z.string()
});

export const taskSchema = z.object({
    title: z.string().min(1, "O título da tarefa é obrigatório"),
    description: z.string().optional().nullable(),
    priority: PriorityEnum.optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),

    tags: z.array(z.string()).optional(),
    attachments: z.array(taskAttachmentSchema).optional().nullable(),
    comments: z.array(taskCommentSchema).optional().nullable(),
    checklist: z.array(taskChecklistItemSchema).optional().nullable(),
    historico: z.array(taskHistoryItemSchema).optional().nullable(),

    projectId: z.string().uuid(),
    stageId: z.string().uuid(),
    assigneeId: z.string().uuid().optional().nullable(),

    position: z.number().int().default(0),
    metadata: z.any().optional().nullable(),
    approvalStatus: z.string().default("PENDING").optional().nullable(),
});

export const updateTaskSchema = taskSchema.partial().extend({
    id: z.string().uuid(),
});
