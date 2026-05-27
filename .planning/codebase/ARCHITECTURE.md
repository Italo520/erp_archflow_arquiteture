# Architecture

> Last mapped: 2026-05-27

## Architectural Pattern

**Full-Stack Monolith** — Next.js 16 App Router with Server Actions, replacing a legacy Java Spring Boot + React frontend architecture.

### Key Design Decisions
1. **Server Actions over REST API** — Most CRUD operations use `'use server'` actions directly, eliminating the REST API layer
2. **App Router** — All routing uses the Next.js App Router with route groups `(auth)` and `(dashboard)`
3. **Prisma as single data layer** — All database access goes through Prisma Client
4. **JWT Sessions** — NextAuth v5 with JWT strategy (no database sessions)
5. **Client-side state** — No global state manager (React Context via Providers, local useState)

## Layer Architecture

```
┌─────────────────────────────────────────────────┐
│                    Browser                       │
├─────────────────────────────────────────────────┤
│           React Components (Client)              │
│   components/{feature}/*.tsx                     │
│   hooks/useWebSocket.js                          │
├─────────────────────────────────────────────────┤
│           Next.js Pages (Server + Client)        │
│   app/(dashboard)/{route}/page.jsx               │
│   app/(auth)/{route}/page.jsx                    │
├─────────────────────────────────────────────────┤
│           Server Actions                         │
│   actions/{entity}.ts                            │
│   app/actions/{entity}.ts                        │
├─────────────────────────────────────────────────┤
│           API Route Handlers (minimal)           │
│   app/api/v1/notifications/route.ts              │
├─────────────────────────────────────────────────┤
│           Library / Utils                        │
│   lib/prisma.ts, lib/validations.ts              │
│   lib/permissions.ts, lib/db.ts                  │
├─────────────────────────────────────────────────┤
│           Prisma ORM + PostgreSQL                │
│   prisma/schema.prisma                           │
└─────────────────────────────────────────────────┘
```

## Data Flow

### Typical Server Action Flow (Primary Pattern)
```
User Action → Client Component → Server Action (actions/*.ts)
  → Zod Validation → auth() session check → Prisma query
  → revalidatePath() → Return result
```

### Typical Page Load Flow
```
URL → Next.js Route → Server Component (page.jsx)
  → Server Action (data fetch) → Prisma query
  → Render RSC → Stream to client
```

### Real-Time Flow (Notifications)
```
Server Event → Pusher Server SDK → Pusher Channel
  → Client (useWebSocket hook) → State update → UI
```

### Legacy REST Flow (Being Deprecated)
```
Client Component → services/*.js → Axios → External API (:8080)
  → Response → State update → UI
```

## Key Abstractions

### Authentication (`auth.ts`, `auth.config.ts`)
- Centralized auth config with NextAuth v5
- `auth()` called in every Server Action for session validation
- Callbacks chain: `authorize` → `jwt` → `session`
- Route middleware in `proxy.ts`

### Server Actions (`actions/*.ts`)
Primary server-side logic layer. Each action:
1. Calls `auth()` to verify session
2. Validates input with Zod schemas
3. Executes Prisma queries
4. Calls `revalidatePath()` for cache invalidation
5. Returns `{ success: boolean, ... }`

**Action files:**

| File | Entities | Operations |
|---|---|---|
| `actions/auth.ts` | User | Register |
| `actions/project.ts` | Project, Stage | Create, Read, Delete |
| `actions/task.ts` | Task | Create, Update, Delete, Reorder |
| `actions/stage.ts` | Stage | Update order |

### App-Level Actions (`app/actions/*.ts`)
More granular server actions scoped to dashboard features:

| File | Purpose |
|---|---|
| `app/actions/auth.ts` | Auth-related actions |
| `app/actions/project.ts` | Extended project operations |
| `app/actions/dashboard.ts` | Dashboard data aggregation (KPIs, charts) |
| `app/actions/client.ts` | Client CRUD |
| `app/actions/activity.ts` | Activity management |
| `app/actions/kanban.ts` | Kanban board operations |
| `app/actions/deliverable.ts` | Deliverable management |
| `app/actions/timeLog.ts` | Time tracking operations |
| `app/actions/report.ts` | Report generation |
| `app/actions/reports.ts` | Report data queries |

### Validation Layer (`lib/validations.ts`)
- Centralized Zod schemas for all entities
- Uses `z.nativeEnum()` to mirror Prisma enums
- Schemas: `clientSchema`, `activitySchema`, `timeLogSchema`, `deliverableSchema`, `projectSchema`, `taskSchema`, `userSchema`
- Each has a corresponding `update*Schema` with `.partial()` + required `id`

### Permissions (`lib/permissions.ts`)
- Role-based permission checks (OWNER, EDITOR, VIEWER)
- Functions: `canCreateProject`, `canDeleteProject`, `canManageTeam`, `canEditTask`, `canDeleteTask`, `canCreateClient`
- `hasProjectAccess(userRole, requiredRole)` — hierarchical role check
- **Not yet integrated** into most Server Actions (auth check is session-based only)

### Database Utilities (`lib/db.ts`)
- `getActivityMetricsByUser()` — Aggregates activity data by type
- `getProductivityTrends()` — Time log trends grouped by date

## Entry Points

| Entry Point | File | Purpose |
|---|---|---|
| Root Layout | `app/layout.js` | HTML shell, fonts, Providers |
| Root Page | `app/page.jsx` | Landing/redirect |
| Dashboard Layout | `app/(dashboard)/layout.jsx` | Dashboard shell with sidebar |
| Auth Layout | `app/(auth)/layout.jsx` | Auth pages layout |
| API Auth | `app/api/auth/[...nextauth]/route.ts` (implied) | NextAuth route handler |
| Notification API | `app/api/v1/notifications/route.ts` | Notification REST endpoint |
| Middleware | `proxy.ts` | Route-level auth middleware |

## Component Architecture

### Provider Hierarchy
```
RootLayout
  └── Providers (components/Providers.jsx)
       └── SessionProvider (next-auth)
            └── ThemeProvider (next-themes)
                 └── {children}
                      └── Toaster (sonner)
```

### Component Organization Pattern
```
components/
  ├── Layout.jsx          — Main dashboard shell (sidebar + header)
  ├── Providers.jsx        — Context providers wrapper
  ├── ui/                  — Shadcn/UI primitives (25 components)
  ├── shared/              — Cross-feature components (ExportButtons, ImageUpload)
  ├── dashboard/           — Dashboard-specific components (14 files)
  ├── projects/            — Project management (20 files)
  ├── clients/             — Client management (8 files)
  ├── activities/          — Activity & time tracking (11 files)
  ├── kanban/              — Kanban board (4 files)
  ├── tasks/               — Task details (1 file)
  ├── comments/            — Rich text comments (2 files)
  └── reports/             — Business & productivity reports (2 files)
```
