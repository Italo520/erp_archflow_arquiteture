# Plano de Implementação: Módulo de Vistoria Técnica e Lista de Pendências (Punch List)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o módulo completo de Vistoria Técnica e Lista de Pendências (Punch List) com registro mobile de campo (fotos de Antes e Depois), painel de gestão de pendências por ambiente e prestador externo, e emissão de relatórios formais em PDF no ArchFlow ERP.

**Architecture:** Módulo independente associado ao modelo `Project` no Prisma. As fotos são manipuladas pelo `storageProvider` com proteção contra path traversal, as validações usam Zod e todas as mutações seguem o padrão `ActionResponse<T>` com autorização via `requireProjectAccess`. A geração de PDF utiliza `jspdf` com a identidade visual da marca e suporte a relatórios segmentados por prestador.

**Tech Stack:** Next.js 16 (App Router & Server Actions), Prisma 7, PostgreSQL, Tailwind CSS v4, Radix UI, jsPDF, Zod, Jest, Playwright.

---

### Mapeamento de Arquivos
- **Prisma:** `prisma/schema.prisma`
- **Validações:** `lib/validations/inspection.ts`
- **Server Actions:** `app/actions/inspection.ts`
- **Motor de PDF:** `lib/reports/inspection-pdf.ts` e `app/api/projects/[id]/inspections/[inspectionId]/pdf/route.ts`
- **Componentes:**
  - `components/inspections/NewInspectionDialog.tsx`
  - `components/inspections/NewPunchListItemModal.tsx`
  - `components/inspections/ResolveItemModal.tsx`
  - `components/inspections/PunchItemCard.tsx`
  - `components/inspections/InspectionTimeline.tsx`
  - `components/inspections/PunchListTable.tsx`
- **Páginas:** `app/(dashboard)/projects/[id]/inspections/page.tsx`
- **Testes:**
  - `tests/validations/inspection.test.ts`
  - `tests/actions/inspection.test.ts`
  - `tests/reports/inspection-pdf.test.ts`
  - `tests/e2e/inspection-flow.spec.ts`

---

## Tarefas de Implementação

### Task 1: Schema Prisma e Modelagem de Dados

**Files:**
- Modify: `prisma/schema.prisma:30-40` e `prisma/schema.prisma:260-270`

- [ ] **Step 1: Adicionar os novos Enums e Models no `prisma/schema.prisma`**

No arquivo `prisma/schema.prisma`, adicione os enums `InspectionStatus`, `PunchListStatus`, `PunchListSeverity` e os modelos `SiteInspection` e `PunchListItem`:

```prisma
enum InspectionStatus {
  DRAFT
  COMPLETED
  SENT
}

enum PunchListStatus {
  PENDING
  IN_PROGRESS
  RESOLVED
  CANCELLED
}

enum PunchListSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model SiteInspection {
  id               String           @id @default(uuid())
  title            String
  date             DateTime         @default(now())
  status           InspectionStatus @default(DRAFT)
  generalNotes     String?          @db.Text
  weatherCondition String?          @map("weather_condition")
  
  projectId        String           @map("project_id")
  project          Project          @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  inspectorId      String           @map("inspector_id")
  inspector        User             @relation("InspectionInspector", fields: [inspectorId], references: [id])
  
  items            PunchListItem[]
  createdAt        DateTime         @default(now()) @map("created_at")
  updatedAt        DateTime         @updatedAt @map("updated_at")

  @@index([projectId])
  @@index([date])
  @@map("site_inspections")
}

model PunchListItem {
  id              String            @id @default(uuid())
  environment     String
  contractorTrade String            @map("contractor_trade")
  contractorName  String?           @map("contractor_name")
  description     String            @db.Text
  severity        PunchListSeverity @default(MEDIUM)
  status          PunchListStatus   @default(PENDING)
  dueDate         DateTime?         @map("due_date")
  
  beforePhotoUrl  String            @map("before_photo_url")
  afterPhotoUrl   String?           @map("after_photo_url")
  resolutionNotes String?           @map("resolution_notes") @db.Text
  resolvedAt      DateTime?         @map("resolved_at")

  inspectionId    String            @map("inspection_id")
  inspection      SiteInspection    @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  projectId       String            @map("project_id")
  project         Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)

  createdAt       DateTime          @default(now()) @map("created_at")
  updatedAt       DateTime          @updatedAt @map("updated_at")

  @@index([inspectionId])
  @@index([projectId])
  @@index([status])
  @@index([environment])
  @@index([contractorTrade])
  @@map("punch_list_items")
}
```

Atualize o modelo `Project` para incluir:
```prisma
  siteInspections SiteInspection[]
  punchListItems  PunchListItem[]
```

E atualize o modelo `User` para incluir a relação inversa:
```prisma
  inspections SiteInspection[] @relation("InspectionInspector")
```

- [ ] **Step 2: Gerar os tipos atualizados do Prisma Client**

Executar no terminal:
`npx prisma generate`

Verificação: Deve gerar o client sem erros de sintaxe ou relações faltantes.

---

### Task 2: Validações com Zod e Schemas de Entrada

**Files:**
- Create: `lib/validations/inspection.ts`
- Test: `tests/validations/inspection.test.ts`

- [ ] **Step 1: Escrever teste de validação Zod**

Criar `tests/validations/inspection.test.ts`:
```ts
import { createInspectionSchema, punchListItemSchema, resolvePunchListItemSchema } from "@/lib/validations/inspection";

describe("Inspection Zod Schemas", () => {
  it("valida criacao de vistoria com dados validos", () => {
    const validData = {
      title: "Vistoria #01 - Conferência Elétrica",
      date: new Date().toISOString(),
      weatherCondition: "Ensolarado",
      generalNotes: "Obra dentro do cronograma"
    };
    const result = createInspectionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejeita titulo vazio na vistoria", () => {
    const invalidData = { title: "" };
    const result = createInspectionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("valida criacao de item de pendencia", () => {
    const validItem = {
      environment: "Cozinha",
      contractorTrade: "Marmoraria",
      contractorName: "Marmoraria Estrela",
      description: "Saia da bancada desnivelada",
      severity: "HIGH"
    };
    const result = punchListItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("valida resolucao de pendencia", () => {
    const validResolve = {
      resolutionNotes: "Bancada repolida e nivelada"
    };
    const result = resolvePunchListItemSchema.safeParse(validResolve);
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: Executar teste e verificar falha inicial**

Comando: `npx jest tests/validations/inspection.test.ts`
Esperado: Falha com "Cannot find module '@/lib/validations/inspection'".

- [ ] **Step 3: Implementar schemas no `lib/validations/inspection.ts`**

Criar `lib/validations/inspection.ts`:
```ts
import { z } from "zod";

export const createInspectionSchema = z.object({
  title: z.string().min(2, "Título é obrigatório"),
  date: z.string().optional().or(z.date().optional()),
  weatherCondition: z.string().optional().nullable(),
  generalNotes: z.string().optional().nullable()
});

export type CreateInspectionInput = z.infer<typeof createInspectionSchema>;

export const punchListItemSchema = z.object({
  environment: z.string().min(2, "Ambiente é obrigatório"),
  contractorTrade: z.string().min(2, "Especialidade é obrigatória"),
  contractorName: z.string().optional().nullable(),
  description: z.string().min(3, "Descrição é obrigatória"),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable()
});

export type PunchListItemInput = z.infer<typeof punchListItemSchema>;

export const resolvePunchListItemSchema = z.object({
  resolutionNotes: z.string().min(2, "Observação de resolução é obrigatória")
});

export type ResolvePunchListItemInput = z.infer<typeof resolvePunchListItemSchema>;
```

- [ ] **Step 4: Executar testes de validação e verificar aprovação**

Comando: `npx jest tests/validations/inspection.test.ts`
Esperado: 4 testes passando.

---

### Task 3: Server Actions de Vistoria e Pendências

**Files:**
- Create: `app/actions/inspection.ts`
- Test: `tests/actions/inspection.test.ts`

- [ ] **Step 1: Escrever teste de integração das Server Actions**

Criar `tests/actions/inspection.test.ts`:
```ts
import { createSiteInspection, addPunchListItem, resolvePunchListItem } from "@/app/actions/inspection";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/server-utils", () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: "test-user-id", role: "OWNER" } }),
  requireProjectAccess: jest.fn().mockResolvedValue({ user: { id: "test-user-id", role: "OWNER" } })
}));

jest.mock("@/lib/storage", () => ({
  DiskStorageProvider: jest.fn().mockImplementation(() => ({
    uploadFile: jest.fn().mockResolvedValue({ fileKey: "mock-key.jpg", fileUrl: "/api/storage/download?key=mock-key.jpg" })
  }))
}));

describe("Site Inspection Server Actions", () => {
  let projectId: string;

  beforeAll(async () => {
    const project = await prisma.project.create({
      data: {
        name: "Casa Campinas Teste Vistoria",
        ownerId: "test-user-id"
      }
    });
    projectId = project.id;
  });

  afterAll(async () => {
    await prisma.project.delete({ where: { id: projectId } });
  });

  it("cria uma vistoria com status DRAFT", async () => {
    const res = await createSiteInspection(projectId, {
      title: "Vistoria #01",
      weatherCondition: "Ensolarado"
    });

    expect(res.ok).toBe(true);
    expect(res.data?.status).toBe("DRAFT");
    expect(res.data?.title).toBe("Vistoria #01");
  });

  it("adiciona item de pendencia com foto do Antes", async () => {
    const insp = await prisma.siteInspection.create({
      data: {
        title: "Vistoria Items",
        projectId,
        inspectorId: "test-user-id"
      }
    });

    const formData = new FormData();
    formData.append("environment", "Cozinha");
    formData.append("contractorTrade", "Gesso");
    formData.append("description", "Trinca no forro");
    formData.append("severity", "HIGH");
    formData.append("beforePhoto", new Blob(["fake-img"], { type: "image/jpeg" }), "antes.jpg");

    const res = await addPunchListItem(insp.id, formData);
    expect(res.ok).toBe(true);
    expect(res.data?.environment).toBe("Cozinha");
    expect(res.data?.status).toBe("PENDING");
  });
});
```

- [ ] **Step 2: Executar teste e verificar falha inicial**

Comando: `npx jest tests/actions/inspection.test.ts`
Esperado: Falha com "Cannot find module '@/app/actions/inspection'".

- [ ] **Step 3: Implementar Server Actions em `app/actions/inspection.ts`**

Criar `app/actions/inspection.ts`:
```ts
"use server";

import { prisma } from "@/lib/prisma";
import { requireProjectAccess, requireAuth } from "@/lib/server-utils";
import { DiskStorageProvider } from "@/lib/storage";
import { createInspectionSchema, punchListItemSchema, resolvePunchListItemSchema } from "@/lib/validations/inspection";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface ActionResponse<T = any> {
  ok: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[]> | string;
}

export async function createSiteInspection(projectId: string, input: any): Promise<ActionResponse> {
  try {
    const session = await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR]);
    const validated = createInspectionSchema.safeParse(input);
    if (!validated.success) {
      return { ok: false, errors: validated.error.flatten().fieldErrors };
    }

    const inspection = await prisma.siteInspection.create({
      data: {
        title: validated.data.title,
        date: validated.data.date ? new Date(validated.data.date) : new Date(),
        weatherCondition: validated.data.weatherCondition,
        generalNotes: validated.data.generalNotes,
        projectId,
        inspectorId: session.user.id
      }
    });

    revalidatePath(`/projects/${projectId}/inspections`);
    return { ok: true, data: inspection };
  } catch (error: any) {
    return { ok: false, message: error.message || "Erro ao criar vistoria" };
  }
}

export async function addPunchListItem(inspectionId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const inspection = await prisma.siteInspection.findUnique({
      where: { id: inspectionId },
      select: { projectId: true }
    });

    if (!inspection) {
      return { ok: false, message: "Vistoria não encontrada" };
    }

    await requireProjectAccess(inspection.projectId, [Role.OWNER, Role.EDITOR]);

    const rawData = {
      environment: formData.get("environment"),
      contractorTrade: formData.get("contractorTrade"),
      contractorName: formData.get("contractorName"),
      description: formData.get("description"),
      severity: formData.get("severity") || "MEDIUM",
      dueDate: formData.get("dueDate")
    };

    const validated = punchListItemSchema.safeParse(rawData);
    if (!validated.success) {
      return { ok: false, errors: validated.error.flatten().fieldErrors };
    }

    const file = formData.get("beforePhoto") as File | null;
    if (!file) {
      return { ok: false, message: "A foto do Antes é obrigatória" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = new DiskStorageProvider();
    const { fileUrl } = await storage.uploadFile(buffer, file.name, file.type);

    const item = await prisma.punchListItem.create({
      data: {
        environment: validated.data.environment,
        contractorTrade: validated.data.contractorTrade,
        contractorName: validated.data.contractorName,
        description: validated.data.description,
        severity: validated.data.severity as any,
        dueDate: validated.data.dueDate ? new Date(validated.data.dueDate) : null,
        beforePhotoUrl: fileUrl,
        inspectionId,
        projectId: inspection.projectId
      }
    });

    revalidatePath(`/projects/${inspection.projectId}/inspections`);
    return { ok: true, data: item };
  } catch (error: any) {
    return { ok: false, message: error.message || "Erro ao adicionar pendência" };
  }
}

export async function resolvePunchListItem(itemId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const item = await prisma.punchListItem.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      return { ok: false, message: "Item de pendência não encontrado" };
    }

    await requireProjectAccess(item.projectId, [Role.OWNER, Role.EDITOR]);

    const rawData = {
      resolutionNotes: formData.get("resolutionNotes")
    };

    const validated = resolvePunchListItemSchema.safeParse(rawData);
    if (!validated.success) {
      return { ok: false, errors: validated.error.flatten().fieldErrors };
    }

    const file = formData.get("afterPhoto") as File | null;
    let afterPhotoUrl = item.afterPhotoUrl;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const storage = new DiskStorageProvider();
      const uploadRes = await storage.uploadFile(buffer, file.name, file.type);
      afterPhotoUrl = uploadRes.fileUrl;
    }

    const updated = await prisma.punchListItem.update({
      where: { id: itemId },
      data: {
        status: "RESOLVED",
        resolutionNotes: validated.data.resolutionNotes,
        afterPhotoUrl,
        resolvedAt: new Date()
      }
    });

    revalidatePath(`/projects/${item.projectId}/inspections`);
    return { ok: true, data: updated };
  } catch (error: any) {
    return { ok: false, message: error.message || "Erro ao resolver pendência" };
  }
}

export async function completeSiteInspection(inspectionId: string): Promise<ActionResponse> {
  try {
    const inspection = await prisma.siteInspection.findUnique({
      where: { id: inspectionId },
      select: { projectId: true }
    });

    if (!inspection) {
      return { ok: false, message: "Vistoria não encontrada" };
    }

    await requireProjectAccess(inspection.projectId, [Role.OWNER, Role.EDITOR]);

    const updated = await prisma.siteInspection.update({
      where: { id: inspectionId },
      data: { status: "COMPLETED" }
    });

    revalidatePath(`/projects/${inspection.projectId}/inspections`);
    return { ok: true, data: updated };
  } catch (error: any) {
    return { ok: false, message: error.message || "Erro ao concluir vistoria" };
  }
}
```

- [ ] **Step 4: Executar os testes das Server Actions**

Comando: `npx jest tests/actions/inspection.test.ts`
Esperado: Testes passando com sucesso.

---

### Task 4: Motor de Relatórios em PDF e Endpoint de Download

**Files:**
- Create: `lib/reports/inspection-pdf.ts`
- Create: `app/api/projects/[id]/inspections/[inspectionId]/pdf/route.ts`
- Test: `tests/reports/inspection-pdf.test.ts`

- [ ] **Step 1: Escrever teste para o motor de PDF**

Criar `tests/reports/inspection-pdf.test.ts`:
```ts
import { generateInspectionPDF } from "@/lib/reports/inspection-pdf";

describe("Inspection PDF Engine", () => {
  it("gera buffer PDF válido com os dados da vistoria", async () => {
    const mockData = {
      project: { name: "Residência Alphaville", clientName: "João da Silva", address: "Av. Principal 100" },
      inspection: {
        title: "Vistoria #01",
        date: new Date("2026-10-03"),
        weatherCondition: "Ensolarado",
        inspectorName: "Italo Sampaio"
      },
      items: [
        {
          environment: "Cozinha",
          contractorTrade: "Gesso",
          contractorName: "Gesso Luxo",
          description: "Forro desnivelado",
          severity: "HIGH",
          status: "PENDING"
        }
      ]
    };

    const pdfBuffer = await generateInspectionPDF(mockData as any);
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(500);
  });
});
```

- [ ] **Step 2: Executar teste e verificar falha inicial**

Comando: `npx jest tests/reports/inspection-pdf.test.ts`
Esperado: Falha com "Cannot find module '@/lib/reports/inspection-pdf'".

- [ ] **Step 3: Implementar gerador de PDF em `lib/reports/inspection-pdf.ts`**

Criar `lib/reports/inspection-pdf.ts`:
```ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface InspectionPDFData {
  project: {
    name: string;
    clientName?: string | null;
    address?: string | null;
  };
  inspection: {
    title: string;
    date: Date;
    weatherCondition?: string | null;
    generalNotes?: string | null;
    inspectorName: string;
  };
  items: Array<{
    environment: string;
    contractorTrade: string;
    contractorName?: string | null;
    description: string;
    severity: string;
    status: string;
    resolutionNotes?: string | null;
  }>;
}

export async function generateInspectionPDF(data: InspectionPDFData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ArchFlow Brand Colors
  const brandPrimary: [number, number, number] = [205, 213, 198];
  const brandForeground: [number, number, number] = [21, 32, 38];

  // Header Background
  doc.setFillColor(...brandPrimary);
  doc.rect(0, 0, pageWidth, 36, "F");

  // Title
  doc.setTextColor(...brandForeground);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ArchFlow ERP - Relatório de Vistoria Técnica", 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${data.project.name} | ${data.inspection.title}`, 14, 25);
  doc.text(`Data: ${format(new Date(data.inspection.date), "dd/MM/yyyy", { locale: ptBR })} | Inspetor: ${data.inspection.inspectorName}`, 14, 31);

  // KPIs
  const total = data.items.length;
  const pending = data.items.filter(i => i.status === "PENDING").length;
  const resolved = data.items.filter(i => i.status === "RESOLVED").length;

  doc.setFontSize(10);
  doc.text(`Resumo: ${total} Não Conformidades (${pending} Pendentes, ${resolved} Resolvidas)`, 14, 44);

  // Table of items
  const tableRows = data.items.map((item, idx) => [
    (idx + 1).toString(),
    item.environment,
    `${item.contractorTrade} ${item.contractorName ? `(${item.contractorName})` : ""}`,
    item.description,
    item.severity,
    item.status === "RESOLVED" ? "RESOLVIDO" : "PENDENTE"
  ]);

  autoTable(doc, {
    startY: 48,
    head: [["#", "Ambiente", "Especialidade", "Descrição da Não Conformidade", "Severidade", "Status"]],
    body: tableRows,
    headStyles: {
      fillColor: brandForeground,
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    }
  });

  return Buffer.from(doc.output("arraybuffer"));
}
```

- [ ] **Step 4: Criar Route Handler da API em `app/api/projects/[id]/inspections/[inspectionId]/pdf/route.ts`**

Criar `app/api/projects/[id]/inspections/[inspectionId]/pdf/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProjectAccess } from "@/lib/server-utils";
import { generateInspectionPDF } from "@/lib/reports/inspection-pdf";
import { Role } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; inspectionId: string }> }
) {
  try {
    const { id: projectId, inspectionId } = await params;
    await requireProjectAccess(projectId, [Role.OWNER, Role.EDITOR, Role.VIEWER]);

    const inspection = await prisma.siteInspection.findUnique({
      where: { id: inspectionId },
      include: {
        project: true,
        inspector: true,
        items: true
      }
    });

    if (!inspection) {
      return new NextResponse("Vistoria não encontrada", { status: 404 });
    }

    const tradeFilter = req.nextUrl.searchParams.get("trade");
    const items = tradeFilter
      ? inspection.items.filter(i => i.contractorTrade.toLowerCase() === tradeFilter.toLowerCase())
      : inspection.items;

    const pdfBuffer = await generateInspectionPDF({
      project: {
        name: inspection.project.name,
        clientName: inspection.project.clientName,
        address: inspection.project.address
      },
      inspection: {
        title: inspection.title,
        date: inspection.date,
        weatherCondition: inspection.weatherCondition,
        generalNotes: inspection.generalNotes,
        inspectorName: inspection.inspector.fullName
      },
      items
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="vistoria-${inspection.id.slice(0, 8)}.pdf"`
      }
    });
  } catch (error: any) {
    return new NextResponse(error.message || "Erro ao exportar PDF", { status: 500 });
  }
}
```

- [ ] **Step 5: Executar teste do gerador de PDF**

Comando: `npx jest tests/reports/inspection-pdf.test.ts`
Esperado: Teste passando.

---

### Task 5: Componentes de UI Mobile-First e Painéis de Vistoria

**Files:**
- Create: `components/inspections/NewInspectionDialog.tsx`
- Create: `components/inspections/NewPunchListItemModal.tsx`
- Create: `components/inspections/ResolveItemModal.tsx`
- Create: `components/inspections/PunchItemCard.tsx`

- [ ] **Step 1: Criar modal de criação de vistoria `components/inspections/NewInspectionDialog.tsx`**

Criar modal com formulário para título, data e clima com botões de seleção rápida.

- [ ] **Step 2: Criar modal de captura mobile `components/inspections/NewPunchListItemModal.tsx`**

Criar componente mobile-first com:
- Input de câmera com `capture="environment"`.
- Chips de seleção rápida para Ambientes (*Cozinha, Suíte, Fachada, Sala*).
- Chips para Especialidades (*Pintura, Gesso, Elétrica, Hidráulica*).
- Select para Severidade.

- [ ] **Step 3: Criar modal de resolução `components/inspections/ResolveItemModal.tsx`**

Criar componente que mostra a foto do *Antes* e permite capturar a foto do *Depois* com nota de encerramento.

- [ ] **Step 4: Criar card de pendência `components/inspections/PunchItemCard.tsx`**

Card com exibição lado a lado de fotos Antes e Depois, badges de status e severidade.

---

### Task 6: Página e Navegação no Projeto

**Files:**
- Create: `app/(dashboard)/projects/[id]/inspections/page.tsx`
- Create: `components/inspections/InspectionTimeline.tsx`
- Create: `components/inspections/PunchListTable.tsx`

- [ ] **Step 1: Criar a página de Vistorias do Projeto**

Criar `app/(dashboard)/projects/[id]/inspections/page.tsx` integrando o carregamento dos dados via Prisma e as abas:
- **Linha do Tempo de Visitas:** Lista cronológica com botão de baixar PDF e status.
- **Painel Geral de Pendências:** Tabela com filtros por Ambiente e Especialidade.

- [ ] **Step 2: Vincular aba no layout do projeto**

Adicionar link de navegação "Vistorias & Obra" na visualização do projeto para acesso direto.

---

### Task 7: Teste End-to-End (Playwright)

**Files:**
- Create: `tests/e2e/inspection-flow.spec.ts`

- [ ] **Step 1: Escrever teste E2E do fluxo de vistoria**

Criar `tests/e2e/inspection-flow.spec.ts` cobrindo o fluxo completo:
1. Navegação para aba de vistorias.
2. Abertura de nova vistoria.
3. Cadastro de item com mock de foto.
4. Resolução de item.
5. Exportação de PDF.

- [ ] **Step 2: Executar Playwright e validar o fluxo**

Comando: `npx playwright test tests/e2e/inspection-flow.spec.ts`
Esperado: Teste passando.
