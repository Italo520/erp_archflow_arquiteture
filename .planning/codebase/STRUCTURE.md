# Estrutura do Projeto

> Último mapeamento: 2026-05-27

## Layout do Diretório Raiz

```
erp_archflow_arquiteture/
├── .agent/                      # Skills e configurações do agente
│   └── skills/                  # Definições de skills customizadas
├── .git/                        # Repositório Git
├── .github/                     # Configuração GitHub (workflows, templates)
├── .gitignore                   # Regras de ignorar do Git
├── .nvmrc                       # Versão do Node.js (20+)
├── README.md                    # Visão geral e guia de configuração
│
├── actions/                     # 🔵 Server Actions (nível raiz, posição legada)
│   ├── auth.ts                 # Registro de usuário
│   ├── project.ts              # CRUD de Projeto + criação de Etapas
│   ├── stage.ts                # Ordenação de etapas
│   └── task.ts                 # CRUD de Tarefa + reordenação
│
├── app/                         # 🟢 Next.js App Router
│   ├── globals.css             # Estilos globais (Tailwind v4 + tema)
│   ├── layout.js               # Layout HTML raiz + fontes + Providers
│   ├── page.jsx                # Página raiz (landing/redirecionamento)
│   ├── favicon.ico             # Favicon da aplicação
│   ├── (auth)/                 # Grupo de rotas de autenticação (públicas)
│   │   ├── layout.jsx          # Wrapper de layout de auth
│   │   ├── login/              # Página de login
│   │   ├── register/           # Página de registro
│   │   ├── forgot-password/    # Recuperação de senha
│   │   └── reset-password/     # Reset de senha
│   ├── (dashboard)/            # Grupo de rotas do dashboard (protegidas)
│   │   ├── layout.jsx          # Layout do dashboard (usa Layout.jsx)
│   │   ├── dashboard/          # Página principal do dashboard
│   │   ├── projects/           # Lista e detalhes de projetos
│   │   ├── clients/            # Gerenciamento de clientes
│   │   ├── activities/         # Rastreamento de atividades
│   │   ├── schedule/           # Calendário/cronograma
│   │   ├── time-tracking/      # Registro de tempo
│   │   ├── documents/          # Gerenciamento de documentos
│   │   ├── reports/            # Relatórios e analytics
│   │   └── settings/           # Configurações da aplicação
│   ├── actions/                # 🔵 Server Actions (escopo do app, mais recentes)
│   │   ├── auth.ts             # Actions de autenticação
│   │   ├── project.ts          # Operações estendidas de projeto
│   │   ├── dashboard.ts        # Agregação de dados do dashboard
│   │   ├── client.ts           # CRUD de clientes
│   │   ├── activity.ts         # Gerenciamento de atividades
│   │   ├── kanban.ts           # Operações do Kanban
│   │   ├── deliverable.ts      # Gerenciamento de entregáveis
│   │   ├── timeLog.ts          # Rastreamento de tempo
│   │   ├── report.ts           # Geração de relatórios
│   │   └── reports.ts          # Consultas de relatórios
│   └── api/                    # Route Handlers da API
│       ├── auth/               # Route handler do NextAuth
│       └── v1/                 # API v1
│           └── notifications/  # Endpoint de notificações
│               └── route.ts
│
├── components/                  # 🟡 Componentes React
│   ├── Layout.jsx              # Layout principal do dashboard (sidebar + header)
│   ├── Providers.jsx           # Providers de contexto (Session + Theme)
│   ├── ModeToggle.tsx          # Alternância modo escuro/claro
│   ├── ThemeProvider.tsx       # Provider de contexto de tema
│   ├── NotificationBell.jsx    # Dropdown de notificações
│   ├── ui/                     # Componentes base Shadcn/UI (25 arquivos)
│   ├── shared/                 # Componentes compartilhados entre features
│   │   ├── ExportButtons.tsx
│   │   └── ImageUpload.tsx
│   ├── dashboard/              # Feature dashboard (14 arquivos)
│   │   ├── KPICard.tsx
│   │   ├── DashboardCharts.tsx
│   │   ├── DeadlineAlerts.tsx
│   │   ├── ProductivityChart.tsx
│   │   ├── ProjectStatusChart.tsx
│   │   └── ... (mais 8)
│   ├── projects/               # Gerenciamento de projetos (20 arquivos)
│   │   ├── ProjectForm.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectKanban.tsx
│   │   ├── ProjectsTable.tsx
│   │   ├── ProjectOverview.tsx
│   │   └── ... (mais 15)
│   ├── clients/                # Gerenciamento de clientes (8 arquivos)
│   │   ├── ClientForm.tsx
│   │   ├── ClientCard.tsx
│   │   ├── ClientsTable.tsx
│   │   └── ... (mais 5)
│   ├── activities/             # Atividades e rastreamento de tempo (11 arquivos)
│   │   ├── ActivityForm.tsx
│   │   ├── ActivityCalendar.tsx
│   │   ├── Timer.tsx
│   │   ├── TimesheetTable.tsx
│   │   └── ... (mais 7)
│   ├── kanban/                 # Quadro Kanban (4 arquivos)
│   │   ├── KanbanBoard.tsx
│   │   ├── Column.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskDetails.tsx
│   ├── tasks/                  # Componentes de tarefas (1 arquivo)
│   │   └── TaskDetailsDialog.jsx
│   ├── comments/               # Sistema de comentários (2 arquivos)
│   │   ├── CommentEditor.jsx
│   │   └── CommentList.jsx
│   ├── reports/                # Visualizações de relatórios (2 arquivos)
│   │   ├── BusinessReport.tsx
│   │   └── ProductivityReport.tsx
│   └── layout/                 # Sub-componentes de layout
│
├── hooks/                       # 🔵 Hooks React Customizados
│   └── useWebSocket.js         # Hook de notificações baseado em Pusher
│
├── lib/                         # 🟣 Utilitários e Configuração
│   ├── prisma.ts               # Singleton do cliente Prisma
│   ├── db.ts                   # Helpers de consulta ao banco
│   ├── supabase.ts             # Cliente Supabase
│   ├── validations.ts          # Schemas Zod (todas as entidades)
│   ├── permissions.ts          # Verificações de permissão baseadas em papéis
│   ├── utils.ts                # Utilitários gerais (helper cn)
│   ├── server-utils.ts         # Utilitários server-side
│   ├── export-pdf.ts           # Geração de PDF (jspdf)
│   └── export-excel.ts         # Geração de Excel (exceljs)
│
├── services/                    # 🔴 Serviços REST Legados
│   ├── api.js                  # Cliente base Axios
│   ├── auth.service.js         # Chamadas de API de auth
│   ├── authService.js          # Serviço de auth duplicado
│   ├── project.service.js      # Chamadas de API de projetos
│   ├── task.service.js         # Chamadas de API de tarefas
│   ├── comment.service.js      # Chamadas de API de comentários
│   └── notification.service.js # Chamadas de API de notificações
│
├── prisma/                      # 🗄️ Banco de Dados
│   ├── schema.prisma           # Schema do banco (587 linhas)
│   ├── seed.ts                 # Script de dados iniciais
│   └── migrations/             # Arquivos de migração
│
├── types/                       # Extensões de Tipos TypeScript
│   └── next-auth.d.ts          # Extensões de tipo de sessão NextAuth
│
├── tests/                       # 🧪 Suíte de Testes
│   ├── jest.setup.ts           # Configuração do Jest (mocks)
│   ├── unit/                   # Testes unitários (8 arquivos + subdiretórios)
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
│   ├── integration/            # Testes de integração
│   │   ├── clients.test.ts
│   │   ├── projects.test.ts
│   │   ├── reports.test.ts
│   │   └── time-tracking.test.ts
│   └── e2e/                    # Testes E2E (Playwright)
│
├── docs/                        # 📚 Documentação
│   ├── CONTEXT.md              # Contexto do projeto
│   ├── PLAN.md                 # Plano de desenvolvimento
│   ├── PRD_COMPLETO_v3.md      # PRD completo (78KB)
│   └── walkthrough.md          # Passo a passo
│
├── public/                      # Assets estáticos
│
├── auth.ts                      # Configuração principal do NextAuth
├── auth.config.ts               # Configuração de callbacks do NextAuth
├── proxy.ts                     # Middleware de autenticação
├── prisma.config.ts             # Configuração CLI do Prisma
├── package.json                 # Dependências e scripts
├── tsconfig.json                # Configuração TypeScript
├── next.config.mjs              # Configuração Next.js
├── tailwind.config.mjs          # Configuração Tailwind CSS
├── postcss.config.mjs           # Configuração PostCSS
├── eslint.config.mjs            # Configuração ESLint
├── jest.config.js               # Configuração Jest
├── playwright.config.ts         # Configuração Playwright
├── components.json              # Configuração Shadcn/UI
├── jsconfig.json                # Configuração JavaScript
│
├── dag_tasks.json               # DAG de tarefas (ferramentas de dev)
├── dev.log                      # Log do servidor de dev
├── dev_server.log               # Log do servidor de dev
├── test_action.ts               # Arquivo de teste temporário
├── tmp_check_db.ts              # Script temporário de verificação do BD
└── tmp_perf_test.ts             # Teste de performance temporário
```

## Convenções de Nomenclatura

### Arquivos
- **Componentes:** PascalCase (ex: `ProjectCard.tsx`, `KPICard.tsx`)
- **Actions:** camelCase (ex: `project.ts`, `timeLog.ts`)
- **Utilitários:** camelCase/kebab-case (ex: `export-pdf.ts`, `server-utils.ts`)
- **Testes:** `{nome}.test.ts` ou `{nome}.test.tsx`
- **Rotas:** diretórios em kebab-case minúsculo (ex: `time-tracking/`, `forgot-password/`)

### Linguagem Mista (JS/TS)
- **TypeScript (`.ts`, `.tsx`):** Actions, lib, componentes (código mais recente)
- **JavaScript (`.js`, `.jsx`):** Layout, hooks, alguns serviços, arquivos de página (legado/início do projeto)
- Padrão: Features mais recentes usam TypeScript, mais antigas permanecem JS

### Grupos de Rotas
- `(auth)` — Rotas públicas (login, registro, reset de senha)
- `(dashboard)` — Rotas protegidas (todas as funcionalidades da aplicação)

## Localizações Principais

| Necessidade | Localização |
|---|---|
| Adicionar uma nova página | `app/(dashboard)/{rota}/page.jsx` |
| Adicionar uma server action | `app/actions/{entidade}.ts` |
| Adicionar um componente UI | `components/ui/{nome}.tsx` |
| Adicionar um componente de feature | `components/{feature}/{Nome}.tsx` |
| Modificar schema do banco | `prisma/schema.prisma` |
| Adicionar regras de validação | `lib/validations.ts` |
| Adicionar permissões | `lib/permissions.ts` |
| Adicionar um hook customizado | `hooks/use{Nome}.js` |
| Adicionar um teste | `tests/unit/{nome}.test.ts` |
| Configurar tema | `app/globals.css` + `tailwind.config.mjs` |
