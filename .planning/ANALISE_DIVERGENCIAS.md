# 📊 Análise de Divergências — Legado vs. Migrado

> **Data**: 2026-10-04  
> **Projeto**: ArchFlow ERP — Escritório de Arquitetura  
> **Legado**: Next.js 15 + Prisma + PostgreSQL (monolito fullstack)  
> **Migrado**: React 19/Vite (frontend) + Spring Boot 3.4/JPA (backend)  

---

## 📑 Índice

1. [Resumo Executivo](#1-resumo-executivo)
2. [Sistema de Temas (Dark/Light Mode)](#2-sistema-de-temas-darklight-mode)
3. [Responsividade e Layout](#3-responsividade-e-layout)
4. [Páginas e Módulos](#4-páginas-e-módulos)
5. [Componentes do Frontend](#5-componentes-do-frontend)
6. [Backend — Server Actions vs. REST API](#6-backend--server-actions-vs-rest-api)
7. [Modelo de Dados (Prisma vs. JPA/Flyway)](#7-modelo-de-dados-prisma-vs-jpaflyway)
8. [Funcionalidades Específicas](#8-funcionalidades-específicas)
9. [Design System e CSS](#9-design-system-e-css)
10. [Tabela Resumo de Gaps](#10-tabela-resumo-de-gaps)
11. [Priorização de Correções](#11-priorização-de-correções)

---

## 1. Resumo Executivo

| Aspecto | Legado | Migrado | Status |
|---------|--------|---------|--------|
| **Páginas (Rotas)** | 9 rotas principais | 5 views (sem rota real) | ⚠️ Parcial |
| **Componentes** | ~80 componentes | ~8 componentes | 🔴 Crítico |
| **Tema Claro/Escuro** | ✅ Completo (ThemeProvider + ModeToggle) | 🔴 Inexistente (dark-only hardcoded) | 🔴 Crítico |
| **Responsividade** | ✅ Mobile drawer + sidebar colapsável | 🔴 Sidebar fixa sem mobile | 🔴 Crítico |
| **Kanban DnD** | ✅ @dnd-kit completo | 🔴 Estático (sem drag-and-drop) | 🔴 Crítico |
| **Notificações** | ✅ WebSocket + Bell | 🔴 Inexistente | 🔴 Crítico |
| **Backend endpoints** | 18 server actions | 5 módulos REST | ⚠️ Parcial |
| **Modelo de dados** | 18+ entidades Prisma | 7 entidades JPA | ⚠️ Parcial |
| **Roteamento** | Next.js App Router (URL paths) | Estado local (`activeTab`) sem URLs | 🔴 Regressão |
| **Busca Global** | ✅ Campo na navbar | 🔴 Campo visual sem funcionalidade | ⚠️ Visual only |

**Veredicto**: A migração implementou apenas a **estrutura básica** (~30% das funcionalidades). A maioria dos componentes, interações e regras de negócio do projeto legado **não foi portada**.

---

## 2. Sistema de Temas (Dark/Light Mode)

### Legado ✅
- **ThemeProvider.tsx** (170 linhas): Provider completo com suporte a `dark`, `light`, `system`
- **ModeToggle.tsx** (50 linhas): Botão animado Sol/Lua com transição suave
- **globals.css**: Design tokens CSS com variáveis HSL para ambos os modos (`:root` = light, `.dark` = dark)
- **tailwind.config.mjs**: `darkMode: ["class"]` com cores semânticas (`background`, `foreground`, `card`, `primary`, etc.)
- Persistência via `localStorage`
- Listener para preferência do sistema (`prefers-color-scheme`)

### Migrado 🔴
- **Nenhum ThemeProvider** — não existe
- **Nenhum ModeToggle** — não existe
- **index.css**: Cores hardcoded escuras (`background-color: #0D0D0D`, `color: #F3F4F6`)
- **tailwind.config.js**: Tem `darkMode: 'class'` mas **sem variáveis CSS** para modo claro
- **Sidebar.tsx**: Cores fixas como `text-white`, `bg-surface-dark`, `text-gray-300`
- **DashboardView.tsx**: Todas as cores são hardcoded dark (`text-white`, `bg-surface-elevated`)

### Divergências Específicas

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Variáveis CSS semânticas | ✅ `hsl(var(--background))` | 🔴 `#0D0D0D` hardcoded |
| Toggle visual | ✅ Botão Sol/Lua animado | 🔴 Inexistente |
| Persistência tema | ✅ `localStorage` | 🔴 N/A |
| Suporte "system" | ✅ `prefers-color-scheme` | 🔴 N/A |
| Palette Light Mode | ✅ `#F3F4F6` bg, `#111827` text | 🔴 Não implementado |
| Palette Dark Mode | ✅ `#111111` bg, `#ffffff` text | ⚠️ Similar mas sem token system |

---

## 3. Responsividade e Layout

### Legado ✅
- **Layout.jsx** (377 linhas):
  - **Desktop**: Sidebar com `w-64` colapsável para `w-[80px]`, botão chevron para toggle
  - **Mobile (< lg)**: Menu hamburger na navbar → abre Drawer lateral com overlay `bg-black/40` + `backdrop-blur`
  - **Navbar**: Responsiva com nome truncado em mobile, busca global visível apenas desktop
  - **Avatar/User**: Mostrado na sidebar desktop + drawer mobile
  - **Conteúdo**: `overflow-y-auto` com padding responsivo `px-4 md:px-6`

### Migrado 🔴
- **Sidebar.tsx** (103 linhas):
  - **Desktop**: Sidebar fixa `w-64` — **sem colapsar**
  - **Mobile**: **Sem menu hamburger**, **sem drawer** — sidebar **desaparece completamente** em telas menores
  - Sem classe `hidden lg:flex` / sem media queries para mobile
  - `h-screen sticky top-0` — comportamento fixo sem fallback mobile
- **Navbar.tsx** (42 linhas):
  - Sem botão hamburger para mobile
  - Sem avatar do usuário
  - Layout fixo `px-8` sem breakpoints
- **App.tsx**: `flex min-h-screen` sem tratamento de overflow em mobile

### Divergências Específicas

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Sidebar colapsável | ✅ Chevron toggle `w-64` → `w-[80px]` | 🔴 Fixa `w-64` sempre |
| Mobile drawer | ✅ Overlay + slide-in `w-72` | 🔴 Inexistente |
| Hamburger menu | ✅ Ícone `Menu` na navbar | 🔴 Inexistente |
| Navbar responsiva | ✅ Breakpoints `md:`, `sm:`, `lg:` | 🔴 Layout fixo `px-8` |
| Busca global | ✅ `hidden lg:flex` (desktop only) | ⚠️ Sempre visível sem funcionalidade |
| NotificationBell | ✅ WebSocket integrado | 🔴 Inexistente |
| Avatar na topbar | ✅ Foto/iniciais + nome | 🔴 Inexistente |
| Padding responsivo | ✅ `px-4 md:px-6` | 🔴 `p-8` fixo |
| Page title dinâmico | ✅ `getPageTitle()` na navbar | 🔴 Não possui |

---

## 4. Páginas e Módulos

### Legado — 9 rotas principais

| Rota | Página | Componentes | Status Migrado |
|------|--------|-------------|----------------|
| `/dashboard` | Dashboard com KPIs, gráficos, alertas, agenda | 14 componentes | ⚠️ Parcial — sem gráficos, sem filtros |
| `/projects` | Lista de projetos com tabela, filtros, kanban | 23 componentes | ⚠️ Parcial — lista simplificada |
| `/projects/[id]` | Detalhe do projeto com 10+ tabs | Overview, Financial, Documents, Team, etc. | 🔴 Inexistente |
| `/projects/[id]/inspections` | Vistorias do projeto | Vinculadas ao projeto | 🔴 Inexistente |
| `/activities` | Dashboard de atividades, calendário, formulários | 11 componentes | 🔴 Inexistente |
| `/schedule` | Cronograma com calendário e timeline | Componente dedicado | 🔴 Inexistente |
| `/time-tracking` | Timer, timesheet, logs manuais | Timer, TimesheetTable, ManualTimeLogForm | ⚠️ Parcial |
| `/clients` | CRUD completo com tabela, cards, filtros | 9 componentes | ⚠️ Parcial |
| `/documents` | Gerenciador de documentos | DocumentsClient (42KB!) | 🔴 Inexistente |
| `/reports` | Relatórios de negócios e produtividade | 3 componentes | 🔴 Inexistente |
| `/settings` | Preferências de usuário, notificações RBAC | 2 componentes | 🔴 Inexistente |

### Migrado — 5 views (sem roteamento real)

| View | Arquivo | Correspondência |
|------|---------|-----------------|
| `LoginView` | 6.6KB | ✅ Nova (legado usava NextAuth) |
| `DashboardView` | 11.4KB | ⚠️ Simplificado |
| `ClientsView` | 16.2KB | ⚠️ CRUD básico |
| `ProjectsKanbanView` | 18.2KB | ⚠️ Kanban visual SEM DnD |
| `InspectionsView` | 23.8KB | ⚠️ Funcional mas simplificado |
| `TimeTrackingView` | 25.6KB | ⚠️ Logs manuais, sem Timer real |

---

## 5. Componentes do Frontend

### Legado — ~80 componentes organizados por domínio

```
components/
├── Layout.jsx             (15.6KB) — Shell principal responsivo
├── ModeToggle.tsx          (1.5KB) — Toggle dark/light
├── NotificationBell.jsx   (12.5KB) — Notificações WebSocket
├── ThemeProvider.tsx        (5.5KB) — Provider de tema
├── Providers.tsx            (0.5KB) — Wrapper de providers
├── activities/             (11 componentes ~97KB)
│   ├── ActivityCalendar, ActivityCard, ActivityDashboard
│   ├── ActivityForm, ActivityIcon, ActivityList
│   ├── ManualTimeLogForm, ProductivityReport
│   ├── QuickActivityModal, Timer, TimesheetTable
├── clients/                (9 componentes ~53KB)
│   ├── ClientAvatar, ClientCard, ClientFilters
│   ├── ClientForm (26.4KB), ClientSelect, ClientStats
│   ├── ClientsTable, DeleteClientButton, ExportButton
├── dashboard/              (14 componentes ~71KB)
│   ├── Chart, DashboardCharts, DashboardChartsWrapper
│   ├── DeadlineAlerts, KPICard, PeriodSelector
│   ├── ProductivityChart, ProjectFilter, ProjectList
│   ├── ProjectStatusChart, RevenueChart
│   ├── TimeByProjectChart, TodayActivities, UserFilter
├── documents/              (1 componente ~42KB)
│   └── DocumentsClient
├── inspections/            (6 componentes ~52KB)
│   ├── InspectionTimeline, NewInspectionDialog
│   ├── NewPunchListItemModal, PunchItemCard
│   ├── PunchListTable, ResolveItemModal
├── kanban/                 (7 componentes ~55KB)
│   ├── AddColumnButton, Column
│   ├── KanbanBoard (DnD Kit completo)
│   ├── RichTextEditor, TaskCard
│   ├── TaskDetails, TaskListView
├── projects/               (23 componentes ~223KB)
│   ├── ProjectForm, ProjectCard, ProjectsTable
│   ├── ProjectOverview, ProjectFinancialTab (29.7KB)
│   ├── ProjectDocumentsTab (55.8KB!), ProjectTeamTab
│   ├── ProjectPhasesTab, ProjectTasksTab
│   ├── ProjectHistoryTab, ProjectAuditTab
│   ├── ProjectDeliverablesTab, ProjectKanban
│   ├── ProjectPhaseTimeline, ProjectPhasesDialog
│   ├── ProjectInspectionsTab, ProjectFilters
│   ├── ProjectSelect, ProjectStats, ProjectsView
│   ├── DuplicateProjectModal, ExportButton
│   └── NewActivityButton
├── reports/                (3 componentes ~21KB)
├── settings/               (2 componentes ~11KB)
├── shared/                 (2 componentes ~8KB)
└── ui/                     (componentes shadcn/ui)
```

### Migrado — 8 componentes total

```
frontend/src/
├── components/layout/
│   ├── Navbar.tsx     (1.7KB)
│   └── Sidebar.tsx    (4.2KB)
├── views/
│   ├── LoginView.tsx         (6.6KB)
│   ├── DashboardView.tsx    (11.4KB) — Tudo inline
│   ├── ClientsView.tsx      (16.2KB) — Tudo inline
│   ├── ProjectsKanbanView.tsx (18.2KB) — Tudo inline
│   ├── InspectionsView.tsx  (23.8KB) — Tudo inline
│   └── TimeTrackingView.tsx (25.6KB) — Tudo inline
├── context/AuthContext.tsx
├── services/api.ts
└── types/ (4 arquivos)
```

### Diferença Quantitativa

| Métrica | Legado | Migrado | Delta |
|---------|--------|---------|-------|
| Total de componentes | ~80 | ~8 | **-90%** |
| Componentes reutilizáveis | ~60 | 2 | **-97%** |
| Peso total de código UI | ~650KB | ~110KB | **-83%** |
| Nível de componentização | Alto (atômico) | Baixo (monolítico) | 🔴 |

---

## 6. Backend — Server Actions vs. REST API

### Legado — 18 Server Actions (Prisma ORM)

| Arquivo | Funcionalidade | Migrado? |
|---------|---------------|----------|
| `auth.ts` (7.3KB) | Login, registro, getCurrentUser | ✅ |
| `client.ts` (8.8KB) | CRUD completo, filtros, stats | ⚠️ Parcial |
| `project.ts` (28KB!) | CRUD, filtros, duplicar, fases, equipe | ⚠️ Parcial |
| `kanban.ts` (7.8KB) | Colunas, mover projetos | ⚠️ Parcial |
| `task.ts` (8.1KB) | CRUD tasks, posições, checklist | ⚠️ Básico |
| `stage.ts` (3.8KB) | CRUD stages | ⚠️ Básico |
| `activity.ts` (9.4KB) | CRUD atividades, calendário | ⚠️ Parcial |
| `timeLog.ts` (11.3KB) | CRUD logs, resumos | ⚠️ Parcial |
| `inspection.ts` (12.1KB) | CRUD vistorias, punch list | ✅ |
| `dashboard.ts` (9.2KB) | Métricas KPI, gráficos | 🔴 Inexistente |
| `deliverable.ts` (15.1KB) | Upload, versionamento, aprovação | 🔴 Inexistente |
| `finance.ts` (12.2KB) | Orçamentos, estimativas, pagamentos | 🔴 Inexistente |
| `notification.ts` (4.2KB) | CRUD notificações | 🔴 Inexistente |
| `notificationSettings.ts` (3.6KB) | Preferências de notificação | 🔴 Inexistente |
| `reports.ts` (18.5KB) | Relatórios de negócios | 🔴 Inexistente |
| `audit.ts` (3.1KB) | Logs de auditoria | 🔴 Inexistente |
| `user.ts` (0.5KB) | Gestão de usuários | 🔴 Inexistente |

### Migrado — 5 módulos Spring Boot

| Módulo | Controllers | Endpoints |
|--------|------------|-----------|
| `auth` | AuthController | POST `/register`, POST `/login` |
| `client` | ClientController | CRUD + filtros + status update |
| `project` | ProjectController | CRUD + kanban columns + tasks |
| `inspection` | InspectionController | CRUD vistorias + punch list |
| `activity` | ActivityController, TimeLogController | CRUD atividades + time logs |

---

## 7. Modelo de Dados (Prisma vs. JPA/Flyway)

### Entidades Migradas vs. Não Migradas

| Entidade | Migrada? | Observações |
|----------|----------|-------------|
| `User` | ✅ | Funcional |
| `Client` | ⚠️ Parcial | Faltam tags[], metadata, geoLocation |
| `Project` | ⚠️ Parcial | Faltam campos arquitetônicos avançados |
| `Stage` | ✅ | Funcional |
| `Task` | ⚠️ Parcial | Faltam campos JSONB |
| `Activity` | ⚠️ Parcial | Básico |
| `TimeLog` | ⚠️ Parcial | Básico |
| `SiteInspection` | ✅ | Funcional |
| `PunchListItem` | ✅ | Funcional |
| `ProjectKanbanColumn` | ✅ | Funcional |
| `Deliverable` | 🔴 | Não migrada |
| `Estimate` | 🔴 | Não migrada |
| `Budget` | 🔴 | Não migrada |
| `ProjectMember` | 🔴 | Não migrada |
| `Notification` | 🔴 | Não migrada |
| `AuditLog` | 🔴 | Não migrada |
| `SystemNotificationRule` | 🔴 | Não migrada |
| `UserNotificationPreference` | 🔴 | Não migrada |

---

## 8. Funcionalidades Específicas

### 8.1 Kanban Board

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Biblioteca DnD | `@dnd-kit/core` + `@dnd-kit/sortable` | 🔴 Nenhuma |
| Drag & Drop de tasks | ✅ Entre colunas e dentro da coluna | 🔴 Inexistente |
| Drag & Drop de colunas | ✅ Reordenar colunas | 🔴 Inexistente |
| TaskCard | ✅ Componente dedicado | 🔴 Inline simplificado |
| TaskDetails | ✅ Modal com checklist, comentários | 🔴 Inexistente |
| AddColumnButton | ✅ Criar novas colunas | 🔴 Inexistente |
| TaskListView | ✅ Visualização alternativa | 🔴 Inexistente |
| RichTextEditor | ✅ Editor de texto rico | 🔴 Inexistente |
| DragOverlay | ✅ Preview visual durante drag | 🔴 Inexistente |

### 8.2 Dashboard

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| KPI Cards | ✅ 4 cards com trends | ⚠️ 4 cards sem trends |
| Gráficos | ✅ 4+ tipos de gráficos | 🔴 Inexistente |
| DeadlineAlerts | ✅ Projetos urgentes | 🔴 Inexistente |
| TodayActivities | ✅ Agenda do dia | 🔴 Inexistente |
| PeriodSelector | ✅ Filtro por período | 🔴 Inexistente |
| Filtros | ✅ Por projeto e usuário | 🔴 Inexistente |

### 8.3 Gestão de Clientes

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Formulário | ✅ 20+ campos (26.4KB) | ⚠️ ~10 campos |
| Cards view | ✅ ClientCard.tsx | 🔴 Inexistente |
| Filtros | ✅ Status, categoria, busca | ⚠️ Apenas busca |
| Stats | ✅ Métricas resumo | 🔴 Inexistente |
| Export | ✅ CSV/Excel | 🔴 Inexistente |
| Campos PJ | ✅ razaoSocial, CNPJ | 🔴 Não implementados |

### 8.4 Detalhe do Projeto (10+ tabs)

| Tab | Legado | Migrado |
|-----|--------|---------|
| Overview | ✅ (13.2KB) | 🔴 |
| Financial | ✅ (29.7KB) | 🔴 |
| Documents | ✅ (55.8KB!) | 🔴 |
| Team | ✅ (16.7KB) | 🔴 |
| Phases | ✅ (6.7KB) | 🔴 |
| Tasks | ✅ (9.4KB) | 🔴 |
| History | ✅ (4.4KB) | 🔴 |
| Inspections | ✅ (3.5KB) | 🔴 |
| Audit | ✅ (7.7KB) | 🔴 |
| Deliverables | ✅ (5.8KB) | 🔴 |

### 8.5 Atividades e Time Tracking

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Timer em tempo real | ✅ Start/stop/pause | 🔴 Inexistente |
| Calendário | ✅ ActivityCalendar | 🔴 Inexistente |
| TimesheetTable | ✅ Tabela semanal | 🔴 Inexistente |
| ProductivityReport | ✅ Por período | 🔴 Inexistente |

### 8.6 Notificações

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| WebSocket | ✅ useWebSocket.js | 🔴 Inexistente |
| NotificationBell | ✅ 263 linhas | 🔴 Inexistente |
| RBAC | ✅ Por role | 🔴 Inexistente |

### 8.7 Roteamento

| Aspecto | Legado | Migrado |
|---------|--------|---------|
| Sistema | Next.js App Router | `useState` |
| URLs reais | ✅ `/projects/123` | 🔴 Tudo é `/` |
| Deep linking | ✅ | 🔴 Impossível |
| Back/forward | ✅ | 🔴 Não funciona |

---

## 9. Design System e CSS

### Divergência de Identidade Visual

O projeto migrado criou uma **identidade visual completamente nova** em vez de replicar a do legado:

| Token | Legado | Migrado |
|-------|--------|---------|
| Primary | `#1677ff` (Azul) | `#CDD5C6` (Sage verde) |
| Background dark | `#111111` | `#0D0D0D` |
| Card dark | `#1A1A1A` | `#152026` (azul-escuro) |
| Border | HSL dinâmico | `#2F4047` fixo |
| Accent | Azul | Verde-sage |
| Font body | Plus Jakarta Sans | Noto Sans |
| Estilo | Ant Design clean | Glassmorphism |

---

## 10. Tabela Resumo de Gaps

| # | Funcionalidade | Severidade | Esforço Est. | Prioridade |
|---|---------------|------------|--------------|------------|
| 1 | Tema Dark/Light | 🔴 Crítica | 1-2 dias | P0 |
| 2 | Responsividade Mobile | 🔴 Crítica | 1-2 dias | P0 |
| 3 | Roteamento Real | 🔴 Crítica | 1 dia | P0 |
| 4 | Design System CSS | 🔴 Crítica | 2-3 dias | P0 |
| 5 | Kanban DnD | 🔴 Crítica | 2-3 dias | P1 |
| 6 | Dashboard Gráficos | ⚠️ Alta | 2-3 dias | P1 |
| 7 | Detalhe do Projeto (tabs) | ⚠️ Alta | 5+ dias | P1 |
| 8 | Notifications | ⚠️ Alta | 2-3 dias | P1 |
| 9 | Componentização | ⚠️ Alta | 3-4 dias | P1 |
| 10 | Activities Page | ⚠️ Alta | 2-3 dias | P2 |
| 11 | Clientes avançado | ⚠️ Média | 1-2 dias | P2 |
| 12 | Timer Real | ⚠️ Média | 1-2 dias | P2 |
| 13 | Documents Page | ⚠️ Média | 3-4 dias | P2 |
| 14 | Reports Page | ⚠️ Média | 2-3 dias | P2 |
| 15 | Settings Page | 🟡 Baixa | 1-2 dias | P3 |
| 16 | Schedule Page | 🟡 Baixa | 2-3 dias | P3 |
| 17 | Deliverables API | ⚠️ Média | 1-2 dias | P2 |
| 18 | Finance API | ⚠️ Média | 1-2 dias | P2 |
| 19 | Audit Log API | 🟡 Baixa | 0.5-1 dia | P3 |
| 20 | Dashboard Metrics API | ⚠️ Alta | 1-2 dias | P1 |
| 21 | Busca Global | 🟡 Baixa | 1-2 dias | P3 |
| 22 | Navbar completa | ⚠️ Média | 0.5 dia | P1 |
| 23 | ProjectMember entity | ⚠️ Média | 0.5-1 dia | P2 |
| 24 | Notification entity | ⚠️ Alta | 1-2 dias | P1 |

---

## 11. Priorização de Correções

### 🔴 P0 — Infraestrutura Essencial

1. **Roteamento Real** → Instalar `react-router-dom`, criar rotas com URLs
2. **Design System CSS** → Recriar variáveis HSL, suportar light/dark
3. **ThemeProvider + ModeToggle** → Portar do legado e adaptar
4. **Responsividade** → Sidebar colapsável, mobile drawer, breakpoints

### ⚠️ P1 — Funcionalidades Core

5. **Kanban DnD** → Instalar `@dnd-kit`, implementar drag-and-drop
6. **Dashboard completo** → Gráficos, filtros, métricas
7. **Detalhe do Projeto** → Rota `/projects/:id` com tabs
8. **Navbar completa** → Avatar, NotificationBell, busca
9. **Componentização** → Extrair sub-componentes das views monolíticas
10. **Dashboard Metrics API** → Endpoint backend com aggregações
11. **Notification system** → Backend + SSE/WebSocket

### 🟡 P2 — Módulos Secundários

12. **Activities Page** → Calendário, dashboard, formulário
13. **Timer Real** → Start/stop/pause com persistência
14. **Clientes avançado** → Cards, stats, export, filtros
15. **Documents Page** → Upload e gestão
16. **Reports Page** → Relatórios de negócios
17. **Deliverables + Finance API** no backend

### ⚪ P3 — Nice-to-have

18. **Settings Page**, **Schedule Page**, **Busca Global**, **Audit Log**

---

## Conclusão

A migração atual representa aproximadamente **25-30% da funcionalidade do projeto legado**. As maiores regressões são:

1. **Perda total do sistema de temas** (dark/light) — o app é dark-only
2. **Sem responsividade** — inutilizável em mobile/tablet
3. **Sem roteamento** — impossível compartilhar URLs ou usar browser navigation
4. **Kanban estático** — funcionalidade mais visual perdeu o DnD
5. **Identidade visual divergente** — paleta e estilo completamente diferentes
6. **Views monolíticas** — todo o código inline sem componentização

O esforço estimado para atingir **paridade funcional** é de **25-35 dias de desenvolvimento**.
