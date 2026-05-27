# Project Structure

> Last mapped: 2026-05-27

## Root Directory Layout

```
erp_archflow_arquiteture/
├── .agent/                      # Agent skills and config
│   └── skills/                  # Custom agent skill definitions
├── .git/                        # Git repository
├── .github/                     # GitHub config (workflows, templates)
├── .gitignore                   # Git ignore rules
├── .nvmrc                       # Node.js version (20+)
├── README.md                    # Project overview and setup guide
│
├── actions/                     # 🔵 Server Actions (top-level, legacy position)
│   ├── auth.ts                 # User registration
│   ├── project.ts              # Project CRUD + Stage creation
│   ├── stage.ts                # Stage ordering
│   └── task.ts                 # Task CRUD + reordering
│
├── app/                         # 🟢 Next.js App Router
│   ├── globals.css             # Global styles (Tailwind v4 + theme)
│   ├── layout.js               # Root HTML layout + fonts + Providers
│   ├── page.jsx                # Root page (landing/redirect)
│   ├── favicon.ico             # App favicon
│   ├── (auth)/                 # Auth route group (public)
│   │   ├── layout.jsx          # Auth layout wrapper
│   │   ├── login/              # Login page
│   │   ├── register/           # Registration page
│   │   ├── forgot-password/    # Password recovery
│   │   └── reset-password/     # Password reset
│   ├── (dashboard)/            # Dashboard route group (protected)
│   │   ├── layout.jsx          # Dashboard layout (uses Layout.jsx)
│   │   ├── dashboard/          # Main dashboard page
│   │   ├── projects/           # Project list & detail pages
│   │   ├── clients/            # Client management
│   │   ├── activities/         # Activity tracking
│   │   ├── schedule/           # Calendar/schedule
│   │   ├── time-tracking/      # Time logging
│   │   ├── documents/          # Document management
│   │   ├── reports/            # Reports and analytics
│   │   └── settings/           # App settings
│   ├── actions/                # 🔵 Server Actions (app-scoped, newer)
│   │   ├── auth.ts             # Auth actions
│   │   ├── project.ts          # Extended project operations
│   │   ├── dashboard.ts        # Dashboard data aggregation
│   │   ├── client.ts           # Client CRUD
│   │   ├── activity.ts         # Activity management
│   │   ├── kanban.ts           # Kanban operations
│   │   ├── deliverable.ts      # Deliverable management
│   │   ├── timeLog.ts          # Time tracking
│   │   ├── report.ts           # Report generation
│   │   └── reports.ts          # Report queries
│   └── api/                    # API Route Handlers
│       ├── auth/               # NextAuth route handler
│       └── v1/                 # API v1
│           └── notifications/  # Notification endpoint
│               └── route.ts
│
├── components/                  # 🟡 React Components
│   ├── Layout.jsx              # Main dashboard layout (sidebar + header)
│   ├── Providers.jsx           # Context providers (Session + Theme)
│   ├── ModeToggle.tsx          # Dark/Light mode switcher
│   ├── ThemeProvider.tsx       # Theme context provider
│   ├── NotificationBell.jsx    # Notification dropdown
│   ├── ui/                     # Shadcn/UI base components (25 files)
│   ├── shared/                 # Cross-feature shared components
│   │   ├── ExportButtons.tsx
│   │   └── ImageUpload.tsx
│   ├── dashboard/              # Dashboard feature (14 files)
│   │   ├── KPICard.tsx
│   │   ├── DashboardCharts.tsx
│   │   ├── DeadlineAlerts.tsx
│   │   ├── ProductivityChart.tsx
│   │   ├── ProjectStatusChart.tsx
│   │   └── ... (8 more)
│   ├── projects/               # Project management (20 files)
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectKanban.tsx
│   │   ├── ProjectsTable.tsx
│   │   ├── ProjectOverview.tsx
│   │   └── ... (15 more)
│   ├── clients/                # Client management (8 files)
│   │   ├── ClientForm.tsx
│   │   ├── ClientCard.tsx
│   │   ├── ClientsTable.tsx
│   │   └── ... (5 more)
│   ├── activities/             # Activity & time tracking (11 files)
│   │   ├── ActivityForm.tsx
│   │   ├── ActivityCalendar.tsx
│   │   ├── Timer.tsx
│   │   ├── TimesheetTable.tsx
│   │   └── ... (7 more)
│   ├── kanban/                 # Kanban board (4 files)
│   │   ├── KanbanBoard.tsx
│   │   ├── Column.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskDetails.tsx
│   ├── tasks/                  # Task components (1 file)
│   │   └── TaskDetailsDialog.jsx
│   ├── comments/               # Comment system (2 files)
│   │   ├── CommentEditor.jsx
│   │   └── CommentList.jsx
│   ├── reports/                # Report views (2 files)
│   │   ├── BusinessReport.tsx
│   │   └── ProductivityReport.tsx
│   └── layout/                 # Layout sub-components
│
├── hooks/                       # 🔵 Custom React Hooks
│   └── useWebSocket.js         # Pusher-based notification hook
│
├── lib/                         # 🟣 Utilities & Config
│   ├── prisma.ts               # Prisma client singleton
│   ├── db.ts                   # Database query helpers
│   ├── supabase.ts             # Supabase client
│   ├── validations.ts          # Zod schemas (all entities)
│   ├── permissions.ts          # Role-based permission checks
│   ├── utils.ts                # General utilities (cn helper)
│   ├── server-utils.ts         # Server-side utilities
│   ├── export-pdf.ts           # PDF generation (jspdf)
│   └── export-excel.ts         # Excel generation (exceljs)
│
├── services/                    # 🔴 Legacy REST API Services
│   ├── api.js                  # Axios base client
│   ├── auth.service.js         # Auth API calls
│   ├── authService.js          # Duplicate auth service
│   ├── project.service.js      # Project API calls
│   ├── task.service.js         # Task API calls
│   ├── comment.service.js      # Comment API calls
│   └── notification.service.js # Notification API calls
│
├── prisma/                      # 🗄️ Database
│   ├── schema.prisma           # Database schema (587 lines)
│   ├── seed.ts                 # Seed data script
│   └── migrations/             # Migration files
│
├── types/                       # TypeScript Type Augmentations
│   └── next-auth.d.ts          # NextAuth session type extensions
│
├── tests/                       # 🧪 Test Suite
│   ├── jest.setup.ts           # Jest setup (mocks)
│   ├── unit/                   # Unit tests (8 test files + subdirs)
│   │   ├── actions.test.ts
│   │   ├── activities.test.ts
│   │   ├── dashboard-components.test.tsx
│   │   ├── permissions.test.ts
│   │   ├── project-filters.test.tsx
│   │   ├── project_architecture.test.ts
│   │   ├── projects-view.test.tsx
│   │   ├── validations.test.ts
│   │   ├── actions/
│   │   ├── components/
│   │   └── services/
│   ├── integration/            # Integration tests
│   │   ├── clients.test.ts
│   │   ├── projects.test.ts
│   │   ├── reports.test.ts
│   │   └── time-tracking.test.ts
│   └── e2e/                    # E2E tests (Playwright)
│
├── docs/                        # 📚 Documentation
│   ├── CONTEXT.md              # Project context
│   ├── PLAN.md                 # Development plan
│   ├── PRD_COMPLETO_v3.md      # Complete PRD (78KB)
│   └── walkthrough.md          # Walkthrough
│
├── public/                      # Static assets
│
├── auth.ts                      # NextAuth main config
├── auth.config.ts               # NextAuth callback config
├── proxy.ts                     # Auth middleware
├── prisma.config.ts             # Prisma CLI config
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript config
├── next.config.mjs              # Next.js config
├── tailwind.config.mjs          # Tailwind CSS config
├── postcss.config.mjs           # PostCSS config
├── eslint.config.mjs            # ESLint config
├── jest.config.js               # Jest config
├── playwright.config.ts         # Playwright config
├── components.json              # Shadcn/UI config
├── jsconfig.json                # JavaScript config
│
├── dag_tasks.json               # Task DAG (dev tooling)
├── dev.log                      # Dev server log
├── dev_server.log               # Dev server log
├── test_action.ts               # Test scratch file
├── tmp_check_db.ts              # Temp DB check script
└── tmp_perf_test.ts             # Temp performance test
```

## Naming Conventions

### Files
- **Components:** PascalCase (e.g., `ProjectCard.tsx`, `KPICard.tsx`)
- **Actions:** camelCase (e.g., `project.ts`, `timeLog.ts`)
- **Utilities:** camelCase/kebab-case (e.g., `export-pdf.ts`, `server-utils.ts`)
- **Tests:** `{name}.test.ts` or `{name}.test.tsx`
- **Routes:** lowercase kebab-case directories (e.g., `time-tracking/`, `forgot-password/`)

### Mixed Language (JS/TS)
- **TypeScript (`.ts`, `.tsx`):** Actions, lib, components (newer code)
- **JavaScript (`.js`, `.jsx`):** Layout, hooks, some services, page files (legacy/early code)
- Pattern: Newer features use TypeScript, older ones remain JS

### Route Groups
- `(auth)` — Public routes (login, register, password reset)
- `(dashboard)` — Protected routes (all app features)

## Key Locations

| Need | Location |
|---|---|
| Add a new page | `app/(dashboard)/{route}/page.jsx` |
| Add a server action | `app/actions/{entity}.ts` |
| Add a UI component | `components/ui/{name}.tsx` |
| Add a feature component | `components/{feature}/{Name}.tsx` |
| Modify database schema | `prisma/schema.prisma` |
| Add validation rules | `lib/validations.ts` |
| Add permissions | `lib/permissions.ts` |
| Add a custom hook | `hooks/use{Name}.js` |
| Add a test | `tests/unit/{name}.test.ts` |
| Configure theming | `app/globals.css` + `tailwind.config.mjs` |
