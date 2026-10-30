<div align="center">

# 🏛️ ArchFlow ERP — Specialized Management for Architecture Studios

### *Integrated enterprise platform featuring modern monolithic architecture with Next.js 16, Server Actions, Prisma ORM, and PostgreSQL.*

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-7.2-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![NextAuth](https://img.shields.io/badge/Auth-NextAuth_v5-purple?style=for-the-badge&logo=auth0&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

**[ 🇧🇷 Português ](./README.md)** &nbsp;|&nbsp; **[ 🇺🇸 English Version ](./README.en.md)**

---

</div>

## 📌 Product Overview

**ArchFlow ERP** is an end-to-end management software specifically crafted to solve the core operational and financial friction points of **architecture offices and interior design studios**.

Traditionally, architectural offices suffer from fragmented data scattered across disconnected spreadsheets, chat messengers, and unorganized cloud folders. This leads to:
- **Profit margin erosion**: Lack of accurate time tracking and disparities between estimated and actual hours worked.
- **Workflow breakdown across standardized phases**: Difficulties in tracing milestones across *Briefing, Preliminary Study, Preliminary Design, Permitting & Legal Approval, Executive Design*, and *Site Supervision*.
- **Fragile deliverable governance**: Disorganized history of 2D construction drawings, 3D renders, and technical specification approvals.
- **Unstructured client relationship records**: Lack of an integrated client dossier with historical billing and legal entity segmentation (individuals vs. corporations).

**ArchFlow ERP** brings all these dimensions together into a high-performance modular monolith powered by **Next.js 16 (App Router)**, **strictly typed Server Actions**, **Prisma ORM 7**, and transactional persistence with **PostgreSQL**.

---

## 📸 Real System Screenshots (Next.js 16 + Tailwind CSS v4 + Radix UI)

The screenshots below were captured directly from the live running application in the local environment:

### 🔐 1. Authentication & Access Management Screen
Secure access control with credential validation, password hashing via `bcryptjs`, and session tokens via NextAuth v5:
![Real Authentication Screen](docs/assets/demos/real_04_login.png)

---

### 📊 2. Executive Panel & Key Performance Indicators (KPIs)
Consolidated overview featuring monthly revenue, active client counts, ongoing projects, and upcoming contractual deadlines:
![Real Executive Dashboard](docs/assets/demos/real_01_dashboard.png)

---

### 📈 3. Productivity Analytics & Project Breakdown
Analytical tracking of engineering effort spent by project phase and operational completion rates:
![Real Productivity Analytics](docs/assets/demos/real_02_dashboard_charts.png)

---

### 👤 4. Client Dossier & Relationship Management (CRM)
Full client profile featuring legal entity classification (Individual/Corporate), preferred contact channels (WhatsApp), historical billing, and linked architectural projects:
![Real Client Dossier](docs/assets/demos/real_03_client_details.png)

---

## 🎬 Live Demonstrations (Animated Workflows)

The animations below demonstrate full-width user journeys and core feature flows across the application:

### 🖥️ 1. Complete Architectural Project Onboarding: Dashboard ➔ New Project ➔ Engineering Specs ➔ Kanban Board
Full operational flow for creating and parameterizing a new architectural construction: general data entry, selection of architectural typology, technical structural specifications (built area, estimated cost, floor count, garage), atomic validation via Server Actions, and immediate insertion into the Kanban board:
![Complete Project Onboarding Flow](docs/assets/demos/01-dashboard-overview.gif)

---

### 🏗️ 2. Project Lifecycle & CAU/BR Normative Workflow: List/Kanban Toggle ➔ Search ➔ Technical Workspace ➔ Stages & Tasks
Engineering and architectural workflow: seamless view mode toggling between List and Kanban, reactive search filtering, and navigation to the project's dedicated technical workspace showing the 4 normative CAU stages (Survey, Preliminary Study, Schematic Design, Construction Documents) with activity checklists and details:
![Project Lifecycle & Kanban Workflow](docs/assets/demos/02-project-kanban-workflow.gif)

---

### ⏱️ 3. Technical Time Tracking & Productivity Intelligence: Timer ➔ Manual Log ➔ Timesheet ➔ Executive Dashboard
Productivity tracking and project cost governance: categorized manual and active time logging (Design/3D Modeling, Construction Docs, BIM Coordination), instant timesheet ledger reflection, and consolidated productivity and financial KPI updates on the executive dashboard:
![Time Tracking and Productivity Dashboard](docs/assets/demos/03-crm-clients-workflow.gif)

---

## ✨ Key Features

- **Architectural Project Specialization**:
  - Technical metadata: architectural style (*Modernist, Contemporary, Minimalist, Industrial, Rustic*), construction type (*Masonry, Steel Frame, Reinforced Concrete, Timber*), total floor area, stories, parking spots, landscaping, and environmental licensing requirements.
  - Deliverable lifecycle with formal approval statuses (*Draft, Pending Review, Approved, Delivered*).
- **Kanban Board & Agile Task Tracking**:
  - Fluid drag-and-drop task movement powered by `@dnd-kit`.
  - Dynamic checklists per task and priority classifications (*Low, Medium, High, Urgent*).
- **Integrated Architecture CRM**:
  - Dual support for Individuals (CPF) and Corporate Entities (CNPJ, Company Name, State Registration).
  - Specialized project categories: Residential, Commercial, Institutional, and Industrial.
  - Project geolocation coordinates and lifetime client revenue tracking (`totalSpent`).
- **Timesheet & Productivity Intelligence**:
  - Active timer and manual log entries categorized by architectural effort (*Design/Modeling, Revision, Client Meetings, Administrative, Site Visits*).
  - Real-time comparison between budgeted hours vs. logged hours.
- **Budgetary Control & Governance**:
  - Live cost tracking: planned budget (`plannedCost`) vs. accumulated execution cost (`actualCost`).
  - Role-Based Access Control (RBAC): `OWNER`, `EDITOR`, and `VIEWER`.
  - Immutable audit logs (`AuditLog`) for compliance and end-to-end traceability.

---

## 🏛️ System Architecture

The application adopts a **Full Stack Modular Monolith** architecture with Next.js 16, unifying presentation and backend business logic with end-to-end static typing:

```mermaid
flowchart TD
    subgraph UI ["🖥️ Presentation Layer (Client-Side & SSR)"]
        NextPages["Next.js 16 App Router\n(Protected Pages & Layouts)"]
        ComponentsUI["Radix UI & Tailwind CSS v4\n(Accessible Primitives & Theming)"]
        KanbanDnd["Interactive Kanban\n(@dnd-kit & Touch/Pointer Sensors)"]
        RechartsView["Productivity Charts\n(Recharts ResponsiveContainer)"]
    end

    subgraph Actions ["⚡ Application Layer (Server Actions)"]
        ProjectActions["Project Actions\n(CRUD, Phases, Cloning, Soft-Delete)"]
        ClientActions["Client Actions\n(Dossier, Document Validation, CRM)"]
        TaskActions["Task & Kanban Actions\n(Positions, Checklists, Statuses)"]
        TimeLogActions["TimeLog Actions\n(Timesheet Tracking, Timers)"]
        AuthActions["Auth Actions\n(NextAuth v5, Sessions, RBAC)"]
    end

    subgraph SecurityDomain ["🛡️ Domain & Security"]
        ZodValidator["Input Validation with Zod\n(lib/validations.ts)"]
        RBACGuard["RBAC Access Control\n(OWNER | EDITOR | VIEWER)"]
        AuditService["Audit Trail\n(Immutable AuditLog)"]
    end

    subgraph DataAccess ["🗄️ Data Access & Persistence"]
        PrismaClient["Prisma ORM 7.2\n(Typed Client & Atomic Transactions)"]
        PostgresDB[(PostgreSQL 16\nRelational Schema & JSON Fields)]
    end

    subgraph Auxiliary ["📢 Auxiliary Infrastructure"]
        PusherSocket["Pusher WebSockets\n(Real-Time State Updates)"]
        ResendMail["Resend API\n(Notifications & Password Recovery)"]
    end

    %% Relations
    NextPages --> ComponentsUI
    ComponentsUI --> KanbanDnd
    ComponentsUI --> RechartsView

    ComponentsUI --> Actions
    KanbanDnd --> TaskActions

    ProjectActions --> ZodValidator
    ClientActions --> ZodValidator
    TaskActions --> ZodValidator
    TimeLogActions --> ZodValidator

    ZodValidator --> RBACGuard
    RBACGuard --> PrismaClient
    RBACGuard --> AuditService

    PrismaClient --> PostgresDB
    AuditService --> PostgresDB

    Actions -.-> PusherSocket
    AuthActions -.-> ResendMail
```

---

## 🧩 Software Engineering Patterns & Architecture

ArchFlow ERP implements battle-tested software engineering design patterns to ensure reliability, separation of concerns, and maintainability:

### 1. Server Actions Pattern with Zod Validation & Uniform Typed Responses
* **Problem:** Unstructured backend data mutations lead to silent failures, race conditions, and inconsistent error codes.
* **Solution:** Every mutation is validated through a strict Zod schema and returns a standardized `ActionResponse<T>` contract (`{ success: boolean, data?: T, error?: string }`).

```mermaid
classDiagram
    class ActionResponse~T~ {
        +boolean success
        +T data
        +string error
    }

    class ProjectSchema {
        +string name
        +ArchitecturalStyle architecturalStyle
        +ConstructionType constructionType
        +number totalArea
        +Date deliveryDate
        +parse(data)
    }

    class ProjectActions {
        +createProject(formData) ActionResponse~Project~
        +duplicateProject(id) ActionResponse~Project~
        +deleteProject(id) ActionResponse~void~
    }

    ProjectActions ..> ProjectSchema : validates with
    ProjectActions ..> ActionResponse : returns
```

---

### 2. Role-Based Access Control (RBAC) & Session Authorization
* **Problem:** Different organizational roles (partner architects, clients, and studio owners) must not share identical privileges regarding billing or project deletions.
* **Solution:** Contextual session interception via NextAuth v5 paired with declarative role checks (`OWNER`, `EDITOR`, `VIEWER`) guarding sensitive mutations.

```mermaid
classDiagram
    class UserRole {
        <<enumeration>>
        OWNER
        EDITOR
        VIEWER
    }

    class PermissionGuard {
        +assertRole(sessionUser, requiredRole) void
        +canEditProject(user, project) boolean
        +canViewFinancials(user) boolean
    }

    class AuditLogService {
        +logAction(userId, action, entity, details) void
    }

    PermissionGuard --> UserRole : evaluates
    PermissionGuard ..> AuditLogService : audits violations
```

---

### 3. Transactional Soft Delete Pattern (Prisma)
* **Problem:** Hard deletions of project records corrupt historic audit logs, client lifetime value calculations, and team timesheet entries.
* **Solution:** Logical deletion via the `deletedAt` timestamp coupled with atomic transactions (`prisma.$transaction`) that cascade-deactivates child tasks and columns without destroying relational integrity.

```mermaid
classDiagram
    class SoftDeletable {
        +DateTime deletedAt
        +boolean isDeleted()
    }

    class Project {
        +string id
        +string name
        +DateTime deletedAt
        +softDelete()
    }

    class Task {
        +string id
        +DateTime deletedAt
        +cascadeSoftDelete()
    }

    SoftDeletable <|-- Project : implements
    SoftDeletable <|-- Task : implements
    Project o-- Task : cascades soft-delete
```

---

### 4. Timesheet & Cost Calculation Engine (Planned vs. Actual)
* **Problem:** Architectural studios typically charge fixed fees while incurring variable internal costs based on team hours, making profitability calculations difficult.
* **Solution:** Continuous mapping of `TimeLog` entries computing actual accrued cost (`actualCost`) contrasted against approved contractual estimates (`plannedCost`).

```mermaid
classDiagram
    class ProjectFinancialEngine {
        +plannedCost: Decimal
        +actualCost: Decimal
        +calculateMargin() Decimal
        +syncFinancials(projectId) void
    }

    class TimeLog {
        +DateTime startTime
        +DateTime endTime
        +TimeLogCategory category
        +calculateHours() float
    }

    ProjectFinancialEngine o-- TimeLog : aggregates hours
```

---

## 🗄️ Data Model (Entity-Relationship Diagram)

```mermaid
erDiagram
    USER ||--o{ PROJECT : "manages (owner)"
    USER ||--o{ TASK : "assigned to"
    USER ||--o{ TIMELOG : "logs time"
    USER ||--o{ CLIENT : "responsible for"
    USER ||--o{ AUDITLOG : "initiates"

    CLIENT ||--o{ PROJECT : "contracts"
    CLIENT ||--o{ TIMELOG : "incurs time"

    PROJECT ||--o{ TASK : "contains"
    PROJECT ||--o{ DELIVERABLE : "produces"
    PROJECT ||--o{ TIMELOG : "accrues cost"
    PROJECT ||--o{ STAGE : "divided into"

    STAGE ||--o{ TASK : "organizes"

    USER {
        string id PK
        string full_name
        string email UK
        string password_hash
        Role role
        datetime created_at
    }

    CLIENT {
        string id PK
        string name
        string email UK
        ClientLegalType legal_type
        string document UK
        ClientCategory category
        ClientStatus status
        decimal total_spent
        string contact_preference
    }

    PROJECT {
        string id PK
        string name
        ArchitecturalStyle architectural_style
        ConstructionType construction_type
        float total_area
        decimal planned_cost
        decimal actual_cost
        datetime delivery_date
        datetime deleted_at
    }

    TASK {
        string id PK
        string title
        Priority priority
        json checklist
        datetime due_date
        datetime deleted_at
    }

    TIMELOG {
        string id PK
        datetime start_time
        datetime end_time
        TimeLogCategory category
        string description
    }

    DELIVERABLE {
        string id PK
        string title
        DeliverableType type
        DeliverableStatus status
        string file_url
    }

    AUDITLOG {
        string id PK
        AuditAction action
        string entity_name
        json diff
        datetime created_at
    }
```

---

## 🔄 Sequence Diagram (Execution Flow)

The diagram below details the end-to-end lifecycle of a critical operational flow: **Architectural Project Creation with Zod Validation, RBAC Verification, Atomic Prisma Transaction, and Audit Logging**:

```mermaid
sequenceDiagram
    autonumber
    actor Architect as Architect / Manager
    participant UI as React UI (Client)
    participant Action as Project Server Action
    participant Zod as Zod Schema (validations.ts)
    participant Guard as RBAC Guard (auth.ts)
    participant Prisma as Prisma ORM (Client)
    participant DB as PostgreSQL (Database)
    participant Audit as AuditLog Service

    Architect->>UI: Submits project form with technical architectural specifications
    UI->>Action: createProject(formData)
    Action->>Zod: parse(formData)
    Zod-->>Action: Validated & typed project data
    
    Action->>Guard: checkSessionAndRole(session, "EDITOR")
    Guard-->>Action: Authorization confirmed

    Action->>Prisma: $transaction([createProject, createDefaultStages, createKanbanColumns])
    Prisma->>DB: INSERT INTO projects, stages, kanban_columns
    DB-->>Prisma: Confirmation & generated identifiers
    Prisma-->>Action: Instantiated Project record

    Action->>Audit: recordLog(Action.CREATE, "PROJECT", projectId)
    Audit->>DB: INSERT INTO audit_logs
    DB-->>Audit: OK

    Action->>UI: revalidatePath('/projects') + { success: true, data: project }
    UI-->>Architect: Displays success toast and redirects to the Project Kanban Board
```

---

## 📐 SOLID Principles & Clean Code in Practice

| Principle | ArchFlow ERP Implementation | Architectural Benefit |
| :--- | :--- | :--- |
| **S - Single Responsibility** | Strict isolation between Server Actions (`actions/`), pure data validation (`validations.ts`), view components (`components/`), and data access (`prisma.ts`). | Each module has only one reason to change, minimizing regressions and unintended side effects. |
| **O - Open/Closed** | Extensible architectural metadata via Enums and structured JSON columns for checklists and custom milestones without breaking contracts. | New architectural styles or deliverable formats can be introduced without altering core workflows. |
| **L - Liskov Substitution** | All backend mutations conform to the polymorphic `ActionResponse<T>` contract consumed predictably by the client UI. | Any Server Action can be handled interchangeably by UI error interceptors and toast dispatchers. |
| **I - Interface Segregation** | Fine-grained tab components (`ProjectFinancialTab`, `ProjectPhasesTab`, `ProjectDocumentsTab`) depend only on the specific subsets of data they render. | Eliminates unnecessary re-renders and overloaded prop drilling. |
| **D - Dependency Inversion** | Business handlers depend on domain abstractions and isolated client utilities (`lib/prisma.ts`), rather than volatile network APIs. | Simplifies unit testing with mocks and decouples UI code from underlying database drivers. |

---

## 🚀 Installation & Setup Guide

### Prerequisites
- **Node.js**: Version 20 or higher (`node -v`)
- **Docker & Docker Compose**: For running the PostgreSQL database container (`docker --version`)

---

### Step-by-Step Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Italo520/erp_archflow_arquiteture.git
   cd erp_archflow_arquiteture
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Database with Docker**:
   ```bash
   docker compose up -d
   ```
   > *Spins up a PostgreSQL 16 container on the configured port.*

4. **Configure Environment Variables**:
   Create a `.env` file in the project root based on the template:
   ```env
   # Relational Database (PostgreSQL)
   DATABASE_URL="postgresql://postgres:postgres@localhost:5436/archflow?schema=public"

   # Authentication (NextAuth.js v5)
   AUTH_SECRET="your-generated-openssl-secret"
   NEXTAUTH_URL="http://localhost:3000"

   # (Optional) Real-time WebSockets & Email
   PUSHER_APP_ID="your-app-id"
   PUSHER_KEY="your-key"
   PUSHER_SECRET="your-secret"
   PUSHER_CLUSTER="sa1"
   RESEND_API_KEY="your-resend-api-key"
   ```

5. **Generate and Seed the Database**:
   ```bash
   # Generate Prisma Client types
   npx prisma generate

   # Push schema to PostgreSQL
   npx prisma db push

   # Seed initial demo data
   npx prisma db seed
   ```

6. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at: `http://localhost:3000`.

---

### 🧪 Automated Test Suite

Run unit, integration, and end-to-end tests:

```bash
# Run unit and integration tests with Jest:
npm test

# Run end-to-end tests with Playwright:
npx playwright test
```

---

## 🛠️ Tech Stack & Libraries

| Layer / Capability | Technology |
| :--- | :--- |
| **Full Stack Framework** | Next.js 16.1.1 (App Router), React 19, TypeScript 5.3+ |
| **Server Logic & Backend** | Native Next.js Server Actions with on-demand cache revalidation |
| **Database & ORM** | PostgreSQL 16 with Prisma ORM 7.2 |
| **Authentication & Security** | NextAuth.js v5 (Beta), bcryptjs (password hashing), RBAC |
| **Styling & Design System** | Tailwind CSS v4, PostCSS, Lucide React Icons |
| **UI Component Primitives** | Radix UI Primitives, shadcn/ui pattern, TipTap Editor |
| **Interactivity & Analytics** | @dnd-kit (Kanban drag & drop), Recharts (data visualizations) |
| **Validation Layer** | Zod (defensive form and action schemas) |
| **Mobile & PWA** | @ducanh2912/next-pwa (Progressive Web App support) |
| **Testing Infrastructure** | Jest, React Testing Library, ts-jest, Playwright E2E |
| **Containerization** | Docker & Docker Compose v3.8 |

---

## 👨‍💻 Author

Developed by **Ítalo**

---

## 📄 License

This project is licensed under the [MIT](LICENSE) License. See the `LICENSE` file for details.

