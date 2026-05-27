# Technology Stack

> Last mapped: 2026-05-27

## Languages & Runtime

| Technology | Version | Purpose |
|---|---|---|
| **TypeScript** | ^5.9.3 | Primary language (actions, lib, components, config) |
| **JavaScript (JSX)** | ES2017 target | Legacy components, services, hooks |
| **Node.js** | 20+ (.nvmrc) | Runtime |
| **SQL** | PostgreSQL | Database |

- TypeScript strict mode is **disabled** (`"strict": false` in `tsconfig.json`)
- Module resolution: `bundler` (Next.js standard)
- Path alias: `@/*` → `./*` (e.g., `@/lib/prisma`)

## Core Framework

| Package | Version | Role |
|---|---|---|
| **Next.js** | 16.1.1 | Full-stack framework (App Router, Server Actions, RSC) |
| **React** | 19.2.3 | UI library |
| **React DOM** | 19.2.3 | DOM renderer |

### Next.js Configuration (`next.config.mjs`)
- **PWA enabled** via `@ducanh2912/next-pwa` (disabled in dev)
- Build: webpack mode (`--webpack` flag)
- Allowed dev origins: `localhost:3000`, `192.168.0.37:3000`
- App Router (no Pages Router)

## Database & ORM

| Package | Version | Role |
|---|---|---|
| **Prisma Client** | ^7.2.0 | ORM / Query builder |
| **Prisma (CLI)** | ^7.6.0 | Schema management, migrations |
| **@prisma/adapter-pg** | ^7.2.0 | PostgreSQL adapter (driver-based) |
| **pg** | ^8.17.1 | PostgreSQL connection pooling |

### Database Setup (`lib/prisma.ts`)
- Uses **driver-based** Prisma with `PrismaPg` adapter over raw `pg.Pool`
- Connection string from `DATABASE_URL` env var
- Dev singleton pattern via `globalForPrisma`
- Logging: `query`, `error`, `warn`
- PostgreSQL hosted on **Supabase** (see `prisma.config.ts` — uses `DIRECT_URL` for migrations)
- Postinstall hook runs `prisma generate`

## Authentication

| Package | Version | Role |
|---|---|---|
| **next-auth** | ^5.0.0-beta.30 | Auth framework (NextAuth v5 beta) |
| **bcryptjs** | ^3.0.3 | Password hashing |

### Auth Setup (`auth.ts`, `auth.config.ts`)
- **Credentials provider** only (email + password)
- JWT session strategy
- Zod validation on login input
- Password comparison via bcrypt
- Custom callbacks: `jwt` (adds `id`, `role`), `session` (exposes `id`, `role`)
- Route protection: `/dashboard/*` and `/projects/*` require auth
- Middleware proxy in `proxy.ts` for route-level protection
- Custom type augmentation: `types/next-auth.d.ts`

## UI & Styling

| Package | Version | Role |
|---|---|---|
| **Tailwind CSS** | ^4.0.0 | Utility-first CSS framework |
| **@tailwindcss/postcss** | ^4.0.0 | PostCSS integration |
| **tailwindcss-animate** | ^1.0.7 | Animation utilities |
| **tailwind-merge** | ^3.4.0 | Class merging |
| **class-variance-authority** | ^0.7.1 | Variant-based component styling |
| **clsx** | ^2.1.1 | Conditional class names |
| **next-themes** | ^0.4.6 | Dark/Light mode toggle |

### Design System
- **Component Library:** Shadcn/UI pattern (25 UI components in `components/ui/`)
- **Primitives:** Radix UI (Dialog, Select, Dropdown, Tabs, Tooltip, Checkbox, etc.)
- **Icons:** Lucide React + Google Material Symbols (via CDN)
- **Fonts:** Inter (body), Outfit (display) via `next/font/google`; config also references Spline Sans, Manrope, Noto Sans
- **Color Palette:** HSL-based CSS variables, light/dark themes in `globals.css`
  - Light: Pastel beige (#FBF2ED), greenish primary (#CDD5C6)
  - Dark: Deep black (#0D0D0D), deep blue (#152026), slate (#253840)
- **Custom colors:** Status (todo/progress/done), surface variants

## Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| **@dnd-kit/core + sortable** | ^6.3.1 / ^10.0.0 | Drag and drop (Kanban board) |
| **@tiptap/react + starter-kit** | ^3.14.0 | Rich text editor (comments, descriptions) |
| **react-hook-form** | ^7.71.1 | Form management |
| **@hookform/resolvers** | ^5.2.2 | Zod resolver for RHF |
| **zod** | ^4.3.5 | Schema validation |
| **recharts** | ^3.6.0 | Charts and data visualization |
| **@tanstack/react-table** | ^8.21.3 | Data tables |
| **date-fns** | ^4.1.0 | Date manipulation |
| **sonner** | ^2.0.7 | Toast notifications |
| **cmdk** | ^1.1.1 | Command palette |
| **axios** | ^1.13.2 | HTTP client (legacy service layer) |
| **js-cookie** | ^3.0.5 | Cookie management (legacy) |
| **jspdf + jspdf-autotable** | ^4.0.0 / ^5.0.7 | PDF export |
| **exceljs** | ^4.4.0 | Excel export |
| **pusher / pusher-js** | ^5.3.3 / ^8.5.0 | Real-time notifications |
| **@supabase/supabase-js** | ^2.90.1 | Supabase client (storage uploads) |
| **react-day-picker** | ^9.13.0 | Date picker |
| **use-debounce** | ^10.1.0 | Input debouncing |
| **tippy.js** | ^6.3.7 | Tooltips |

## Dev Dependencies

| Package | Version | Purpose |
|---|---|---|
| **Jest** | ^30.2.0 | Unit test runner |
| **@testing-library/react** | ^16.3.2 | React component testing |
| **@testing-library/user-event** | ^14.6.1 | User interaction simulation |
| **@testing-library/jest-dom** | ^6.9.1 | DOM matchers |
| **ts-jest** | ^29.4.6 | TypeScript support for Jest |
| **jest-mock-extended** | ^4.0.0 | Extended mocking |
| **Playwright** | ^1.58.0 | E2E testing |
| **ESLint** | ^9 | Linting |
| **eslint-config-next** | 16.1.1 | Next.js lint rules |
| **PostCSS** | ^8.5.6 | CSS processing |
| **autoprefixer** | ^10.4.23 | Vendor prefixes |
| **ts-node** | ^10.9.2 | TypeScript execution (seeds) |
| **dotenv** | ^17.4.0 | Environment variables |

## Configuration Files

| File | Purpose |
|---|---|
| `tsconfig.json` | TypeScript compiler config |
| `next.config.mjs` | Next.js + PWA config |
| `tailwind.config.mjs` | Tailwind CSS v4 theme config |
| `postcss.config.mjs` | PostCSS plugins |
| `eslint.config.mjs` | ESLint flat config |
| `jest.config.js` | Jest test runner config |
| `playwright.config.ts` | Playwright E2E config |
| `prisma.config.ts` | Prisma CLI config (migration datasource) |
| `components.json` | Shadcn/UI component config |
| `.nvmrc` | Node version pinning |
| `.gitignore` | Git ignore rules |

## Environment Variables (Expected)

| Variable | Usage |
|---|---|
| `DATABASE_URL` | Prisma connection (pooled) |
| `DIRECT_URL` | Prisma migrations (direct, Supabase) |
| `AUTH_SECRET` | NextAuth JWT signing |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `NEXT_PUBLIC_PUSHER_KEY` | Pusher app key |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Pusher cluster region |
| `NEXT_PUBLIC_API_URL` | Legacy API base URL (default: localhost:8080) |

## NPM Scripts

| Script | Command |
|---|---|
| `dev` | `next dev --webpack` |
| `build` | `next build --webpack` |
| `start` | `next start` |
| `lint` | `eslint` |
| `test` | `jest` |
| `test:watch` | `jest --watch` |
| `postinstall` | `prisma generate` |
