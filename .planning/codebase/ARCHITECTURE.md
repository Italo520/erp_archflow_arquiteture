# Arquitetura

> Último mapeamento: 2026-05-27

## Padrão Arquitetural

**Monolito Full-Stack** — Next.js 16 App Router com Server Actions, substituindo a arquitetura legada de Java Spring Boot + Frontend React.

### Decisões Técnicas Principais
1. **Server Actions ao invés de API REST** — A maioria das operações CRUD usa actions `'use server'` diretamente, eliminando a camada de API REST
2. **App Router** — Toda a navegação usa o App Router do Next.js com grupos de rotas `(auth)` e `(dashboard)`
3. **Prisma como camada única de dados** — Todo acesso ao banco de dados passa pelo Prisma Client
4. **Sessões JWT** — NextAuth v5 com estratégia JWT (sem sessões no banco de dados)
5. **Estado no cliente** — Sem gerenciador de estado global (React Context via Providers, useState local)

## Arquitetura em Camadas

```
┌─────────────────────────────────────────────────┐
│                    Navegador                     │
├─────────────────────────────────────────────────┤
│           Componentes React (Cliente)            │
│   components/{feature}/*.tsx                     │
│   hooks/useWebSocket.js                          │
├─────────────────────────────────────────────────┤
│           Páginas Next.js (Servidor + Cliente)   │
│   app/(dashboard)/{rota}/page.jsx                │
│   app/(auth)/{rota}/page.jsx                     │
├─────────────────────────────────────────────────┤
│           Server Actions                         │
│   actions/{entidade}.ts                          │
│   app/actions/{entidade}.ts                      │
├─────────────────────────────────────────────────┤
│           Route Handlers da API (mínimo)         │
│   app/api/v1/notifications/route.ts              │
├─────────────────────────────────────────────────┤
│           Biblioteca / Utilitários               │
│   lib/prisma.ts, lib/validations.ts              │
│   lib/permissions.ts, lib/db.ts                  │
├─────────────────────────────────────────────────┤
│           Prisma ORM + PostgreSQL                │
│   prisma/schema.prisma                           │
└─────────────────────────────────────────────────┘
```

## Fluxo de Dados

### Fluxo Típico de Server Action (Padrão Principal)
```
Ação do Usuário → Componente Cliente → Server Action (actions/*.ts)
  → Validação Zod → Verificação de sessão auth() → Query Prisma
  → revalidatePath() → Retorno do resultado
```

### Fluxo Típico de Carregamento de Página
```
URL → Rota Next.js → Server Component (page.jsx)
  → Server Action (busca de dados) → Query Prisma
  → Renderiza RSC → Stream para o cliente
```

### Fluxo de Tempo Real (Notificações)
```
Evento do Servidor → Pusher Server SDK → Canal Pusher
  → Cliente (hook useWebSocket) → Atualização de estado → UI
```

### Fluxo REST Legado (Sendo Descontinuado)
```
Componente Cliente → services/*.js → Axios → API Externa (:8080)
  → Resposta → Atualização de estado → UI
```

## Abstrações Principais

### Autenticação (`auth.ts`, `auth.config.ts`)
- Configuração centralizada de auth com NextAuth v5
- `auth()` chamado em toda Server Action para validação de sessão
- Cadeia de callbacks: `authorize` → `jwt` → `session`
- Middleware de rota em `proxy.ts`

### Server Actions (`actions/*.ts`)
Camada principal de lógica server-side. Cada action:
1. Chama `auth()` para verificar sessão
2. Valida input com schemas Zod
3. Executa queries Prisma
4. Chama `revalidatePath()` para invalidação de cache
5. Retorna `{ success: boolean, ... }`

**Arquivos de actions:**

| Arquivo | Entidades | Operações |
|---|---|---|
| `actions/auth.ts` | Usuário | Registro |
| `actions/project.ts` | Projeto, Etapa | Criar, Ler, Deletar |
| `actions/task.ts` | Tarefa | Criar, Atualizar, Deletar, Reordenar |
| `actions/stage.ts` | Etapa | Atualizar ordem |

### Actions do App (`app/actions/*.ts`)
Server Actions mais granulares com escopo de funcionalidades do dashboard:

| Arquivo | Propósito |
|---|---|
| `app/actions/auth.ts` | Actions relacionadas a autenticação |
| `app/actions/project.ts` | Operações estendidas de projeto |
| `app/actions/dashboard.ts` | Agregação de dados do dashboard (KPIs, gráficos) |
| `app/actions/client.ts` | CRUD de clientes |
| `app/actions/activity.ts` | Gerenciamento de atividades |
| `app/actions/kanban.ts` | Operações do quadro Kanban |
| `app/actions/deliverable.ts` | Gerenciamento de entregáveis |
| `app/actions/timeLog.ts` | Operações de rastreamento de tempo |
| `app/actions/report.ts` | Geração de relatórios |
| `app/actions/reports.ts` | Consultas de dados de relatórios |

### Camada de Validação (`lib/validations.ts`)
- Schemas Zod centralizados para todas as entidades
- Usa `z.nativeEnum()` para espelhar enums do Prisma
- Schemas: `clientSchema`, `activitySchema`, `timeLogSchema`, `deliverableSchema`, `projectSchema`, `taskSchema`, `userSchema`
- Cada um tem um `update*Schema` correspondente com `.partial()` + `id` obrigatório

### Permissões (`lib/permissions.ts`)
- Verificações de permissão baseadas em papel (OWNER, EDITOR, VIEWER)
- Funções: `canCreateProject`, `canDeleteProject`, `canManageTeam`, `canEditTask`, `canDeleteTask`, `canCreateClient`
- `hasProjectAccess(userRole, requiredRole)` — verificação hierárquica de papel
- **Ainda não integrado** na maioria das Server Actions (verificação de auth é apenas baseada em sessão)

### Utilitários de Banco de Dados (`lib/db.ts`)
- `getActivityMetricsByUser()` — Agrega dados de atividade por tipo
- `getProductivityTrends()` — Tendências de time log agrupadas por data

## Pontos de Entrada

| Ponto de Entrada | Arquivo | Propósito |
|---|---|---|
| Layout Raiz | `app/layout.js` | Shell HTML, fontes, Providers |
| Página Raiz | `app/page.jsx` | Landing/redirecionamento |
| Layout Dashboard | `app/(dashboard)/layout.jsx` | Shell do dashboard com sidebar |
| Layout Auth | `app/(auth)/layout.jsx` | Layout de páginas de autenticação |
| API Auth | `app/api/auth/[...nextauth]/route.ts` (implícito) | Route handler do NextAuth |
| API Notificações | `app/api/v1/notifications/route.ts` | Endpoint REST de notificações |
| Middleware | `proxy.ts` | Middleware de autenticação em nível de rota |

## Arquitetura de Componentes

### Hierarquia de Providers
```
RootLayout
  └── Providers (components/Providers.jsx)
       └── SessionProvider (next-auth)
            └── ThemeProvider (next-themes)
                 └── {children}
                      └── Toaster (sonner)
```

### Padrão de Organização de Componentes
```
components/
  ├── Layout.jsx          — Shell principal do dashboard (sidebar + header)
  ├── Providers.jsx        — Wrapper de providers de contexto
  ├── ui/                  — Primitivas Shadcn/UI (25 componentes)
  ├── shared/              — Componentes compartilhados entre features (ExportButtons, ImageUpload)
  ├── dashboard/           — Componentes específicos do dashboard (14 arquivos)
  ├── projects/            — Gerenciamento de projetos (20 arquivos)
  ├── clients/             — Gerenciamento de clientes (8 arquivos)
  ├── activities/          — Atividades e rastreamento de tempo (11 arquivos)
  ├── kanban/              — Quadro Kanban (4 arquivos)
  ├── tasks/               — Detalhes de tarefas (1 arquivo)
  ├── comments/            — Comentários com texto rico (2 arquivos)
  └── reports/             — Relatórios de negócios e produtividade (2 arquivos)
```
