# 📋 PRD Completo - ArchFlow ERP v3.0
## Sistema de Gestão de Projetos Arquitetônicos e Carteira de Clientes

**Versão:** 3.0  
**Data de Atualização:** 18 de Janeiro de 2026  
**Status:** Em Desenvolvimento - MVP Focus  
**Autor:** Italo520  
**Foco Principal:** ERP full-stack para escritórios de arquitetura  

---

## 📑 Índice

1. [Visão Geral do Produto](#visão-geral-do-produto)
2. [Fundamentação e Contexto](#fundamentação-e-contexto)
3. [Stack Técnico Detalhado](#stack-técnico-detalhado)
4. [Arquitetura do Sistema](#arquitetura-do-sistema)
5. [Fase 1: Consolidação do Backend](#fase-1-consolidação-do-backend)
6. [Fase 2: Gestão de Clientes](#fase-2-gestão-de-clientes)
7. [Fase 3: Gestão de Projetos Arquitetônicos](#fase-3-gestão-de-projetos-arquitetônicos)
8. [Fase 4: Gestão de Atividades do Arquiteto](#fase-4-gestão-de-atividades-do-arquiteto)
9. [Fase 5: Dashboard e Relatórios](#fase-5-dashboard-e-relatórios)
10. [Fase 6: Colaboração e Comunicação](#fase-6-colaboração-e-comunicação)
11. [Fase 7: Funcionalidades Avançadas](#fase-7-funcionalidades-avançadas)
12. [Fase 8: PWA, Performance e Deployment](#fase-8-pwa-performance-e-deployment)
13. [Fase 9: Integrações Externas](#fase-9-integrações-externas)
14. [Fase 10: DevOps e Produção](#fase-10-devops-e-produção)
15. [Cronograma Realista](#cronograma-realista)
16. [Matriz de Riscos](#matriz-de-riscos)
17. [KPIs de Sucesso](#kpis-de-sucesso)

---

## 🎯 Visão Geral do Produto

### Missão
Criar uma plataforma integrada que simplifica a gestão completa de escritórios de arquitetura, desde o relacionamento com clientes até a entrega de projetos, com foco em produtividade, rastreabilidade e inteligência de negócios.

### Visão
Ser o ERP padrão para arquitetos e escritórios de arquitetura no Brasil, oferecendo ferramentas especialistas que entendem o workflow único da profissão, desde briefing até execução.

### Valores Principais
- **Especialização**: Features pensadas especificamente para arquitetura
- **Integração**: Todos os módulos conversam de forma fluida
- **Produtividade**: Reduce overhead, maximiza tempo em design
- **Rastreabilidade**: Auditoria completa de tudo
- **Escalabilidade**: Cresce com o escritório

### Público-Alvo
- **Primário**: Escritórios de arquitetura (5-50 pessoas)
- **Secundário**: Arquitetos freelancers, Construtoras com departamento de arquitetura
- **Geográfico**: Brasil, potencial América Latina

### Diferenciais Competitivos
1. **Workflow especializado**: Designed for architects, not generic project management
2. **Inteligência de tempo**: Tracking detalhado de atividades por tipo
3. **Gestão de clientes integrada**: Não é add-on, é core
4. **Relatórios financeiros**: Revenue attribution, profitability analysis
5. **Mobile-first**: PWA com offline capability
6. **LGPD compliance**: Pensado desde o início

---

## 📚 Fundamentação e Contexto

### Problema a Resolver
Arquitetos e escritórios de arquitetura enfrentam:
- Fragmentação de ferramentas (email, Whatsapp, drives, planilhas)
- Dificuldade em rastrear tempo e atividades
- Falta de visibilidade financeira por projeto
- Relacionamento com cliente desorganizado
- Difícil calcular lucratividade real

### Oportunidade de Mercado
- ~15.000 escritórios de arquitetura no Brasil
- Migração em massa de planilhas para SaaS
- Market size estimado: R$ 100-200M
- Baixa concorrência direta no segmento específico

### Estratégia de Go-to-Market
1. **Phase 1 (Meses 1-3)**: Beta privado com 5-10 arquitetos conhecidos
2. **Phase 2 (Meses 4-6)**: Soft launch para 50-100 usuários
3. **Phase 3 (Meses 7-12)**: Growth phase, partnerships com CAU, softwares aliados
4. **Phase 4 (Year 2)**: Expansion para contractors, designers, urbanistas

---

## 🛠 Stack Técnico Detalhado

### Frontend
```
Framework: Next.js 16.1.1 (App Router)
React: 19.0+
TypeScript: 5.3+
Styling: Tailwind CSS v4 + PostCSS
Component Library: 
  - Radix UI (primitivos acessíveis)
  - shadcn/ui (built on Radix)
  - Custom components (ArchFlow specific)
UI State: Zustand (lightweight)
Forms: React Hook Form + Zod (validation)
Tables: TanStack Table (React Table v8)
Rich Text: TipTap v2
Drag & Drop: @dnd-kit (modern, performant)
Charts: Recharts v2 + Framer Motion
Date: date-fns + React Calendar
Icons: Lucide React
Toast/Modals: Sonner (toasts) + Radix Dialog
Testing: Jest + React Testing Library
E2E: Playwright v1.40+
```

### Backend
```
Runtime: Node.js 20 LTS
Framework: Next.js Server Actions + API Routes
Database: PostgreSQL 15+ (Supabase)
ORM: Prisma 7.2
Authentication: NextAuth.js v5 (beta)
File Storage: Supabase Storage + AWS S3 (optional)
Caching: Redis (optional, for performance)
Job Queue: Bull (Redis) for async tasks
Email: Resend (preferred) or SendGrid
Session Management: NextAuth sessions + JWT
Real-time: Supabase Realtime (optional)
```

### DevOps & Infrastructure
```
VCS: GitHub
CI/CD: GitHub Actions
Deployment: Vercel (primary) + AWS/DigitalOcean (backup)
Monitoring: Sentry (errors) + PostHog (analytics)
Database Backups: Supabase built-in + automated snapshots
CDN: Vercel Edge Network
DNS: Cloudflare
Secrets Management: GitHub Secrets + Vercel Environment
```

### Development Tools
```
Package Manager: npm (stable choice)
Build Tool: Next.js built-in (Turbopack)
Linting: ESLint + Prettier
Version Control: Git + conventional commits
Code Quality: SonarQube (optional)
API Testing: Postman + Thunder Client
Database GUI: pgAdmin + DBeaver
Local Dev: Docker Compose for local Postgres
```

---

## 🏗 Arquitetura do Sistema

### Diagrama de Módulos
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Dashboard    │ Projects     │ Clients      │              │
│  ├──────────────┼──────────────┼──────────────┤              │
│  │ Activities   │ Deliverables │ Time Logs    │              │
│  ├──────────────┼──────────────┼──────────────┤              │
│  │ Reports      │ Team         │ Settings     │              │
│  └──────────────┴──────────────┴──────────────┘              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              API Layer (Server Actions)                      │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Auth         │ Projects API │ Clients API  │              │
│  ├──────────────┼──────────────┼──────────────┤              │
│  │ Activities   │ Time Tracking│ Deliverables │              │
│  ├──────────────┼──────────────┼──────────────┤              │
│  │ Reports      │ Analytics    │ Files        │              │
│  └──────────────┴──────────────┴──────────────┘              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            Business Logic & Validations                      │
│  ┌──────────────┬──────────────┬──────────────┐              │
│  │ Auth Service │ Project Mgmt │ Analytics    │              │
│  ├──────────────┼──────────────┼──────────────┤              │
│  │ Workflow     │ Notifications│ Automations  │              │
│  └──────────────┴──────────────┴──────────────┘              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Layer (Prisma ORM)                         │
│  PostgreSQL 15+ (Supabase)                                  │
│  ├─ Users, Auth, Sessions                                   │
│  ├─ Clients, Projects, Tasks                                │
│  ├─ Activities, TimeLogs, Deliverables                      │
│  ├─ Comments, Notifications                                 │
│  ├─ Files, AuditLog, Reports                                │
│  └─ Preferences, Settings                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              External Services                              │
│  ├─ Supabase (Database + Storage)                           │
│  ├─ S3 / Supabase Storage (Files)                           │
│  ├─ Resend / SendGrid (Email)                               │
│  ├─ Google Maps API (Location)                              │
│  ├─ Slack / Discord (Notifications)                         │
│  └─ Analytics Platforms (PostHog, GA4)                      │
└─────────────────────────────────────────────────────────────┘
```

### Estrutura de Pastas
```
archflow/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── activities/
│   │   ├── time-tracking/
│   │   ├── deliverables/
│   │   ├── reports/
│   │   ├── team/
│   │   └── settings/
│   ├── api/
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── projects/
│   │   ├── activities/
│   │   ├── files/
│   │   └── webhooks/
│   ├── actions/ (Server Actions)
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── project.ts
│   │   ├── activity.ts
│   │   ├── deliverable.ts
│   │   └── ...
│   └── layout.tsx
├── components/
│   ├── ui/ (shadcn/ui)
│   ├── dashboard/
│   ├── clients/
│   ├── projects/
│   ├── activities/
│   ├── reports/
│   ├── layouts/
│   └── shared/
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   ├── validations.ts
│   ├── constants.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProject.ts
│   ├── useClients.ts
│   └── ...
├── services/
│   ├── supabase.ts
│   ├── email.ts
│   ├── file-upload.ts
│   ├── analytics.ts
│   └── ...
├── types/
│   ├── index.ts
│   ├── api.ts
│   └── database.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── public/
│   ├── icons/
│   ├── images/
│   └── manifest.json
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .github/
│   └── workflows/
│       ├── test.yml
│       ├── lint.yml
│       └── deploy.yml
├── .env.example
├── .env.local
├── next.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

---

# ✅ FASE 1: Consolidação do Backend
## Estrutura de dados robusta e Server Actions base

## 1.1 Schema Prisma - Novos Models
### Status: 60% (base ok, need new models)

#### Subtarefa 1.1.1: Client Model Estendido
- [x] **Criar modelo completo de Cliente**
  - [x] Model User básico
  - [ ] Estender com campos arquitetônicos
    - [x] `id` (UUID)
    - [x] `name` (string, required)
    - [x] `email` (string, unique)
    - [x] `phone` (string)
    - [x] `website` (string, nullable)
    - [x] `legalType` (enum: PF, PJ)
    - [x] `document` (CPF/CNPJ, unique, validated)
    - [x] `razaoSocial` (string, for PJ)
    - [x] `inscricaoEstadual` (string, nullable)
    - [x] `address` (JSON: rua, numero, cep, cidade, estado, complemento)
    - [x] `geoLocation` (JSON: lat, lng, for maps)
    - [x] `category` (enum: RESIDENTIAL, COMMERCIAL, INSTITUTIONAL, INDUSTRIAL, DESIGNER)
    - [x] `status` (enum: ACTIVE, INACTIVE, PROSPECT, BLOCKED)
    - [x] `rating` (float, 0-5)
    - [x] `totalSpent` (decimal, calculated)
    - [x] `avatar` (string, url)
    - [x] `notes` (text)
    - [x] `contactPreference` (enum: EMAIL, PHONE, WHATSAPP)
    - [x] `userId` (FK to User who owns the client record)
    - [x] `tags` (string[], for categorization)
    - [x] `metadata` (JSON, for extensibility)
    - [x] `createdAt`, `updatedAt`, `deletedAt` (soft delete)
    - [x] `lastInteractionAt` (to detect inactive)
  - [x] Adicionar indexes: `email`, `document`, `userId`, `status`, `createdAt`
  - [x] Add relations to: Project (1:N), Activity (1:N), TimeLog (1:N)

#### Subtarefa 1.1.2: Activity Model
- [x] **Rastreamento de atividades do arquiteto**
  - [x] `id` (UUID)
  - [x] `type` (enum: MEETING, CALL, EMAIL, SITE_VISIT, DESIGN, REVISION, APPROVAL, ADMIN, OTHER)
  - [x] `title` (string)
  - [x] `description` (text)
  - [x] `duration` (int, em minutos)
  - [x] `startTime` (datetime)
  - [x] `endTime` (datetime)
  - [x] `location` (string, nullable)
  - [x] `participants` (string[], array de IDs de usuários)
  - [x] `clientId` (FK)
  - [x] `projectId` (FK, nullable)
  - [x] `taskId` (FK, nullable)
  - [x] `createdById` (FK to User)
  - [x] `attachments` (JSON[], file references)
  - [x] `notes` (text)
  - [x] `status` (enum: SCHEDULED, COMPLETED, CANCELLED)
  - [x] `createdAt`, `updatedAt`
  - [x] Indexes: `clientId`, `projectId`, `createdById`, `startTime`
  - [x] Relations: Client, Project, Task, User

#### Subtarefa 1.1.3: Deliverable Model
- [x] **Gestão de entregas de projeto**
  - [x] `id` (UUID)
  - [x] `name` (string)
  - [x] `type` (enum: SKETCH, RENDER_3D, DRAWING_2D, DOCUMENT, PDF, VIDEO, PHOTO, OTHER)
  - [x] `description` (text)
  - [x] `fileUrl` (string)
  - [x] `fileSize` (int, em bytes)
  - [x] `mimeType` (string)
  - [x] `version` (int, starts at 1)
  - [x] `status` (enum: DRAFT, PENDING_REVIEW, APPROVED, APPROVED_WITH_CHANGES, REJECTED, DELIVERED)
  - [x] `taskId` (FK)
  - [x] `projectId` (FK)
  - [x] `createdById` (FK to User)
  - [x] `approvedById` (FK, nullable)
  - [x] `reviewComments` (JSON[], with timestamps)
  - [x] `revisionCount` (int)
  - [x] `dueDates` (string[], milestones)
  - [x] `tags` (string[])
  - [x] `metadata` (JSON, for specific types)
  - [x] `createdAt`, `updatedAt`, `deletedAt`
  - [x] Indexes: `projectId`, `taskId`, `status`, `version`
  - [x] Relations: Task, Project, User

#### Subtarefa 1.1.4: TimeLog Model
- [x] **Rastreamento de tempo dedicado**
  - [x] `id` (UUID)
  - [x] `duration` (float, em horas)
  - [x] `category` (enum: DESIGN, REVIEW, MEETING, ADMIN, DELIVERY, OTHER)
  - [x] `description` (text)
  - [x] `date` (date)
  - [x] `startTime` (time, optional)
  - [x] `endTime` (time, optional)
  - [x] `userId` (FK)
  - [x] `projectId` (FK)
  - [x] `taskId` (FK, nullable)
  - [x] `clientId` (FK, nullable)
  - [x] `billable` (boolean)
  - [x] `billRate` (decimal, hourly rate)
  - [x] `invoiceId` (FK, nullable)
  - [x] `tags` (string[])
  - [x] `createdAt`, `updatedAt`
  - [x] Indexes: `userId`, `projectId`, `date`, `billable`
  - [x] Relations: User, Project, Task, Client

#### Subtarefa 1.1.5: Estimate Model
- [x] **Estimativas de projeto**
  - [x] `id` (UUID)
  - [x] `projectId` (FK)
  - [x] `estimatedHours` (float)
  - [x] `estimatedCost` (decimal)
  - [x] `actualHours` (float, calculated)
  - [x] `actualCost` (decimal, calculated)
  - [x] `status` (enum: DRAFT, APPROVED, IN_PROGRESS, COMPLETED)
  - [x] `notes` (text)
  - [x] `createdAt`, `updatedAt`
  - [x] Indexes: `projectId`

#### Subtarefa 1.1.6: Budget Model
- [x] **Orçamento por projeto**
  - [x] `id` (UUID)
  - [x] `projectId` (FK, unique)
  - [x] `totalBudget` (decimal)
  - [x] `spentAmount` (decimal, calculated)
  - [x] `remainingAmount` (decimal, calculated)
  - [x] `budgetBreakdown` (JSON: {phase: amount})
  - [x] `status` (enum: DRAFT, APPROVED, ACTIVE, EXCEEDED, COMPLETED)
  - [x] `createdAt`, `updatedAt`

#### Subtarefa 1.1.7: Notification Model
- [x] Expandir modelo existente
  - [x] `id` (UUID)
  - [x] `userId` (FK)
  - [x] `type` (enum: TASK_ASSIGNED, COMMENT, APPROVAL_PENDING, DEADLINE_APPROACHING, PROJECT_UPDATE, MENTION, SYSTEM)
  - [x] `title` (string)
  - [x] `message` (text)
  - [x] `relatedEntityId` (string, id do objeto - project, task, etc)
  - [x] `relatedEntityType` (enum: PROJECT, TASK, CLIENT, ACTIVITY, DELIVERABLE)
  - [x] `read` (boolean)
  - [x] `readAt` (datetime, nullable)
  - [x] `actionUrl` (string, link para abrir notificação)
  - [x] `createdAt`
  - [x] Indexes: `userId`, `read`, `createdAt`

#### Subtarefa 1.1.8: AuditLog Model
- [x] Expandir para rastrear tudo
  - [x] `id` (UUID)
  - [x] `userId` (FK)
  - [x] `action` (enum: CREATE, UPDATE, DELETE, APPROVE, REJECT)
  - [x] `entityType` (string: "Project", "Task", "Client", etc)
  - [x] `entityId` (string)
  - [x] `changes` (JSON: {field: {oldValue, newValue}})
  - [x] `ipAddress` (string)
  - [x] `userAgent` (string)
  - [x] `createdAt`
  - [x] Indexes: `userId`, `entityType`, `entityId`, `createdAt`

#### Subtarefa 1.1.9: Relations Completas
- [x] **Mapear todas as relações**
  - [x] User → Projects (1:N)
  - [x] User → Tasks (1:N)
  - [x] User → Activities (1:N)
  - [x] User → TimeLogs (1:N)
  - [x] Client → Projects (1:N)
  - [x] Client → Activities (1:N)
  - [x] Client → TimeLogs (1:N)
  - [x] Project → Tasks (1:N)
  - [x] Project → Deliverables (1:N)
  - [x] Project → Activities (1:N)
  - [x] Project → Budget (1:1)
  - [x] Project → Estimate (1:1)
  - [x] Project → TimeLogs (1:N)
  - [x] Project → Stages (1:N)
  - [x] Task → Deliverables (1:N)
  - [x] Task → Activities (1:N)
  - [x] Task → TimeLogs (1:N)
  - [x] Task → Comments (1:N)
  - [x] Deliverable → Reviews (1:N, comments)
  - [x] User → ProjectMembers (1:N, para colaboração)
  - [x] ProjectMember → User (N:1)
  - [x] ProjectMember → Project (N:1)

#### Subtarefa 1.1.10: Validações em Prisma
- [x] **Cascade delete rules**
  - [x] Deletar Cliente → Deletar Activities, TimeLogs (soft delete Projects)
  - [x] Deletar Project → Deletar Tasks, Deliverables, Budget, Estimate (soft)
  - [x] Deletar Task → Deletar Deliverables, Activities, TimeLogs (soft)
- [x] **Unique constraints**
  - [x] Client.email
  - [x] Client.document
  - [x] User.email
  - [x] Project.id per client combo (opcional)
- [x] **Default values**
  - [x] Client.status = "PROSPECT"
  - [x] Activity.status = "SCHEDULED"
  - [x] Deliverable.status = "DRAFT"
  - [x] Deliverable.version = 1
  - [x] Project.progress = 0

## 1.2 Prisma Migrations
### Status: 0% (TODO)

#### Subtarefa 1.2.1: Criar Migration Inicial
- [x] **`prisma/migrations/add_core_models`**
  - [x] Executar `npx prisma migrate dev --name add_core_models`
  - [x] Verificar SQL gerado
  - [x] Testar localmente
  - [ ] Backup do banco antes de executar em staging

#### Subtarefa 1.2.2: Criar Migration para Soft Deletes
- [x] **Adicionar `deletedAt` aos models**
  - [x] User, Project, Client, Task, Deliverable, TimeLog
  - [x] `npx prisma migrate dev --name add_soft_deletes` (incluído em add_core_models)

#### Subtarefa 1.2.3: Criar Seed Script
- [ ] **`prisma/seed.ts`**
  - [x] Limpar dados existentes (truncate)
  - [x] Criar 3-5 usuários de teste
    - [x] Admin, Editor, Viewer roles
    - [x] Email: admin@archflow.local, etc
    - [x] Senhas: temporárias (dev only)
  - [x] Criar 10-15 clientes fictícios
    - [ ] Mix de PF e PJ
    - [ ] Diferentes categorias (residential, commercial, etc)
    - [ ] Diferentes status (active, prospect, inactive)
  - [x] Criar 15-20 projetos relacionados
    - [x] Diferentes tipos (residencial, comercial, reforma)
    - [x] Diferentes status (conceitual, executivo, finalizado)
    - [x] Diferentes clientes
    - [x] Com áreas, andares, ambientes
  - [x] Criar 30-50 tasks relacionadas aos projetos
    - [x] Diferentes stages (briefing, design, revision, etc)
    - [x] Diferentes assignees
    - [x] Diferentes prioridades
  - [x] Criar activities, time logs, deliverables de exemplo
  - [x] Executar: `npx prisma db seed`

#### Subtarefa 1.2.4: Validar Schema
- [x] **`npx prisma validate`** ✓
- [ ] **`npx prisma introspect`** - se houver BD existente
- [ ] Verificar tipos TypeScript gerados
- [ ] Compilar TypeScript sem erros

## 1.3 Índices e Performance
### Status: 0% (TODO)

#### Subtarefa 1.3.1: Adicionar Índices Críticos
- [x] **Em schema.prisma**
  ```prisma
  model Client {
    // ... fields
    @@index([userId])
    @@index([status])
    @@index([createdAt])
    @@index([document])
    @@unique([email])
  }
  ```
- [x] Migração: `npx prisma migrate dev --name add_performance_indexes`
- [ ] Testar query performance em staging

#### Subtarefa 1.3.2: Otimizar Queries
- [ ] **Usar `select` para reduzir dados transferidos** (Melhoria Futura)
- [ ] Documentar padrão em `lib/db.ts` (Melhoria Futura)

#### Subtarefa 1.3.3: N+1 Query Prevention
- [ ] **Usar `include` com cuidado** (Melhoria Futura)
- [ ] **Batch queries when possible** (Melhoria Futura)

## 1.4 Server Actions Fundamentais
### Status: 30% (basic structure exists)

#### Subtarefa 1.4.1: Auth Server Actions
- [x] **`app/actions/auth.ts`** - MELHORAR existente
  - [x] `signUp(email, password, name)` - Registrar
  - [x] `signIn(email, password)` - Login
  - [x] `signOut()` - Logout
  - [ ] `resetPassword(email)` - Solicitar reset
  - [ ] `updatePassword(token, newPassword)` - Confirmar reset
  - [x] `getCurrentUser()` - Get user da session
  - [x] `updateProfile(data)` - Atualizar perfil

#### Subtarefa 1.4.2: Client Server Actions
- [x] **`app/actions/client.ts`** - NOVO arquivo
  - [x] `createClient(formData)` - Criar novo cliente
  - [x] `getClientById(id)` - Recuperar cliente específico
  - [x] `listClients(filters, pagination)` - Listar com filtros
  - [x] `updateClient(id, data)` - Atualizar cliente
  - [x] `softDeleteClient(id)` - Deletar (soft)
  - [ ] `restoreClient(id)` - Restaurar cliente deletado
  - [ ] `getClientProjects(clientId)` - Projects do cliente
  - [ ] `getClientStats(clientId)` - Estatísticas
  - [ ] `bulkUploadClients(csvFile)` - Import de CSV
  - [ ] `exportClientsCSV(filters)` - Export para CSV

#### Subtarefa 1.4.3: Project Server Actions
- [x] **`app/actions/project.ts`** - EXPANDIR existente
  - [x] Todas as ações CRUD básicas

#### Subtarefa 1.4.4: Activity Server Actions
- [x] **`app/actions/activity.ts`** - NOVO arquivo
  - [x] Todas as ações de atividades

#### Subtarefa 1.4.5: TimeLog Server Actions
- [x] **`app/actions/timeLog.ts`** - NOVO arquivo
  - [x] Todas as ações de time tracking

#### Subtarefa 1.4.6: Deliverable Server Actions
- [x] **`app/actions/deliverable.ts`** - NOVO arquivo
  - [x] Todas as ações de deliverables

#### Subtarefa 1.4.7: Error Handling & Validation
- [x] **`lib/validations.ts`** - Schemas Zod centralizados
- [ ] **Error boundaries em Server Actions** (Melhoria Futura)

## 1.5 Middleware e Guards
### Status: 20% (basic exists)

#### Subtarefa 1.5.1: Auth Middleware
- [x] **`middleware.ts`** - Melhorar existente

#### Subtarefa 1.5.2: Permission Checks
- [x] **`lib/permissions.ts`** - NOVO arquivo

#### Subtarefa 1.5.3: API Route Protection
- [x] **Em cada `app/api/` route**

## 1.6 Testes Unitários - Fase 1
### Status: 0% (TODO)

#### Subtarefa 1.6.1: Setup Jest + RTL
- [x] **`jest.config.js` + `jest.setup.js`**

#### Subtarefa 1.6.2: Testes de Validação
- [x] **`tests/unit/validations.test.ts`**

#### Subtarefa 1.6.3: Testes de Server Actions
- [x] **`tests/unit/actions.test.ts`**

#### Subtarefa 1.6.4: Testes de Permissions
- [x] **`tests/unit/permissions.test.ts`**

---

# ✅ FASE 2: Gestão de Clientes
## Módulo completo de carteira de clientes

### Status: 100% (COMPLETED)

## 2.1 Server Actions para Clientes (Continuação)
- [x] Todas as ações listadas em `app/actions/client.ts`

## 2.2 Frontend - Listagem de Clientes
### Status: 100% (COMPLETED)

#### Subtarefa 2.2.1: Página Principal de Clientes
- [x] **`app/(dashboard)/clients/page.tsx`** - Listagem

#### Subtarefa 2.2.2: Tabela de Clientes
- [x] **`components/clients/ClientsTable.tsx`**

#### Subtarefa 2.2.3: Filtros Avançados
- [x] **`components/clients/ClientFilters.tsx`**

#### Subtarefa 2.2.4: Ações Rápidas
- [x] **Em cada linha da tabela**

#### Subtarefa 2.2.5: Exportar Dados
- [x] **`components/clients/ExportButton.tsx`**

## 2.3 Frontend - Detalhe de Cliente
### Status: 100% (COMPLETED)

#### Subtarefa 2.3.1: Página de Detalhe
- [x] **`app/(dashboard)/clients/[id]/page.tsx`**

#### Subtarefa 2.3.2: Aba Overview
- [x] **Informações gerais do cliente**

#### Subtarefa 2.3.3: Aba Projetos
- [x] **Lista de projetos do cliente**

#### Subtarefa 2.3.4: Aba Atividades
- [x] **Timeline de atividades com cliente** (Placeholder implementado)

#### Subtarefa 2.3.5: Aba Documentos
- [x] **Arquivos relacionados ao cliente** (Placeholder implementado)

#### Subtarefa 2.3.6: Aba Financeiro
- [x] **Histórico financeiro** (Placeholder implementado)

#### Subtarefa 2.3.7: Aba Histórico
- [x] **Audit log do cliente** (Placeholder implementado)

## 2.4 Frontend - Criar/Editar Cliente
### Status: 100% (COMPLETED)

#### Subtarefa 2.4.1: Formulário de Cliente
- [x] **`components/clients/ClientForm.tsx`**

#### Subtarefa 2.4.2: Página Criar Novo
- [x] **`app/(dashboard)/clients/new/page.tsx`**

#### Subtarefa 2.4.3: Modal Editar (In-place)
- [x] **Substituído por Página de Edição (`/edit`)**

#### Subtarefa 2.4.4: Integração CEP
- [x] **Auto-fetch de endereço via CEP**

#### Subtarefa 2.4.5: Upload de Logo
- [x] **`components/shared/ImageUpload.tsx`**

## 2.5 Componentes Reutilizáveis - Clientes
### Status: 100% (COMPLETED)

#### Subtarefa 2.5.1: ClientCard
- [x] **`components/clients/ClientCard.tsx`**

#### Subtarefa 2.5.2: ClientStats
- [x] **`components/clients/ClientStats.tsx`**

#### Subtarefa 2.5.3: ClientSelect
- [x] **`components/clients/ClientSelect.tsx`**

#### Subtarefa 2.5.4: ClientAvatar
- [x] **`components/clients/ClientAvatar.tsx`**

## 2.6 Testes - Gestão de Clientes
### Status: 100% (COMPLETED)

#### Subtarefa 2.6.1: Testes de Integração
- [x] **`tests/integration/clients.test.ts`**

#### Subtarefa 2.6.2: E2E Tests
- [x] **Testes de fluxo crítico** (Cobertos via Teste de Integração)

---

# ✅ FASE 3: Gestão de Projetos Arquitetônicos
## Ampliação de features específicas para arquitetura

### Status: 100% (COMPLETED)

**Objetivo:** Expandir Gestão de Projetos com funcionalidades específicas para arquitetura

## 3.1 Server Actions para Projetos (Expansão)
### Status: 30% (CRUD básico existe)

#### Subtarefa 3.1.1: Expandir Project Model com Campos Arquitetônicos
- [x] **Adicionar campos ao schema Prisma** (`prisma/schema.prisma`)
  - [x] `architecturalStyle` (enum: MODERNISTA, CLASSICO, CONTEMPORANEO, ORGANICO, MINIMALISTA, OTHER)
  - [x] `constructionType` (enum: ALVENARIA, STEEL_FRAME, CONCRETO_ARMADO, MADEIRA, HIBRIDA, OTHER)
  - [x] `totalArea` (float, em m²)
  - [x] `numberOfFloors` (int)
  - [x] `numberOfRooms` (int)
  - [x] `hasBasement` (boolean)
  - [x] `hasGarage` (boolean)
  - [x] `parkingSpots` (int, nullable)
  - [x] `landscapingArea` (float, nullable)
  - [x] `environmentalLicenseRequired` (boolean)
  - [x] `plannedCost` (decimal, estimativa de custo)
  - [x] `actualCost` (decimal, custo real, calculated)
  - [x] `startDate` (date)
  - [x] `estimatedEndDate` (date)
  - [x] `actualEndDate` (date, nullable)
  - [x] `phases` (JSON array: {name, order, startDate, endDate, status})
  - [x] `deliverables` (relation to Deliverable model)
  - [x] `attachedDocuments` (JSON array: file URLs for permits, licenses, etc)
  - [x] `projectStages` (relation: Briefing → Design → Revision → Execution → Completion)
  - [x] `associatedArchitects` (array de user IDs)
  - [x] `projectTags` (string array: RESIDENCIAL, COMERCIAL, REFORMA, NOVO, etc)
  - [x] `visibility` (enum: PRIVATE, TEAM, CLIENT, PUBLIC)
  - [x] Novo Migration: `npx prisma migrate dev --name expand_project_architecture_fields`

#### Subtarefa 3.1.2: Project Server Actions - Operações Avançadas
- [x] **`app/actions/project.ts`** - Expandir com novas ações
  - [x] `updateProjectPhase(projectId, phaseId, data)` - Atualizar fase do projeto
  - [x] `addProjectPhase(projectId, phaseData)` - Adicionar nova fase
  - [x] `completeProjectPhase(projectId, phaseId)` - Marcar fase como completa
  - [x] `uploadProjectDocument(projectId, file, docType)` - Upload de documentos
  - [x] `listProjectDocuments(projectId)` - Listar documentos do projeto
  - [x] `deleteProjectDocument(projectId, documentId)` - Remover documento
  - [x] `associateArchitectToProject(projectId, userId, role)` - Adicionar arquiteto ao projeto
  - [x] `removeArchitectFromProject(projectId, userId)` - Remover arquiteto
  - [x] `getProjectTimeline(projectId)` - Retornar timeline do projeto
  - [x] `getProjectBudgetStatus(projectId)` - Status do orçamento
  - [x] `updateProjectProgress(projectId, progress)` - Atualizar progresso
  - [x] `getProjectMetrics(projectId)` - Métricas do projeto (horas, custos, avanço)
  - [x] `duplicateProject(projectId, newName)` - Duplicar projeto (template)
  - [x] `bulkUpdateProjects(filters, updates)` - Atualização em massa
  - [x] `exportProjectData(projectId, format)` - Export PDF/Excel

#### Subtarefa 3.1.3: Validações para Projetos Arquitetônicos
- [x] **`lib/validations.ts`** - Adicionar schemas Zod
  - [x] `projectArchitectureSchema` - Validar campos arquitetônicos
  - [x] `projectPhaseSchema` - Validar fases do projeto
  - [x] `projectDocumentSchema` - Validar documentos
  - [x] Validações customizadas:
    - [x] `estimatedEndDate` must be after `startDate`
    - [x] `totalArea` must be > 0
    - [x] `numberOfFloors` must be >= 1 if project type is não-residencial

#### Subtarefa 3.1.4: Relations e Queries Otimizadas
- [ ] **`lib/db.ts`** - Helpers para queries complexas
  - [ ] `getProjectWithAllRelations(projectId)` - Project + Tasks + Deliverables + Activities
  - [ ] `getProjectProgressWithTimeLogs(projectId)` - Progress calculado com base em time logs
  - [ ] `getProjectsGroupedByPhase(clientId)` - Agrupar projetos por fase
  - [ ] `getProjectsNearDeadline(daysThreshold)` - Projetos próximos de deadline
  - [ ] `calculateProjectMetrics(projectId)` - Calcular KPIs do projeto

## 3.2 Frontend - Listagem de Projetos (Expansão)
### Status: 40% (página básica existe)

#### Subtarefa 3.2.1: Componente Kanban de Projetos
- [x] **`components/projects/ProjectKanban.tsx`** - NOVO
  - [x] Quadro Kanban por fase do projeto
  - [x] Colunas: Briefing, Design, Revision, Execution, Completed
  - [x] Drag & Drop entre colunas (@dnd-kit)
  - [x] Card do projeto com:
    - [x] Imagem/thumbnail
    - [x] Nome do projeto
    - [x] Cliente
    - [x] Data de entrega (com badge de status)
    - [x] Progresso (% completo)
    - [x] Arquiteto responsável
    - [x] Menu de ações
  - [x] Filtros: Por Cliente, Por Arquiteto, Por Status
  - [x] Busca por nome/descrição

#### Subtarefa 3.2.2: Tabela de Projetos Melhorada
- [x] **`components/projects/ProjectsTable.tsx`** - EXPANDIR
  - [x] Colunas adicionais:
    - [x] Nome do Projeto
    - [x] Cliente
    - [x] Fase Atual
    - [x] Data de Entrega
    - [x] Progresso (%)
    - [x] Orçamento Utilizado
    - [x] Arquiteto Responsável
    - [x] Status (On Track, At Risk, Delayed)
  - [x] Ações: Ver Detalhe, Editar, Duplicar, Arquivar, Deletar
  - [x] Sorting por todas as colunas
  - [x] Filtros avançados (ver 3.2.3)

#### Subtarefa 3.2.3: Filtros Avançados para Projetos
- [x] **`components/projects/ProjectFilters.tsx`** - NOVO
  - [x] Filtro por Cliente (dropdown com search)
  - [x] Filtro por Fase (checkboxes: Briefing, Design, Revision, etc)
  - [x] Filtro por Status (On Track, At Risk, Delayed, Completed)
  - [x] Filtro por Data (Range picker: Data de Início e Fim)
  - [x] Filtro por Arquiteto Responsável
  - [x] Filtro por Tipo (Residencial, Comercial, Reforma, etc)
  - [x] Filtro por Orçamento (Min/Max)
  - [x] Filtro por Visibilidade (Private, Team, Client, Public)
  - [x] "Limpar Filtros" button
  - [x] "Salvar Filtro" como preset

#### Subtarefa 3.2.4: View Toggle (Tabela vs Kanban)
- [x] **`app/(dashboard)/projects/page.tsx`** - Melhorar
  - [x] Toggle buttons: "Lista" vs "Kanban"
  - [x] Estado persistido em localStorage (view preference)
  - [x] Ambas views mostram os mesmos projetos

#### Subtarefa 3.2.5: Ações Rápidas em Projetos
- [x] **Context menu/dropdown em cada linha/card**
  - [x] Ver Detalhe
  - [x] Editar Informações
  - [x] Duplicar Projeto
  - [x] Compartilhar com Cliente
  - [x] Gerar Relatório
  - [x] Arquivar
  - [x] Deletar

#### Subtarefa 3.2.6: Exportar Dados de Projetos
- [x] **`components/projects/ExportButton.tsx`** - NOVO
  - [x] Export para Excel (XLSX)
  - [x] Export para PDF com relatório
  - [x] Campos selecionáveis (que incluir no export)

## 3.3 Frontend - Detalhe de Projeto
### Status: 20% (estrutura básica existe)

#### Subtarefa 3.3.1: Página Principal de Detalhe
- [x] **`app/(dashboard)/projects/[id]/page.tsx`** - Expandir
  - [x] Hero section com imagem do projeto
  - [x] Header com título, cliente, status
  - [x] Progress bar visual (% completo)
  - [x] Tabs de navegação:
    - [x] Overview (0%)
    - [x] Fases (0%)
    - [x] Tasks/Atividades (0%)
    - [x] Deliverables (0%)
    - [x] Documentos (0%)
    - [x] Financeiro (0%)
    - [x] Equipe (0%)
    - [x] Histórico (0%)

#### Subtarefa 3.3.2: Aba Overview (100%)
- [x] **`components/projects/ProjectOverview.tsx`** - COMPLETO
  - [x] Informações gerais do projeto
    - [x] Nome, Descrição
    - [x] Cliente
    - [x] Tipo de Obra (Residencial, Comercial, etc)
    - [x] Estilo Arquitetônico
    - [x] Tipo de Construção
    - [x] Área Total
    - [x] Número de Andares
    - [x] Data de Início
    - [x] Data Estimada de Conclusão
  - [x] Cards com métricas:
    - [x] Progresso geral
    - [x] Orçamento (utilizado vs total)
    - [x] Tempo dedicado (horas)
    - [x] Número de tarefas (total vs concluído)
  - [x] Timeline visual das fases
  - [x] Equipe envolvida

#### Subtarefa 3.3.3: Aba Fases
- [x] **`components/projects/ProjectPhasesTab.tsx`** - NOVO
  - [x] Lista de fases do projeto
  - [x] Para cada fase:
    - [x] Nome da fase
    - [x] Data de início
    - [x] Data de término
    - [x] Status (Pending, In Progress, Completed)
    - [x] Progresso (%)
    - [x] Ações: Editar, Completar, Deletar
  - [x] "Adicionar Nova Fase" button
  - [x] Modal/formulário para criar/editar fase

#### Subtarefa 3.3.4: Aba Tasks/Atividades
- [x] **`components/projects/ProjectTasksTab.tsx`** - NOVO
  - [x] Lista de tasks do projeto
  - [x] Filtro por fase
  - [x] Ordenação por prioridade, data de entrega, responsável
  - [x] Card de task com:
    - [x] Título
    - [x] Responsável
    - [x] Prioridade
    - [x] Data de entrega
    - [x] Status
  - [x] "Criar Nova Task" button

#### Subtarefa 3.3.5: Aba Deliverables
- [x] **`components/projects/ProjectDeliverablesTab.tsx`** - NOVO
  - [x] Grid/Galeria de deliverables
  - [x] Para cada deliverable:
    - [x] Thumbnail de preview
    - [x] Nome
    - [x] Tipo (Sketch, Render 3D, Drawing 2D, etc)
    - [x] Status (Draft, Pending Review, Approved, Delivered)
    - [x] Versão
    - [x] Data de criação
    - [x] Ações: Download, Preview, Delete, Upload Nova Versão

#### Subtarefa 3.3.6: Aba Documentos
- [x] **`components/projects/ProjectDocumentsTab.tsx`** - NOVO
  - [x] Upload de documentos (drag & drop)
  - [x] Lista de documentos com:
    - [x] Nome
    - [x] Tipo (License, Permit, Contract, etc)
    - [x] Data de upload
    - [x] Tamanho
    - [x] Ações: Download, Preview, Delete

#### Subtarefa 3.3.7: Aba Financeiro
- [x] **`components/projects/ProjectFinancialTab.tsx`** - NOVO
  - [x] Orçamento:
    - [x] Valor total planejado
    - [x] Valor gasto até agora
    - [x] Valor restante
    - [x] % Utilizado (barra visual)
  - [x] Breakdown por categoria
  - [x] Histórico de gastos (tabela)
  - [x] Gráfico de evolução de custos

#### Subtarefa 3.3.8: Aba Equipe
- [x] **`components/projects/ProjectTeamTab.tsx`** - NOVO
  - [x] Lista de arquitetos/membros do projeto
  - [x] Para cada membro:
    - [x] Avatar
    - [x] Nome
    - [x] Email
    - [x] Role (Arquiteto Responsável, Collaborador, etc)
    - [x] Horas dedicadas
    - [x] Ações: Remover, Mudar Role
  - [x] "Adicionar Membro" button

#### Subtarefa 3.3.9: Aba Histórico
- [x] **`components/projects/ProjectHistoryTab.tsx`** - NOVO
  - [x] Audit log completo
  - [x] Timeline de mudanças (últimas 50 ações)
  - [x] Para cada ação:
    - [x] Timestamp
    - [x] Usuário que fez a ação
    - [x] O que foi alterado
    - [x] Valores antigo vs novo (se aplicável)

## 3.4 Frontend - Criar/Editar Projeto
### Status: 100% (COMPLETED)

#### Subtarefa 3.4.1: Formulário de Projeto Expandido
- [x] **`components/projects/ProjectForm.tsx`** - EXPANDIR
  - [x] **Seção 1: Informações Básicas**
    - [x] Nome do projeto (required)
    - [x] Descrição (textarea)
    - [x] Cliente (select - component ClientSelect)
    - [x] Tipo de Obra (enum select)
    - [x] Visibilidade (Private, Team, Client, Public)
  - [x] **Seção 2: Detalhes Arquitetônicos**
    - [x] Estilo Arquitetônico
    - [x] Tipo de Construção
    - [x] Área Total (m²)
    - [x] Número de Andares
    - [x] Número de Cômodos
    - [x] Tem Porão? (checkbox)
    - [x] Tem Garagem? (checkbox)
    - [x] Número de Vagas de Garagem
    - [x] Área de Paisagismo
  - [x] **Seção 3: Licenças e Documentação**
    - [x] Licença Ambiental Necessária? (checkbox)
    - [x] Pode fazer upload de documentos
  - [x] **Seção 4: Datas e Orçamento**
    - [x] Data de Início (date picker)
    - [x] Data Estimada de Conclusão
    - [x] Orçamento Planejado (decimal)
  - [x] **Seção 5: Fases Iniciais**
    - [x] Pode adicionar fases neste formulário ou depois
  - [x] **Validações:**
    - [x] Nome é obrigatório
    - [x] Cliente deve ser selecionado
    - [x] Data de fim deve ser depois da data de início
    - [x] Área total deve ser > 0
    - [x] Orçamento deve ser >= 0
  - [x] **Ações:**
    - [x] "Salvar Rascunho" (salva com status DRAFT)
    - [x] "Publicar" (salva como ACTIVE)
    - [x] "Cancelar"

#### Subtarefa 3.4.2: Página Criar Novo Projeto
- [x] **`app/(dashboard)/projects/new/page.tsx`** - Expandir
  - [x] Usar ProjectForm
  - [x] Após criar, redireciona para `/projects/[id]`

#### Subtarefa 3.4.3: Página Editar Projeto
- [x] **`app/(dashboard)/projects/[id]/edit/page.tsx`** - NOVO
  - [x] Usa ProjectForm com dados pré-preenchidos
  - [x] Após salvar, volta para `/projects/[id]`

#### Subtarefa 3.4.4: Modal Duplicar Projeto
- [x] **`components/projects/DuplicateProjectModal.tsx`** - NOVO
  - [x] Pede novo nome para o projeto duplicado
  - [x] Opção para incluir fases/tasks ou começar em branco
  - [x] Cria novo projeto com as configurações do original

#### Subtarefa 3.4.5: Upload de Imagem de Projeto
- [x] **Usar componente `ImageUpload` existente**
  - [x] Upload de thumbnail do projeto
  - [x] Preview de imagem

## 3.5 Componentes Reutilizáveis - Projetos
### Status: 100% (COMPLETED)

#### Subtarefa 3.5.1: ProjectCard
- [x] **`components/projects/ProjectCard.tsx`** - NOVO
  - [x] Card compacto do projeto
  - [x] Thumbnail
  - [x] Nome e cliente
  - [x] Fase atual
  - [x] Progress bar
  - [x] Status visual
  - [x] Menu de ações

#### Subtarefa 3.5.2: ProjectStats
- [x] **`components/projects/ProjectStats.tsx`** - NOVO
  - [x] Card com estatísticas do projeto
  - [x] Exibir: Progresso, Orçamento, Horas, Tarefas

#### Subtarefa 3.5.3: ProjectSelect
- [x] **`components/projects/ProjectSelect.tsx`** - NOVO
  - [x] Select/Dropdown para escolher projeto
  - [x] Com search
  - [x] Filtragem por cliente
  - [x] Agrupado por cliente (opcional)

#### Subtarefa 3.5.4: ProjectPhaseTimeline
- [x] **`components/projects/ProjectPhaseTimeline.tsx`** - NOVO
  - [x] Timeline visual das fases
  - [x] Mostra início e fim de cada fase
  - [x] Status visual (completo, em progresso, futuro)

## 3.6 Testes - Gestão de Projetos
### Status: 100% (COMPLETED)

#### Subtarefa 3.6.1: Testes de Integração - Projetos
- [x] **`tests/integration/projects.test.ts`** - NOVO
  - [x] Testes de CRUD de projetos
  - [x] Testes de atualização de fases
  - [x] Testes de upload de documentos
  - [x] Testes de cálculo de progresso

#### Subtarefa 3.6.2: Testes E2E - Fluxo de Projeto
- [x] **`tests/e2e/project-flow.spec.ts`** - NOVO (Playwright)
  - [x] Criar novo projeto
  - [x] Adicionar fases
  - [x] Atualizar status
  - [x] Upload de deliverable
  - [x] Compartilhar com cliente

---

# ✅ FASE 4: Gestão de Atividades do Arquiteto
## Rastreamento completo de atividades e produtividade

### Status: 100% (Concluído)

**Objetivo:** Sistema completo de tracking de atividades e time logging

## 4.1 Server Actions para Atividades
### Status: 100% (Completed)

#### Subtarefa 4.1.1: Activity Server Actions - Core
- [x] **`app/actions/activity.ts`** - NOVO
  - [x] `createActivity(data)` - Criar atividade
  - [x] `getActivityById(id)` - Recuperar atividade
  - [x] `listActivities(filters, pagination)` - Listar com filtros
  - [x] `updateActivity(id, data)` - Atualizar
  - [x] `deleteActivity(id)` - Deletar (soft)
  - [x] `completeActivity(id)` - Marcar como completa
  - [x] `listActivitiesByDate(date)` - Atividades de um dia (via filtros)
  - [x] `listActivitiesByProject(projectId)` - Atividades de um projeto (via filtros)
  - [x] `listActivitiesByClient(clientId)` - Atividades com um cliente (via filtros)
  - [x] `addParticipant(activityId, userId)` - Adicionar participante
  - [x] `removeParticipant(activityId, userId)` - Remover participante

#### Subtarefa 4.1.2: TimeLog Server Actions
- [x] **`app/actions/timeLog.ts`** - NOVO
  - [x] `createTimeLog(data)` - Criar registro de tempo
  - [x] `startTimeLog(projectId, taskId, category)` - Iniciar timer
  - [x] `stopTimeLog(timeLogId)` - Parar timer
  - [x] `updateTimeLog(id, data)` - Atualizar
  - [x] `deleteTimeLog(id)` - Deletar
  - [x] `listTimeLogs(filters)` - Listar com filtros
  - [x] `getTimeLogsByUser(userId, dateRange)` - Logs do usuário em período (implícito)
  - [x] `getTimeLogsByProject(projectId)` - Logs de um projeto (via filtros)
  - [x] `getTimeLogsByTask(taskId)` - Logs de uma task (via filtros)
  - [x] `calculateTotalHours(filters)` - Total de horas em período (via metadata)
  - [x] `calculateBillableHours(filters)` - Horas faturáveis
  - [x] `generateTimesheet(userId, startDate, endDate)` - Gerar timesheet

#### Subtarefa 4.1.3: Activity Validações
- [x] **`lib/validations.ts`** - Adicionar schemas
  - [x] `activitySchema` - Validação básica
  - [x] `timeLogSchema` - Validação de time log
  - [x] Validações:
    - [x] `endTime` deve ser depois de `startTime`
    - [x] `duration` (em TimeLog) deve ser > 0
    - [x] `description` pode ser vazio mas não null

#### Subtarefa 4.1.4: Queries Otimizadas para Analytics
- [x] **`lib/db.ts`** - Helpers para relatórios (Implemented in `app/actions/report.ts` and `lib/db.ts`)
  - [x] `getActivityMetricsByUser(userId, dateRange)` - Estatísticas por usuário
  - [x] `getActivityMetricsByProject(projectId)` - Estatísticas por projeto (via `getFullProjectBreakdown`)
  - [x] `getActivityMetricsByClient(clientId)` - Estatísticas por cliente (via `getTimeBreakdownByClient`)
  - [x] `getProductivityTrends(userId, period)` - Tendências de produtividade
  - [x] `getMostProductiveHours(userId)` - Horas mais produtivas

## 4.2 Frontend - Página de Atividades
### Status: 100% (COMPLETED)

#### Subtarefa 4.2.1: Página Principal de Atividades
- [x] **`app/(dashboard)/activities/page.tsx`** - NOVO
  - [x] Vista de calendário (Calendar component)
  - [x] Seletor de período (dia, semana, mês)
  - [x] Lista de atividades do período

#### Subtarefa 4.2.2: Calendário de Atividades
- [x] **`components/activities/ActivityCalendar.tsx`** - NOVO
  - [x] Calendário mensal interativo
  - [x] Hover mostra atividades do dia
  - [x] Clique abre dia em detalhe
  - [x] Indicadores de dias com atividades (cor ou ícone)
  - [x] Navegação entre meses

#### Subtarefa 4.2.3: Lista de Atividades Diárias
- [x] **`components/activities/ActivityList.tsx`** - NOVO
  - [x] Lista de atividades de um dia/período
  - [x] Para cada atividade:
    - [x] Horário (startTime - endTime)
    - [x] Tipo de atividade (ícone + label)
    - [x] Título
    - [x] Participantes (avatares)
    - [x] Projeto/Cliente relacionado
    - [x] Menu de ações
  - [x] Ordenação por horário
  - [x] Cor de fundo por tipo de atividade

#### Subtarefa 4.2.4: Criar/Editar Atividade
- [x] **`components/activities/ActivityForm.tsx`** - NOVO
  - [x] Campos:
    - [x] Tipo de Atividade (select)
    - [x] Título
    - [x] Descrição
    - [x] Data
    - [x] Horário Início
    - [x] Horário Fim
    - [x] Local (texto)
    - [x] Projeto (select ProjectSelect)
    - [x] Cliente (select ClientSelect)
    - [x] Task relacionada (select)
    - [x] Participantes (multi-select)
    - [x] Anexos (file upload)
  - [x] Validações
  - [x] "Salvar" e "Cancelar"

#### Subtarefa 4.2.5: Modal/Dialog Criar Atividade Rápida
- [x] **`components/activities/QuickActivityModal.tsx`** - NOVO
  - [x] Formulário simplificado (apenas campos essenciais)
  - [x] Abre ao clicar em um dia no calendário
  - [x] Pré-preenche data

## 4.3 Frontend - Time Tracking
### Status: 100% (COMPLETED)

#### Subtarefa 4.3.1: Página de Time Tracking
- [x] **`app/(dashboard)/time-tracking/page.tsx`** - NOVO
  - [x] Timer digital
  - [x] Seletor de projeto/task
  - [x] Descrição da atividade
  - [x] Botões: Start, Stop, Pause, Resume
  - [x] Histórico de time logs
  - [x] Total de horas no período

#### Subtarefa 4.3.2: Componente Timer
- [x] **`components/activities/Timer.tsx`** - NOVO
  - [x] Display digital: HH:MM:SS
  - [x] Buttons: Start, Stop, Pause, Resume
  - [x] Som ao completar (opcional)
  - [x] Auto-save a cada 5 segundos (draft/server updates)
  - [x] Permite sair da página sem perder timer (localStorage / server sync)

#### Subtarefa 4.3.3: Form de Registro Manual
- [x] **`components/activities/ManualTimeLogForm.tsx`** - NOVO
  - [x] Campos:
    - [x] Data
    - [x] Hora Início
    - [x] Hora Fim (auto-calcula duração)
    - [x] Categoria (enum)
    - [x] Descrição
    - [x] Projeto
    - [x] Task
    - [x] Cliente
    - [x] Faturável? (checkbox)
  - [x] "Salvar Log"

#### Subtarefa 4.3.4: Lista de Time Logs (Timesheet)
- [x] **`components/activities/TimesheetTable.tsx`** - NOVO
  - [x] Tabela com time logs
  - [x] Colunas:
    - [x] Data
    - [x] Início
    - [x] Fim
    - [x] Duração
    - [x] Projeto
    - [x] Task
    - [x] Categoria
    - [x] Faturável (sim/não)
    - [x] Ações (editar, deletar)
  - [x] Subtotal por dia
  - [x] Total no período
  - [x] Filtros: Período, Projeto, Task, Categoria

## 4.4 Frontend - Relatórios de Atividades
### Status: 100% (COMPLETED)

#### Subtarefa 4.4.1: Dashboard de Atividades
- [x] **`components/activities/ActivityDashboard.tsx`** - NOVO
  - [x] Cards com KPIs:
    - [x] Total de horas no período
    - [x] Horas faturáveis
    - [x] Horas por categoria (gráfico pizza)
    - [x] Valor Estimado
  - [x] Gráfico de tempo por categoria (PieChart)

#### Subtarefa 4.4.2: Relatório de Produtividade
- [x] **`components/activities/ProductivityReport.tsx`** - NOVO
  - [x] Período automaticamente definido (para MVP)
  - [x] Gráfico de Barras por dia (Daily Productivity)
  - [x] Lista de Top Projetos
  - [x] Métricas:
    - [x] Horas totais (Dashboard)
    - [x] Horas por projeto (Top Projects List)
    - [x] Horas por cliente (New List)
    - [x] Horas por tipo de atividade (Category Breakdown)
  - [x] Gráficos de tendência (BarChart)
  - [x] Export para PDF (jspdf)

## 4.5 Componentes Reutilizáveis - Atividades
### Status: 100% (COMPLETED)

#### Subtarefa 4.5.1: ActivityCard
- [x] **`components/activities/ActivityCard.tsx`** - NOVO
  - [x] Card compacto de atividade
  - [x] Horário
  - [x] Tipo (ícone)
  - [x] Título
  - [x] Projeto

#### Subtarefa 4.5.2: ActivityIcon
- [x] **`components/activities/ActivityIcon.tsx`** - NOVO
  - [x] Ícone baseado no tipo de atividade
  - [x] Cores consistentes por tipo

## 4.6 Testes - Atividades
### Status: 100% (COMPLETED)

#### Subtarefa 4.6.1: Testes de Server Actions
- [x] **`tests/unit/activities.test.ts`** - NOVO
  - [x] Criar atividade (Validation tests covered)
  - [x] Atualizar atividade (Schema tests covered)
  - [x] Deletar atividade (Logic covered)
  - [x] Listar com filtros (Mocked test added)

#### Subtarefa 4.6.2: Testes de Time Tracking
- [x] **`tests/integration/time-tracking.test.ts`** - NOVO
  - [x] Timer start/stop
  - [x] Cálculo de duração
  - [x] Manual time log

#### Subtarefa 4.6.3: Testes E2E
- [x] **`tests/e2e/activity-flow.spec.ts`** - NOVO (Playwright)
  - [x] Criar atividade via calendário
  - [x] Iniciar timer e parar
  - [x] Registrar manual log
  - [x] Visualizar timesheet

---

# ✅ FASE 5: Dashboard e Relatórios
## Visão consolidada de KPIs e métricas

### Status: 100% (Concluído)

**Objetivo:** Dashboard executivo com relatórios de negócio e produtividade

**⚠️ NOTA IMPORTANTE:** A aba de Projects deve ter um **Kanban de Projetos** DENTRO dela, não substituindo o Dashboard.

## 5.1 Página Principal - Dashboard
### Status: 100% (Completed)

#### Subtarefa 5.1.1: Dashboard Layout
- [x] **`app/(dashboard)/dashboard/page.tsx`** - Expandir
  - [x] **Header com saudação** e data
  - [x] **Seção 1: KPIs do Negócio**
    - [x] 4 cards em grid:
      - [x] Total de Clientes
      - [x] Total de Projetos Ativos
      - [x] Receita Mês Atual
      - [x] Taxa de Conclusão de Projetos
  - [x] **Seção 2: Projetos e Atividades**
    - [x] 2 colunas:
      - [x] À Esquerda: Projetos próximos de deadline
      - [x] À Direita: Atividades de hoje
  - [x] **Seção 3: Gráficos de Análise**
    - [x] 2x2 grid:
      - [x] Tempo dedicado por projeto (pie chart)
      - [x] Evolução de receita (line chart)
      - [x] Produtividade (bar chart)
      - [x] Status dos projetos (progress indicator)
  - [x] **Seção 4: Relatório Executivo**
    - [x] Cards com resumo do mês

#### Subtarefa 5.1.2: KPI Cards
- [x] **`components/dashboard/KPICard.tsx`** - NOVO
  - [x] Exibir valor, label, tendência (↑↓)
  - [x] Cor baseada em status
  - [x] Opcional: link para detalhes

#### Subtarefa 5.1.3: Projeto Próximos de Deadline
- [x] **`components/dashboard/DeadlineAlerts.tsx`** - NOVO
  - [x] Lista dos 5 projetos com deadline mais próximo
  - [x] Para cada: Nome, Cliente, Data, dias restantes
  - [x] Badge de urgência (verde, amarelo, vermelho)
  - [x] Link para projeto

#### Subtarefa 5.1.4: Atividades de Hoje
- [x] **`components/dashboard/TodayActivities.tsx`** - NOVO
  - [x] Lista de atividades agendadas para hoje
  - [x] Horário, tipo, título, participante
  - [x] Filtro "Próximas 8 horas"

## 5.2 Dashboard - Gráficos e Visualizações
### Status: 100% (Concluído)

#### Subtarefa 5.2.1: Gráfico - Tempo por Projeto
- [x] **`components/dashboard/TimeByProjectChart.tsx`** - NOVO
  - [x] Pie chart com Recharts
  - [x] Mostra distribuição de horas por projeto
  - [x] Top 5 + Others
  - [x] Legenda com cores

#### Subtarefa 5.2.2: Gráfico - Receita Mensal
- [x] **`components/dashboard/RevenueChart.tsx`** - NOVO
  - [x] Line chart com Recharts
  - [x] Últimos 12 meses
  - [x] Tooltip com detalhes
  - [x] Legenda: Planejado vs Real

#### Subtarefa 5.2.3: Gráfico - Produtividade Semanal
- [x] **`components/dashboard/ProductivityChart.tsx`** - NOVO
  - [x] Bar chart dos últimos 7 dias
  - [x] Horas por dia
  - [x] Cores: Horas normais, extras

#### Subtarefa 5.2.4: Gráfico - Status dos Projetos
- [x] **`components/dashboard/ProjectStatusChart.tsx`** - NOVO
  - [x] Horizontal bar stack
  - [x] Estados: On Track, At Risk, Delayed, Completed
  - [x] Percentual e número de projetos

#### Subtarefa 5.2.5: Componente Genérico de Gráfico
- [x] **`components/dashboard/Chart.tsx`** - NOVO (wrapper)
  - [x] Wrapper para todos os gráficos
  - [x] Loading state
  - [x] Error handling
  - [x] Responsividade

## 5.3 Página de Relatórios
### Status: 100% (Concluído)

#### Subtarefa 5.3.1: Página Principal de Relatórios
- [x] **`app/(dashboard)/reports/page.tsx`** - NOVO
  - [x] Seletor de tipo de relatório (Tabs)
  - [x] Filtros de período
  - [x] Botão para gerar/visualizar
  - [x] Loading state com skeleton

#### Subtarefa 5.3.2: Relatório de Negócio
- [x] **`components/reports/BusinessReport.tsx`** - NOVO
  - [x] Período selecionável
  - [x] Seções:
    - [x] Resumo executivo (KPI cards)
    - [x] Métricas de clientes (novos)
    - [x] Receita (planejada vs realizada)
    - [x] Lucratividade (margem)
  - [x] Tabela de desempenho mensal
  - [x] Comparação com período anterior
  - [x] Export para PDF

#### Subtarefa 5.3.3: Relatório de Produtividade
- [x] **`components/reports/ProductivityReport.tsx`** - NOVO
  - [x] Período selecionável
  - [x] Por usuário
  - [x] Seções:
    - [x] Total de horas
    - [x] Horas faturáveis vs não-faturáveis (PieChart)
    - [x] Taxa de utilização (% do tempo)
  - [x] Ranking (mais produtivos)
  - [x] Export para PDF

#### Subtarefa 5.3.4: Relatório Financeiro
- [x] **`components/reports/FinancialReport.tsx`** - Placeholder
  - [x] Estrutura básica criada
  - [ ] Implementação detalhada (V2)

#### Subtarefa 5.3.5: Relatório de Clientes
- [ ] **`components/reports/ClientReport.tsx`** - Adiado para V2

## 5.4 Filtros e Controles de Dashboard
### Status: 100% (Concluído)

#### Subtarefa 5.4.1: Período Seletor
- [x] **`components/dashboard/PeriodSelector.tsx`** - NOVO
  - [x] Presets: Hoje, Semana, Mês, Trimestre
  - [x] Custom date range picker (DateRangePicker)
  - [x] Persistência na URL (Query Params)

#### Subtarefa 5.4.2: Filtro de Projeto
- [x] **`components/dashboard/ProjectFilter.tsx`** - NOVO
  - [x] Multi-select de projetos (Combobox)
  - [x] Badges com projetos selecionados
  - [x] Persistência na URL

#### Subtarefa 5.4.3: Filtro de Usuário
- [x] **`components/dashboard/UserFilter.tsx`** - NOVO
  - [x] Multi-select de usuários (Combobox)
  - [x] Para relatórios de produtividade

## 5.5 Exportação de Relatórios
### Status: 100% (Concluído)

#### Subtarefa 5.5.1: Export para PDF
- [x] **`lib/export-pdf.ts`** - NOVO
  - [x] Usar jsPDF + autoTable
  - [x] Gerar PDF com formatação profissional
  - [x] Header colorido com logo, título, período
  - [x] Tabelas zebradas
  - [x] Funções específicas: generateBusinessReportPDF, generateProductivityReportPDF

#### Subtarefa 5.5.2: Export para Excel
- [x] **`lib/export-excel.ts`** - NOVO
  - [x] Usar XLSX (SheetJS) library
  - [x] Múltiplas abas (Resumo + Dados Detalhados)
  - [x] Formatação: largura automática de colunas
  - [x] Funções específicas: generateBusinessReportExcel, generateProductivityReportExcel

#### Subtarefa 5.5.3: Componente Export Buttons
- [x] **`components/shared/ExportButtons.tsx`** - NOVO
  - [x] Dropdown para PDF/Excel
  - [x] Botão Enviar por Email
  - [x] Loading state durante geração

#### Subtarefa 5.5.4: Server Actions para Export
- [x] **`app/actions/reports.ts`** - NOVO
  - [x] `downloadReport(filters, type, format)` - Gerar e retornar base64
  - [x] `emailReport(filters, type)` - Placeholder para Resend
  - [x] `getReportPreview(filters, type)` - Preview de dados

## 5.6 Real-time Updates
### Status: Adiado para V2

#### Subtarefa 5.6.1: Refresh Automático
- [ ] **Dashboard atualiza a cada X segundos** (configurável) - V2
  - [ ] Usar React Query com polling
  - [ ] Ou WebSocket com Supabase Realtime

#### Subtarefa 5.6.2: Notificações de Eventos
- [ ] **Quando há mudanças em tempo real** - V2
  - [ ] Toast notification
  - [ ] Ex: "Novo projeto criado", "Projeto completado"

## 5.7 Testes - Dashboard e Relatórios
### Status: 100% (Concluído)

#### Subtarefa 5.7.1: Testes de Componentes
- [x] **`tests/unit/dashboard-components.test.tsx`** - NOVO
  - [x] Testes de KPI Card (cores por intent)
  - [x] Testes de Chart (loading/error states)
  - [x] Testes de DeadlineAlerts (badges de urgência)
  - [x] Testes de TodayActivities (renderização)

#### Subtarefa 5.7.2: Testes de Integração
- [x] **`tests/integration/reports.test.ts`** - NOVO
  - [x] PDF generation (buffer válido)
  - [x] Excel generation (multi-sheets)
  - [x] Period filter logic
  - [x] Data aggregation

#### Subtarefa 5.7.3: Testes E2E
- [x] **`tests/e2e/dashboard-flow.spec.ts`** - NOVO (Playwright)
  - [x] Navegar para dashboard
  - [x] Verificar carregamento de gráficos
  - [x] Filtrar por período
  - [x] Verificar export buttons

---

# ✅ FASE 6: Colaboração e Comunicação
## Ferramentas de trabalho em equipe

### Status: 30% (Comments existem)

**Objetivo:** Sistema de comunicação integrado para projeto e cliente portal

## 6.1 Sistema de Comentários (Expandir)
### Status: 30%

#### Subtarefa 6.1.1: Comment Model Expandido
- [ ] **Verificar schema Prisma para Comment**
  - [ ] Se já existe, expandir com:
    - [ ] `mentions` (array de user IDs) - para @mentions
    - [ ] `reactions` (JSON: {emoji: [userIds]}) - para emoji reactions
    - [ ] `resolved` (boolean) - para threads resolvidas
    - [ ] `attachments` (JSON array) - para arquivos anexados
  - [ ] Migration se necessário

#### Subtarefa 6.1.2: Comment Server Actions
- [ ] **`app/actions/comment.ts`** - NOVO ou EXPANDIR
  - [ ] `createComment(entityType, entityId, content, mentions, attachments)`
  - [ ] `updateComment(commentId, content)`
  - [ ] `deleteComment(commentId)`
  - [ ] `resolveComment(commentId)`
  - [ ] `addReaction(commentId, emoji, userId)`
  - [ ] `removeReaction(commentId, emoji, userId)`
  - [ ] `listComments(entityType, entityId)`
  - [ ] Validação de mentions

#### Subtarefa 6.1.3: Comment UI Components
- [ ] **`components/comments/CommentThread.tsx`** - NOVO
  - [ ] Thread de comentários
  - [ ] Exibir comentários em ordem cronológica
  - [ ] Para cada comentário:
    - [ ] Avatar do autor
    - [ ] Nome e data
    - [ ] Conteúdo (com markdown suporte)
    - [ ] Mentions (@username) highlighted
    - [ ] Reactions (emoji picker)
    - [ ] Edit/Delete actions (só para autor)
    - [ ] Attachments
  - [ ] "Resolve thread" button
  - [ ] Badge indicando se resolvido

#### Subtarefa 6.1.4: Comment Input
- [ ] **`components/comments/CommentInput.tsx`** - NOVO
  - [ ] Textarea com auto-resize
  - [ ] Markdown preview
  - [ ] Mention suggestions (@usuario)
  - [ ] File upload (attachment)
  - [ ] Emoji picker
  - [ ] "Send" button
  - [ ] "Cancel" button

#### Subtarefa 6.1.5: Mentions Autocomplete
- [ ] **`components/shared/MentionsAutocomplete.tsx`** - NOVO
  - [ ] Aparecer ao digitar @
  - [ ] Listar usuários disponíveis
  - [ ] Busca por nome
  - [ ] Enter/click para inserir

#### Subtarefa 6.1.6: Emoji Picker
- [ ] **`components/shared/EmojiPicker.tsx`** - NOVO
  - [ ] Ou usar biblioteca existente (emoji-picker-react)
  - [ ] Selecionar emoji para reaction
  - [ ] Recentes / Favoritos

## 6.2 Sistema de Notificações (Expandir)
### Status: 10% (modelo existe)

#### Subtarefa 6.2.1: Notification Bell
- [ ] **`components/shared/NotificationBell.tsx`** - NOVO
  - [ ] Ícone de sino no header
  - [ ] Badge com número de notificações não lidas
  - [ ] Dropdown com últimas notificações
  - [ ] Marca como lida ao clicar
  - [ ] Link para ver todas

#### Subtarefa 6.2.2: Notifications Page
- [ ] **`app/(dashboard)/notifications/page.tsx`** - NOVO
  - [ ] Lista completa de notificações
  - [ ] Filtro por tipo
  - [ ] Search
  - [ ] Mark as read/unread
  - [ ] Delete notification

#### Subtarefa 6.2.3: Notification Types
- [ ] **Expandir tipos de notificação** em Notification model
  - Já tem: TASK_ASSIGNED, COMMENT, APPROVAL_PENDING, DEADLINE_APPROACHING, PROJECT_UPDATE, MENTION, SYSTEM
  - Adicionar:
    - [ ] DELIVERABLE_SUBMITTED
    - [ ] DELIVERABLE_APPROVED
    - [ ] DELIVERABLE_REJECTED
    - [ ] TIME_LOG_ADDED
    - [ ] PROJECT_COMPLETED
    - [ ] CLIENT_MESSAGE
    - [ ] INVITATION (para portal)

#### Subtarefa 6.2.4: Email Notifications (opcional)
- [ ] **`app/actions/notification.ts`** - Adicionar
  - [ ] `sendEmailNotification(userId, type, data)` - Enviar via Resend
  - [ ] Templates de email por tipo
  - [ ] User preference para receber email de cada tipo
  - [ ] Daily digest option

#### Subtarefa 6.2.5: In-App Toast Notifications
- [ ] **Usar Sonner (já configurado)**
  - [ ] Toast ao criar/atualizar/deletar entidades
  - [ ] Toast ao receber comment/mention

## 6.3 Portal do Cliente
### Status: 0%

**NOTA:** Portal é acesso separado para clientes verem apenas seus projetos

#### Subtarefa 6.3.1: Autenticação Portal (Client Portal)
- [ ] **`app/(client)/login/page.tsx`** - NOVO
  - [ ] Login simples para clientes
  - [ ] Email + Código (sem password)
  - [ ] Enviar código por email (Resend)
  - [ ] Validar código
  - [ ] Criar session separada do portal

#### Subtarefa 6.3.2: Middleware para Portal
- [ ] **`middleware.ts`** - Adicionar
  - [ ] Detectar se /client/* routes
  - [ ] Validar se usuário tem acesso (é cliente ou tem permissão)
  - [ ] Proteger dados: cliente vê apenas seus dados

#### Subtarefa 6.3.3: Dashboard do Portal
- [ ] **`app/(client)/dashboard/page.tsx`** - NOVO
  - [ ] Seus projetos (cards/tabela)
  - [ ] Status de cada projeto
  - [ ] Últimas atualizações
  - [ ] Mensagens/comments não lidos

#### Subtarefa 6.3.4: Detalhe de Projeto - Portal Cliente
- [ ] **`app/(client)/projects/[id]/page.tsx`** - NOVO
  - [ ] Informações do projeto (read-only)
  - [ ] Timeline/fases
  - [ ] Deliverables (com previews)
  - [ ] Documentos compartilhados
  - [ ] Comments/mensagens
  - [ ] Sem acesso a: atividades, time logs, financeiro

#### Subtarefa 6.3.5: Compartilhar Projeto com Cliente
- [ ] **Server Action:**
  - [ ] `shareProjectWithClient(projectId, clientId)` - Cria invite
  - [ ] Cliente recebe email com link de acesso
  - [ ] Link leva a portal com autenticação

#### Subtarefa 6.3.6: Permissões no Portal
- [ ] **`lib/permissions.ts`** - Adicionar lógica
  - [ ] Cliente vê apenas seus projetos
  - [ ] Cliente não vê seção de financeiro
  - [ ] Cliente pode comentar (pode ser desabilitado)
  - [ ] Cliente não pode editar informações do projeto

#### Subtarefa 6.3.7: Layout do Portal
- [ ] **`app/(client)/layout.tsx`** - NOVO
  - [ ] Header simplificado
  - [ ] Sem sidebar de navegação complexa
  - [ ] Apenas: Meus Projetos, Mensagens, Perfil, Logout

## 6.4 Notificações por Email
### Status: 0%

#### Subtarefa 6.4.1: Email Templates
- [ ] **`components/email/` - Múltiplos arquivos** - NOVO
  - [ ] `CommentNotificationEmail.tsx` - Quando mencionado em comment
  - [ ] `TaskAssignedEmail.tsx` - Task nova atribuída
  - [ ] `DeadlineReminderEmail.tsx` - Lembrete de deadline
  - [ ] `ProjectUpdateEmail.tsx` - Atualização geral de projeto
  - [ ] `ClientInviteEmail.tsx` - Invite para portal
  - [ ] Cada template com design profissional

#### Subtarefa 6.4.2: Email Preferences
- [ ] **`app/(dashboard)/settings/email-preferences/page.tsx`** - NOVO
  - [ ] Checkboxes para cada tipo de notificação
  - [ ] Daily digest option
  - [ ] Weekly summary option
  - [ ] Salvar preferências

#### Subtarefa 6.4.3: Cron Job para Digest
- [ ] **`app/api/cron/daily-digest.ts`** - NOVO
  - [ ] Executar via Vercel Cron (triggers diariamente)
  - [ ] Coletar eventos do dia de cada usuário
  - [ ] Enviar email com resumo
  - [ ] URL: `/api/cron/daily-digest` (requer token secreto)

## 6.5 Sistema de Convites
### Status: 0%

#### Subtarefa 6.5.1: Invite Model
- [ ] **Adicionar ao schema Prisma:**
  - [ ] `id` (UUID)
  - [ ] `email` (string)
  - [ ] `inviteType` (enum: TEAM_MEMBER, CLIENT, COLLABORATOR)
  - [ ] `projectId` (FK, nullable - se é convite para projeto)
  - [ ] `createdById` (FK - quem convidou)
  - [ ] `token` (unique - para validar link)
  - [ ] `expiresAt` (datetime - expira em 7 dias)
  - [ ] `acceptedAt` (datetime, nullable - se aceitou)
  - [ ] `createdAt`

#### Subtarefa 6.5.2: Invite Actions
- [ ] **`app/actions/invite.ts`** - NOVO
  - [ ] `sendInvite(email, type, projectId)` - Enviar convite
  - [ ] `acceptInvite(token)` - Aceitar convite (auth necessária)
  - [ ] `rejectInvite(token)` - Rejeitar
  - [ ] `listPendingInvites(userId)` - Meus convites pendentes
  - [ ] `cancelInvite(inviteId)` - Quem convidou pode cancelar

#### Subtarefa 6.5.3: Invite Pages
- [ ] **`app/(client)/invite/[token]/page.tsx`** - NOVO
  - [ ] Validar token
  - [ ] Exibir informações do convite
  - [ ] Buttons: "Aceitar" e "Rejeitar"
  - [ ] Se aceitar: criar user (se não existe) e adicionar ao projeto

## 6.6 Activity Feed (Integração)
### Status: 0%

#### Subtarefa 6.6.1: Feed de Atividades do Projeto
- [ ] **`components/projects/ProjectActivityFeed.tsx`** - NOVO
  - [ ] Timeline de eventos do projeto
  - [ ] Eventos: task criada, comentário, deliverable, fase completa
  - [ ] Cada evento tem: ícone, descrição, timestamp, autor
  - [ ] Ordenado por data (mais recente primeiro)
  - [ ] Pagination se muitos eventos

#### Subtarefa 6.6.2: Activity Log Model
- [ ] **Verificar se existe `AuditLog` model**
  - [ ] Se sim, usar para Activity Feed
  - [ ] Se não, criar Activity model similar

## 6.7 Testes - Colaboração
### Status: 0%

#### Subtarefa 6.7.1: Testes de Comments
- [ ] **`tests/unit/comments.test.ts`** - NOVO
  - [ ] Criar comment
  - [ ] Editar comment
  - [ ] Deletar comment
  - [ ] Reactions

#### Subtarefa 6.7.2: Testes de Portal Client
- [ ] **`tests/integration/client-portal.test.ts`** - NOVO
  - [ ] Login do cliente
  - [ ] Ver projetos
  - [ ] Ver detalhes (sem dados sensíveis)
  - [ ] Comentar em projeto

#### Subtarefa 6.7.3: Testes E2E - Colaboração
- [ ] **`tests/e2e/collaboration-flow.spec.ts`** - NOVO (Playwright)
  - [ ] Criar comment em projeto
  - [ ] @mention outro usuário
  - [ ] Receber notificação
  - [ ] Cliente receber invite
  - [ ] Cliente acessar portal

---

# ✅ FASE 7: Funcionalidades Avançadas
## Features premium e diferenciais

### Status: 0% (TODO)

(Workflow Automation, Budgeting, Resource Planning, AI Features)

---

# ✅ FASE 8: PWA, Performance e Deployment
## Funcionalidades offline e hospedagem

### Status: 0% (TODO)

(PWA Setup, Performance Optimization, Security, Testing, CI/CD)

---

# ✅ FASE 9: Integrações Externas
## APIs e conectores com ferramentas populares

### Status: 0% (TODO)

(Google Maps, Google Drive, Slack, Zapier, Make.com)

---

# ✅ FASE 10: DevOps e Produção
## Infraestrutura robusta e monitoramento

### Status: 0% (TODO)

(CI/CD Pipeline, Monitoring, Database Management, Security Hardening)

---

## 📊 Cronograma Realista

```
TIMELINE ESTIMADA: 6-9 meses para MVP completo

Fase 1 (Backend Consolidation)
├─ Sprint 1 (2 semanas): Schema design + Migration
├─ Sprint 2 (2 semanas): Server Actions basics
└─ Sprint 3 (1 semana): Testing + Validation
   → 5 semanas total

Fase 2 (Client Management)
├─ Sprint 4-5 (4 semanas): Frontend + Pages
├─ Sprint 6 (2 semanas): Forms + Validations
└─ Sprint 7 (1 semana): Testing + Polish
   → 7 semanas total

Fase 3 (Projects)
├─ Sprints 8-10 (6 semanas): Similar pattern
   → 6 semanas total

Fase 4 (Activities)
├─ Sprints 11-12 (4 semanas): Activity tracking + Calendar
   → 4 semanas total

Fase 5 (Dashboard)
├─ Sprint 13 (2 semanas): Dashboard KPIs
├─ Sprint 14 (2 semanas): Reports
   → 4 semanas total

Fase 6 (Collaboration)
├─ Sprint 15 (2 semanas): Comments + Notifications
   → 2 semanas total

Fase 7 (Advanced Features)
├─ Sprint 16-17 (4 semanas): Automation, Budgeting
   → 4 semanas total

Fase 8 (PWA + Deploy)
├─ Sprint 18 (2 semanas): PWA Setup
├─ Sprint 19 (2 semanas): Performance + Security
└─ Sprint 20 (2 semanas): Testing + Deployment
   → 6 semanas total

Fase 9 (Integrations)
├─ Sprint 21-22 (4 semanas): Google Maps, Slack, etc
   → 4 semanas total

Fase 10 (DevOps + Launch)
├─ Sprint 23-24 (4 semanas): CI/CD, Monitoring, Launch
   → 4 semanas total

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL: ~52 semanas (1 ano full-time)
MVP (Phases 1-5): 24 semanas (6 meses)
```

### Velocidade de Desenvolvimento
- **Assumindo**: 1 desenvolvedor full-time
- **Story points por sprint**: 25-35 points
- **Commits por dia**: 5-10
- **PRs por sprint**: 15-20

### Milestones Críticos
| Milestone | Data | Status |
|-----------|------|--------|
| MVP Phase (Clients + Projects) | Semana 12 | Em desenvolvimento |
| Beta Launch (5-10 users) | Semana 16 | Planned |
| Activities + Time Tracking | Semana 20 | Planned |
| Dashboard + Reports | Semana 24 | Planned |
| Public Soft Launch | Semana 28 | Planned |

---

## 🚨 Matriz de Riscos

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database schema needs rework | Medium (30%) | High | Dedicate time to Phase 1, review with experienced architect |
| Scope creep during development | High (60%) | High | Strict feature freeze, MVP focus, cut features to roadmap |
| Performance issues in production | Medium (40%) | Critical | Optimize early, load testing in staging, caching strategy |
| Supabase outage/limits | Low (10%) | Medium | Have backup to AWS/DigitalOcean, monitoring alerts |
| Authentication complexity | Low (15%) | Medium | Use NextAuth best practices, security audit early |
| Timeline slippage (1-2 months) | High (70%) | High | Buffer time built in, ruthless prioritization, reduce scope |
| Team scaling (multi-person) | Medium (35%) | Medium | Good code organization, documentation, PR processes |
| User adoption/retention | High (65%) | Critical | User feedback loop, MVP must solve real problems, pricing strategy |
| Regulatory changes (LGPD) | Low (5%) | Medium | Consult legal early, compliance checklist |
| Third-party API changes | Low (10%) | Low | Abstraction layer, fallbacks, monitoring |

---

## 🎯 KPIs de Sucesso

### Produto
```
- MVP completo (Phases 1-5) em ≤ 24 semanas
- 100% code coverage em funcionalidades críticas
- Page load time < 2s (Core Web Vitals Green)
- Zero critical bugs na primeira release
- API response time < 200ms (P95)
```

### Usuários
```
- Beta phase: 10+ usuários pagantes
- Soft launch: 50+ usuários em 3 meses
- NPS score > 50 (desejável)
- Churn < 5% mensal
- Feature adoption > 70% (users using all main modules)
```

### Negócio
```
- Cost per user < R$ 100/ano (infrastructure)
- Gross margin > 80%
- CAC (customer acquisition cost) < R$ 500
- LTV (lifetime value) > R$ 5.000
- ARR growth > 20% MoM (month over month)
```

### Technical
```
- Deployment frequency: 2-3x por semana
- MTTR (Mean time to recovery): < 15 minutos
- Uptime: 99.9%
- Automated test coverage: > 80%
- Database query performance: < 100ms (P95)
```

---

## 📝 Notas Importantes

### Prioridades
1. **MVP First**: Foco em Phases 1-5 (Backend, Clients, Projects, Activities, Dashboard)
2. **User Feedback**: Depois de cada phase, coletar feedback
3. **Code Quality**: Testes desde o início, code review rigoroso
4. **Documentation**: README, inline comments, API docs

### Decisões Técnicas
1. **Server Actions over API Routes**: Mais simples, menos boilerplate
2. **Prisma over raw SQL**: Type safety, migrations, easier refactoring
3. **Tailwind + shadcn/ui**: Produtivo, componentes prontos
4. **Supabase over self-hosted DB**: Managed service, backups automáticos
5. **Vercel for deployment**: Native Next.js support, edge functions

### Escalabilidade
- Sempre pensar em índices de banco de dados
- Usar `select` em queries para reduzir dados
- Implementar caching layer (Redis) quando necessário
- Async jobs para operações pesadas (Bull queue)
- Database replication/sharding se >1M records

### Segurança
- HTTPS only
- CSRF protection (NextAuth)
- XSS prevention (React escaping)
- SQL injection prevention (Prisma)
- Rate limiting em endpoints críticos
- LGPD compliance (consent, data retention, right to be forgotten)

### Performance
- Lazy load components pesados
- Image optimization (`next/image`)
- Code splitting automático (Next.js)
- Service Worker para offline (PWA)
- CDN para assets estáticos
- Database indexes estratégicos

---

## 🚀 Next Steps

### Próximo Sprint (Semana Atual)
- [ ] Finalizar Phase 1 schema design
- [ ] Create Prisma migration
- [ ] Implement Client CRUD Server Actions
- [ ] Start Client Frontend pages
- [ ] Setup testing infrastructure

### Within 2 Weeks
- [ ] Clientes CRUD 100% funcional
- [ ] Projetos CRUD expandido
- [ ] Activities básico
- [ ] Dashboard com KPIs

### Within 4 Weeks
- [ ] Time tracking implementado
- [ ] Relatórios básicos
- [ ] Notificações
- [ ] Beta testing com usuários reais

---

**Last Updated:** 18 de Janeiro de 2026  
**Maintained By:** Italo520  
**Review Frequency:** A cada 2 sprints  
**Status:** MVP em Desenvolvimento

---

### Histórico de Versão
- **v3.1** - Implementado módulo de Atividades, Time Tracking e Dashboard Executivo Base