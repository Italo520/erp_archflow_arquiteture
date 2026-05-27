# Integrações Externas

> Último mapeamento: 2026-05-27

## Banco de Dados: PostgreSQL (via Supabase)

- **Provedor:** Supabase (PostgreSQL hospedado)
- **Conexão:** `DATABASE_URL` (com pool), `DIRECT_URL` (direta para migrações)
- **ORM:** Prisma v7 com adaptador de driver `@prisma/adapter-pg`
- **Configuração do cliente:** `lib/prisma.ts` — padrão singleton com `pg.Pool`
- **Schema:** `prisma/schema.prisma` (587 linhas, 17 modelos, 15+ enums)
- **Migrações:** Diretório `prisma/migrations/`
- **Seed:** `prisma/seed.ts` (executado via `ts-node`)

### Visão Geral dos Modelos

| Modelo | Propósito | Relações Principais |
|---|---|---|
| `User` | Usuários do sistema (OWNER/EDITOR/VIEWER) | Projetos, Tarefas, AuditLogs, Notificações |
| `Client` | Clientes de arquitetura (PF/PJ) | Projetos, Atividades, TimeLogs |
| `Project` | Projetos arquitetônicos | Etapas, Tarefas, Membros, Orçamento, Estimativa |
| `Stage` | Colunas Kanban por projeto | Tarefas |
| `Task` | Itens de trabalho dentro das etapas | Atividades, Entregáveis, TimeLogs |
| `Activity` | Eventos de calendário (reuniões, ligações, visitas) | Cliente, Projeto, Tarefa |
| `Deliverable` | Entregáveis do projeto (renders, desenhos) | Tarefa, Projeto |
| `TimeLog` | Registros de tempo | Usuário, Projeto, Tarefa, Cliente |
| `Estimate` | Estimativas de custo do projeto | Projeto (1:1) |
| `Budget` | Orçamentos do projeto | Projeto (1:1) |
| `ProjectMember` | Membros do projeto (Usuário-Projeto) | Usuário, Projeto |
| `Notification` | Notificações in-app | Usuário |
| `AuditLog` | Trilha de auditoria de alterações | Usuário, Projeto |
| `PasswordResetToken` | Fluxo de reset de senha | — |
| `ProjectKanbanColumn` | Colunas Kanban customizadas | — |

## Armazenamento: Supabase Storage

- **Cliente:** `lib/supabase.ts` — `createClient(url, anonKey)`
- **Uso:** Upload de imagens de projetos em `actions/project.ts`
- **Bucket:** `projects`
- **Fluxo:** Upload do arquivo → obter URL pública → armazenar no campo `imageUrl` do BD
- **Autenticação:** Supabase Anon Key (uploads públicos)
- **Variáveis de ambiente:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Autenticação: NextAuth.js v5

- **Configuração:** `auth.ts` + `auth.config.ts`
- **Provedor:** Apenas Credentials (email + senha)
- **Sessão:** Baseada em JWT
- **Hash de senha:** bcryptjs
- **Validação:** Schema Zod no input de login
- **Middleware:** `proxy.ts` (proteção de rota)
- **Rotas protegidas:** `/dashboard/*`, `/projects/*`
- **Variável de ambiente:** `AUTH_SECRET`

## Tempo Real: Pusher

- **Cliente:** `hooks/useWebSocket.js` — Singleton Pusher.js
- **Servidor:** Pacote `pusher` disponível (ainda não integrado nas Server Actions)
- **Padrão de canal:** `notifications-{userId}` (canais públicos, privados planejados)
- **Eventos:** `new-notification`
- **Estado:** Apenas no cliente (notificações não persistidas no BD via WebSocket)
- **Variáveis de ambiente:** `NEXT_PUBLIC_PUSHER_KEY`, `NEXT_PUBLIC_PUSHER_CLUSTER`

## Cliente HTTP (Legado)

- **Cliente:** `services/api.js` — Instância Axios
- **URL Base:** `NEXT_PUBLIC_API_URL` (padrão: `http://localhost:8080`)
- **Autenticação:** Token Bearer via cookies (padrão legado)
- **Uso:** Arquivos de serviço legados no diretório `services/`
- **Status:** Sendo substituído por Server Actions

### Arquivos de Serviço Legados

| Arquivo | Propósito |
|---|---|
| `services/api.js` | Cliente HTTP base com Axios |
| `services/auth.service.js` | Chamadas de API de autenticação legadas |
| `services/authService.js` | Serviço de autenticação duplicado |
| `services/project.service.js` | CRUD de projetos via REST |
| `services/task.service.js` | CRUD de tarefas via REST |
| `services/comment.service.js` | Comentários via REST |
| `services/notification.service.js` | Notificações via REST |

## Serviços de Exportação

### Exportação PDF (`lib/export-pdf.ts`)
- Usa **jspdf** + **jspdf-autotable**
- Gera relatórios PDF para projetos, tarefas, rastreamento de tempo

### Exportação Excel (`lib/export-excel.ts`)
- Usa **exceljs**
- Gera planilhas Excel para exportação de dados

## Editor de Texto Rico

- **Biblioteca:** TipTap (via `@tiptap/react`, `@tiptap/starter-kit`)
- **Extensões:** Image, Mention
- **Uso:** `components/comments/CommentEditor.jsx`

## Drag & Drop

- **Biblioteca:** @dnd-kit (core + sortable + utilities)
- **Uso:** Quadro Kanban (`components/kanban/KanbanBoard.tsx`)
- **Padrão:** Colunas ordenáveis com cards de tarefa arrastáveis

## Gráficos e Visualização de Dados

- **Biblioteca:** Recharts v3
- **Uso:** Gráficos do dashboard (`components/dashboard/`)
- **Gráficos:** Receita, Produtividade, Status de Projetos, Tempo por Projeto

## API de Notificações

- **Rota:** `app/api/v1/notifications/route.ts`
- **Protocolo:** REST (GET notificações do usuário)
- **Componente cliente:** `components/NotificationBell.jsx`
- **Tempo real:** WebSocket Pusher para notificações push

## CDN Externo

- **Google Fonts:** Material Symbols Outlined (via link CDN em `app/layout.js`)
- **Fontes:** Inter, Outfit (via `next/font/google`)
