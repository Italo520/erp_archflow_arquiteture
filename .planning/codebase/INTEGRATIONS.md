# External Integrations

> Last mapped: 2026-05-27

## Database: PostgreSQL (via Supabase)

- **Provider:** Supabase (hosted PostgreSQL)
- **Connection:** `DATABASE_URL` (pooled), `DIRECT_URL` (direct for migrations)
- **ORM:** Prisma v7 with `@prisma/adapter-pg` driver adapter
- **Client setup:** `lib/prisma.ts` — singleton pattern with `pg.Pool`
- **Schema:** `prisma/schema.prisma` (587 lines, 17 models, 15+ enums)
- **Migrations:** `prisma/migrations/` directory
- **Seed:** `prisma/seed.ts` (runs via `ts-node`)

### Models Overview

| Model | Purpose | Key Relations |
|---|---|---|
| `User` | System users (OWNER/EDITOR/VIEWER) | Projects, Tasks, AuditLogs, Notifications |
| `Client` | Architecture clients (PF/PJ) | Projects, Activities, TimeLogs |
| `Project` | Architectural projects | Stages, Tasks, Members, Budget, Estimate |
| `Stage` | Kanban columns per project | Tasks |
| `Task` | Work items within stages | Activities, Deliverables, TimeLogs |
| `Activity` | Calendar events (meetings, calls, visits) | Client, Project, Task |
| `Deliverable` | Project deliverables (renders, drawings) | Task, Project |
| `TimeLog` | Time tracking entries | User, Project, Task, Client |
| `Estimate` | Project cost estimates | Project (1:1) |
| `Budget` | Project budgets | Project (1:1) |
| `ProjectMember` | User-Project membership | User, Project |
| `Notification` | In-app notifications | User |
| `AuditLog` | Change audit trail | User, Project |
| `PasswordResetToken` | Password reset flow | — |
| `ProjectKanbanColumn` | Custom kanban columns | — |

## Storage: Supabase Storage

- **Client:** `lib/supabase.ts` — `createClient(url, anonKey)`
- **Usage:** Project image uploads in `actions/project.ts`
- **Bucket:** `projects`
- **Flow:** Upload file → get public URL → store in DB `imageUrl` field
- **Auth:** Supabase Anon Key (public uploads)
- **Env vars:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Authentication: NextAuth.js v5

- **Config:** `auth.ts` + `auth.config.ts`
- **Provider:** Credentials only (email + password)
- **Session:** JWT-based
- **Password hashing:** bcryptjs
- **Validation:** Zod schema on login input
- **Middleware:** `proxy.ts` (route-level auth check)
- **Protected routes:** `/dashboard/*`, `/projects/*`
- **Env var:** `AUTH_SECRET`

## Real-Time: Pusher

- **Client:** `hooks/useWebSocket.js` — Pusher.js singleton
- **Server:** `pusher` package available (not yet wired in server actions)
- **Channel pattern:** `notifications-{userId}` (public channels, private planned)
- **Events:** `new-notification`
- **State:** Client-side only (notifications not persisted to DB via WebSocket)
- **Env vars:** `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

## HTTP Client (Legacy)

- **Client:** `services/api.js` — Axios instance
- **Base URL:** `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080`)
- **Auth:** Bearer token from cookies (legacy pattern)
- **Usage:** Legacy service files in `services/` directory
- **Status:** Being replaced by Server Actions

### Legacy Service Files

| File | Purpose |
|---|---|
| `services/api.js` | Axios HTTP client base |
| `services/auth.service.js` | Legacy auth API calls |
| `services/authService.js` | Duplicate auth service |
| `services/project.service.js` | Project CRUD via REST |
| `services/task.service.js` | Task CRUD via REST |
| `services/comment.service.js` | Comments via REST |
| `services/notification.service.js` | Notifications via REST |

## Export Services

### PDF Export (`lib/export-pdf.ts`)
- Uses **jspdf** + **jspdf-autotable**
- Generates PDF reports for projects, tasks, time tracking

### Excel Export (`lib/export-excel.ts`)
- Uses **exceljs**
- Generates Excel spreadsheets for data export

## Rich Text Editor

- **Library:** TipTap (via `@tiptap/react`, `@tiptap/starter-kit`)
- **Extensions:** Image, Mention
- **Usage:** `components/comments/CommentEditor.jsx`

## Drag & Drop

- **Library:** @dnd-kit (core + sortable + utilities)
- **Usage:** Kanban board (`components/kanban/KanbanBoard.tsx`)
- **Pattern:** Sortable columns with draggable task cards

## Charts & Data Visualization

- **Library:** Recharts v3
- **Usage:** Dashboard charts (`components/dashboard/`)
- **Charts:** Revenue, Productivity, Project Status, Time by Project

## Notifications API

- **Route:** `app/api/v1/notifications/route.ts`
- **Protocol:** REST (GET notifications for user)
- **Client component:** `components/NotificationBell.jsx`
- **Real-time:** Pusher WebSocket for push notifications

## External CDN

- **Google Fonts:** Material Symbols Outlined (via CDN link in `app/layout.js`)
- **Fonts:** Inter, Outfit (via `next/font/google`)
