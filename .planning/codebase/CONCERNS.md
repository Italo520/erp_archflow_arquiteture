# Concerns & Technical Debt

> Last mapped: 2026-05-27

## 🔴 High Priority

### 1. Legacy Service Layer Coexisting with Server Actions
- **Location:** `services/*.js` (7 files)
- **Issue:** Legacy Axios-based REST services (`services/api.js`, `services/auth.service.js`, etc.) coexist with newer Server Actions (`actions/*.ts`, `app/actions/*.ts`). This creates confusion about which pattern to use.
- **Legacy base URL:** Points to `localhost:8080` (old Java backend)
- **Duplicate auth services:** Both `services/auth.service.js` and `services/authService.js` exist
- **Risk:** Developers may accidentally use the legacy REST pattern instead of Server Actions
- **Recommendation:** Audit usage of `services/` files, remove unused ones, migrate remaining callers to Server Actions

### 2. Duplicate Server Action Locations
- **Locations:** `actions/*.ts` (root level) and `app/actions/*.ts`
- **Issue:** Server Actions split across two directories with overlapping entities (both have `auth.ts`, `project.ts`)
- **Root `actions/`:** 4 files (auth, project, task, stage) — older, simpler
- **App `app/actions/`:** 10 files — newer, more comprehensive
- **Risk:** Conflicting logic, unclear which actions pages should import
- **Recommendation:** Consolidate all actions into `app/actions/` and remove root `actions/`

### 3. TypeScript Strict Mode Disabled
- **File:** `tsconfig.json` — `"strict": false`
- **Impact:** No null checks, no strict function types, no strict property initialization
- **Risk:** Runtime errors from null/undefined access, type safety gaps
- **Evidence:** Heavy use of `as any` casts for Prisma Json fields
- **Recommendation:** Enable incrementally: start with `strictNullChecks`

### 4. Inconsistent Error Handling
- **Pattern 1:** `throw new Error("message")` — most actions
- **Pattern 2:** `return { success: false, error }` — some lib functions
- **Client side:** No systematic try/catch around Server Action calls
- **No error boundary:** No custom React Error Boundary beyond Next.js defaults
- **Risk:** Unhandled rejections, poor user error feedback
- **Recommendation:** Standardize on Result type pattern, add error boundaries

## 🟡 Medium Priority

### 5. Permission System Not Integrated
- **File:** `lib/permissions.ts`
- **Issue:** Well-defined permission functions (`canCreateProject`, `canDeleteProject`, etc.) but they're **not called** in most Server Actions. Actions only check `session.user.id` exists.
- **Risk:** Any authenticated user can perform any operation regardless of role
- **Recommendation:** Integrate permission checks into all Server Actions

### 6. Pusher/WebSocket Implementation Incomplete
- **File:** `hooks/useWebSocket.js`
- **Issues:**
  - Uses **public channels** instead of authenticated private channels (security risk)
  - `channelName` variable defined but unused (line 33 uses different name)
  - Server-side Pusher SDK available (`pusher` package) but not integrated into Server Actions
  - Notifications from WebSocket not persisted to database
  - `markAsRead` only updates client state, not DB
- **Risk:** Notifications can be intercepted; data loss on page refresh
- **Recommendation:** Implement server-side push in actions, use private channels with auth

### 7. JSONB Fields Loosely Typed
- **Models:** `Task.attachments`, `Task.comments`, `Task.checklist`, `Task.historico`, `Project.phases`, `Budget.budgetBreakdown`
- **Issue:** Stored as `Json?` in Prisma, cast with `as any` or `as unknown as TypedInterface[]`
- **Risk:** Data corruption, runtime type errors, difficult to query
- **Recommendation:** Consider normalizing critical JSON fields into proper relations, or add runtime validation on read

### 8. Mixed JavaScript and TypeScript
- **Pattern:** Newer features in TS, older features in JS
- **JS files:** Page files (`page.jsx`), `Layout.jsx`, `Providers.jsx`, `NotificationBell.jsx`, hooks, services
- **TS files:** Actions, lib, newer components, Kanban
- **Risk:** Inconsistent type safety, harder to maintain
- **Recommendation:** Gradually convert `.jsx` → `.tsx`, `.js` → `.ts`

### 9. Hardcoded Strings (No i18n)
- **Issue:** All UI strings in Portuguese (Brazil) hardcoded in components
- **Mixed languages:** Some Zod validation messages in English (`lib/validations.ts`), UI in Portuguese
- **Risk:** Cannot support additional languages without rewriting components
- **Recommendation:** Extract strings to translation files, standardize language for validation messages

### 10. Large Component Files
- **`components/Layout.jsx`** — 218 lines (sidebar + header + mobile drawer)
- **`components/projects/ProjectKanban.tsx`** — 19,570 bytes
- **`components/projects/ProjectForm.tsx`** — 15,381 bytes
- **`components/projects/ProjectsTable.tsx`** — 15,200 bytes
- **`components/activities/ActivityForm.tsx`** — 15,902 bytes
- **Risk:** Hard to maintain, test, and review
- **Recommendation:** Extract sub-components, especially from `ProjectForm` and `ProjectKanban`

## 🟢 Low Priority

### 11. Temporary/Debug Files in Root
- **Files:** `test_action.ts`, `tmp_check_db.ts`, `tmp_perf_test.ts`, `dev.log`, `dev_server.log`, `dag_tasks.json`
- **Risk:** Clutter, confusion, potential data leaks
- **Recommendation:** Add to `.gitignore` or delete

### 12. Hardcoded Avatar URL
- **File:** `components/Layout.jsx` (line 200)
- **Issue:** Default user avatar is a hardcoded Google CDN URL
- **Risk:** External dependency, may break
- **Recommendation:** Use a local fallback or initials-based avatar

### 13. Console Logging in Production Code
- **Files:** `actions/project.ts`, `auth.ts`, `lib/db.ts`
- **Issue:** `console.log` and `console.error` calls throughout server-side code
- **Risk:** Information leakage in production logs
- **Recommendation:** Use structured logging library or remove before production

### 14. NextAuth v5 Beta
- **Version:** `^5.0.0-beta.30`
- **Issue:** Using beta version of NextAuth v5 — API may change before stable release
- **Risk:** Breaking changes on update
- **Recommendation:** Track NextAuth v5 stable release, pin beta version carefully

### 15. No CI/CD Configuration
- **Observation:** `.github/` directory exists but no CI workflow observed
- **Issue:** No automated testing, linting, or deployment pipeline
- **Risk:** Regressions, untested deployments
- **Recommendation:** Add GitHub Actions workflow for lint, test, build, deploy

## 📊 Debt Summary

| Severity | Count | Key Areas |
|---|---|---|
| 🔴 High | 4 | Legacy services, duplicate actions, strict mode, error handling |
| 🟡 Medium | 6 | Permissions, WebSocket, JSONB types, JS/TS mix, i18n, large files |
| 🟢 Low | 5 | Temp files, hardcoded avatar, console.log, NextAuth beta, CI/CD |
| **Total** | **15** | |

## No TODO/FIXME/HACK Markers Found
A grep for `TODO`, `FIXME`, `HACK`, `XXX`, and `REFACTOR` across all `.ts`, `.tsx`, `.js`, `.jsx` files returned **zero results**. Technical debt is implicit rather than marked.
