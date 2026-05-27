# Stack Tecnológica

> Último mapeamento: 2026-05-27

## Linguagens e Runtime

| Tecnologia | Versão | Propósito |
|---|---|---|
| **TypeScript** | ^5.9.3 | Linguagem principal (actions, lib, componentes, configs) |
| **JavaScript (JSX)** | Target ES2017 | Componentes legados, serviços, hooks |
| **Node.js** | 20+ (.nvmrc) | Runtime |
| **SQL** | PostgreSQL | Banco de dados |

- Modo strict do TypeScript está **desabilitado** (`"strict": false` em `tsconfig.json`)
- Resolução de módulos: `bundler` (padrão do Next.js)
- Alias de caminho: `@/*` → `./*` (ex: `@/lib/prisma`)

## Framework Principal

| Pacote | Versão | Papel |
|---|---|---|
| **Next.js** | 16.1.1 | Framework full-stack (App Router, Server Actions, RSC) |
| **React** | 19.2.3 | Biblioteca de UI |
| **React DOM** | 19.2.3 | Renderizador DOM |

### Configuração do Next.js (`next.config.mjs`)
- **PWA habilitado** via `@ducanh2912/next-pwa` (desabilitado em dev)
- Build: modo webpack (flag `--webpack`)
- Origens permitidas em dev: `localhost:3000`, `192.168.0.37:3000`
- App Router (sem Pages Router)

## Banco de Dados e ORM

| Pacote | Versão | Papel |
|---|---|---|
| **Prisma Client** | ^7.2.0 | ORM / Query builder |
| **Prisma (CLI)** | ^7.6.0 | Gerenciamento de schema e migrações |
| **@prisma/adapter-pg** | ^7.2.0 | Adaptador PostgreSQL (baseado em driver) |
| **pg** | ^8.17.1 | Pool de conexões PostgreSQL |

### Configuração do Banco (`lib/prisma.ts`)
- Usa Prisma **baseado em driver** com adaptador `PrismaPg` sobre `pg.Pool`
- String de conexão via variável de ambiente `DATABASE_URL`
- Padrão singleton em dev via `globalForPrisma`
- Logging: `query`, `error`, `warn`
- PostgreSQL hospedado no **Supabase** (veja `prisma.config.ts` — usa `DIRECT_URL` para migrações)
- Hook postinstall executa `prisma generate`

## Autenticação

| Pacote | Versão | Papel |
|---|---|---|
| **next-auth** | ^5.0.0-beta.30 | Framework de autenticação (NextAuth v5 beta) |
| **bcryptjs** | ^3.0.3 | Hash de senhas |

### Configuração de Auth (`auth.ts`, `auth.config.ts`)
- Apenas provedor **Credentials** (email + senha)
- Estratégia de sessão JWT
- Validação de input via Zod no login
- Comparação de senha via bcrypt
- Callbacks customizados: `jwt` (adiciona `id`, `role`), `session` (expõe `id`, `role`)
- Proteção de rotas: `/dashboard/*` e `/projects/*` exigem autenticação
- Middleware proxy em `proxy.ts` para proteção em nível de rota
- Extensão de tipos: `types/next-auth.d.ts`

## UI e Estilização

| Pacote | Versão | Papel |
|---|---|---|
| **Tailwind CSS** | ^4.0.0 | Framework CSS utilitário |
| **@tailwindcss/postcss** | ^4.0.0 | Integração com PostCSS |
| **tailwindcss-animate** | ^1.0.7 | Utilitários de animação |
| **tailwind-merge** | ^3.4.0 | Merge de classes |
| **class-variance-authority** | ^0.7.1 | Estilização baseada em variantes |
| **clsx** | ^2.1.1 | Nomes de classes condicionais |
| **next-themes** | ^0.4.6 | Alternância modo escuro/claro |

### Design System
- **Biblioteca de componentes:** Padrão Shadcn/UI (25 componentes em `components/ui/`)
- **Primitivas:** Radix UI (Dialog, Select, Dropdown, Tabs, Tooltip, Checkbox, etc.)
- **Ícones:** Lucide React + Google Material Symbols (via CDN)
- **Fontes:** Inter (corpo), Outfit (display) via `next/font/google`; config também referencia Spline Sans, Manrope, Noto Sans
- **Paleta de cores:** Variáveis CSS baseadas em HSL, temas claro/escuro em `globals.css`
  - Claro: Bege pastel (#FBF2ED), verde pastel primário (#CDD5C6)
  - Escuro: Preto profundo (#0D0D0D), azul profundo (#152026), ardósia (#253840)
- **Cores customizadas:** Status (a fazer/em progresso/concluído), variantes de superfície

## Dependências Principais

| Pacote | Versão | Propósito |
|---|---|---|
| **@dnd-kit/core + sortable** | ^6.3.1 / ^10.0.0 | Drag and drop (quadro Kanban) |
| **@tiptap/react + starter-kit** | ^3.14.0 | Editor de texto rico (comentários, descrições) |
| **react-hook-form** | ^7.71.1 | Gerenciamento de formulários |
| **@hookform/resolvers** | ^5.2.2 | Resolver Zod para RHF |
| **zod** | ^4.3.5 | Validação de schemas |
| **recharts** | ^3.6.0 | Gráficos e visualização de dados |
| **@tanstack/react-table** | ^8.21.3 | Tabelas de dados |
| **date-fns** | ^4.1.0 | Manipulação de datas |
| **sonner** | ^2.0.7 | Notificações toast |
| **cmdk** | ^1.1.1 | Paleta de comandos |
| **axios** | ^1.13.2 | Cliente HTTP (camada de serviço legada) |
| **js-cookie** | ^3.0.5 | Gerenciamento de cookies (legado) |
| **jspdf + jspdf-autotable** | ^4.0.0 / ^5.0.7 | Exportação para PDF |
| **exceljs** | ^4.4.0 | Exportação para Excel |
| **pusher / pusher-js** | ^5.3.3 / ^8.5.0 | Notificações em tempo real |
| **@supabase/supabase-js** | ^2.90.1 | Cliente Supabase (uploads de armazenamento) |
| **react-day-picker** | ^9.13.0 | Seletor de datas |
| **use-debounce** | ^10.1.0 | Debounce de input |
| **tippy.js** | ^6.3.7 | Tooltips |

## Dependências de Desenvolvimento

| Pacote | Versão | Propósito |
|---|---|---|
| **Jest** | ^30.2.0 | Executor de testes unitários |
| **@testing-library/react** | ^16.3.2 | Testes de componentes React |
| **@testing-library/user-event** | ^14.6.1 | Simulação de interação do usuário |
| **@testing-library/jest-dom** | ^6.9.1 | Matchers para DOM |
| **ts-jest** | ^29.4.6 | Suporte TypeScript para Jest |
| **jest-mock-extended** | ^4.0.0 | Mocking estendido |
| **Playwright** | ^1.58.0 | Testes E2E |
| **ESLint** | ^9 | Linting |
| **eslint-config-next** | 16.1.1 | Regras de lint do Next.js |
| **PostCSS** | ^8.5.6 | Processamento CSS |
| **autoprefixer** | ^10.4.23 | Prefixos de vendor |
| **ts-node** | ^10.9.2 | Execução TypeScript (seeds) |
| **dotenv** | ^17.4.0 | Variáveis de ambiente |

## Arquivos de Configuração

| Arquivo | Propósito |
|---|---|
| `tsconfig.json` | Configuração do compilador TypeScript |
| `next.config.mjs` | Configuração Next.js + PWA |
| `tailwind.config.mjs` | Configuração de tema do Tailwind CSS v4 |
| `postcss.config.mjs` | Plugins PostCSS |
| `eslint.config.mjs` | Configuração flat do ESLint |
| `jest.config.js` | Configuração do executor de testes Jest |
| `playwright.config.ts` | Configuração E2E do Playwright |
| `prisma.config.ts` | Configuração CLI do Prisma (datasource de migração) |
| `components.json` | Configuração do Shadcn/UI |
| `.nvmrc` | Fixação de versão do Node |
| `.gitignore` | Regras de ignorar do Git |

## Variáveis de Ambiente (Esperadas)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Conexão Prisma (com pool) |
| `DIRECT_URL` | Migrações Prisma (direta, Supabase) |
| `AUTH_SECRET` | Assinatura JWT do NextAuth |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima do Supabase |
| `NEXT_PUBLIC_PUSHER_KEY` | Chave do app Pusher |
| `NEXT_PUBLIC_PUSHER_CLUSTER` | Região do cluster Pusher |
| `NEXT_PUBLIC_API_URL` | URL base da API legada (padrão: localhost:8080) |

## Scripts NPM

| Script | Comando |
|---|---|
| `dev` | `next dev --webpack` |
| `build` | `next build --webpack` |
| `start` | `next start` |
| `lint` | `eslint` |
| `test` | `jest` |
| `test:watch` | `jest --watch` |
| `postinstall` | `prisma generate` |
