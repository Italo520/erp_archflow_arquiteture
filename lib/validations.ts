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
    ProjectVisibility,
    BudgetStatus,
    EstimateStatus
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

// --- CPF/CNPJ Helpers ---
function isValidCPF(cpf: string): boolean {
    const clean = cpf.replace(/\D/g, "");
    if (clean.length !== 11) return false;
    
    // CPFs conhecidos inválidos
    if (/^(\d)\1{10}$/.test(clean)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(clean.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(clean.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(clean.charAt(10))) return false;
    
    return true;
}

function isValidCNPJ(cnpj: string): boolean {
    const clean = cnpj.replace(/\D/g, "");
    if (clean.length !== 14) return false;
    
    // CNPJs conhecidos inválidos
    if (/^(\d)\1{13}$/.test(clean)) return false;
    
    // Validação do primeiro dígito
    let size = clean.length - 2;
    let numbers = clean.substring(0, size);
    const digits = clean.substring(size);
    let sum = 0;
    let pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validação do segundo dígito
    size = size + 1;
    numbers = clean.substring(0, size);
    sum = 0;
    pos = size - 7;
    for (let i = size; i >= 1; i--) {
        sum += parseInt(numbers.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

// --- Client Schemas ---
export const clientBaseSchema = z.object({
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

export const clientSchema = clientBaseSchema.refine((data) => {
    if (data.legalType === ClientLegalType.PF && data.document) {
        return isValidCPF(data.document);
    }
    if (data.legalType === ClientLegalType.PJ && data.document) {
        return isValidCNPJ(data.document);
    }
    return true;
}, {
    message: "Documento (CPF/CNPJ) inválido",
    path: ["document"],
});

export const updateClientSchema = clientBaseSchema.partial().extend({
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

// --- Finance Schemas ---
export const BudgetStatusEnum = z.nativeEnum(BudgetStatus);
export const EstimateStatusEnum = z.nativeEnum(EstimateStatus);

export const budgetSchema = z.object({
    totalBudget: z.number().positive("O orçamento deve ser maior que zero"),
    spentAmount: z.number().nonnegative().default(0),
    remainingAmount: z.number().nonnegative().default(0),
    budgetBreakdown: z.any().optional().nullable(),
    status: BudgetStatusEnum.default(BudgetStatus.DRAFT),
    projectId: z.string().uuid(),
});

export const estimateSchema = z.object({
    estimatedHours: z.number().positive("As horas estimadas devem ser maiores que zero").optional().nullable(),
    estimatedCost: z.number().positive("O custo estimado deve ser maior que zero").optional().nullable(),
    actualHours: z.number().nonnegative().optional().nullable(),
    actualCost: z.number().nonnegative().optional().nullable(),
    status: EstimateStatusEnum.default(EstimateStatus.DRAFT),
    notes: z.string().optional().nullable(),
    projectId: z.string().uuid(),
});
