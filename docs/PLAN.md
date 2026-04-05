---
artifact_type: implementation_plan
summary: Plano de orquestração para execução da arquitetura do ArchFlow ERP via DAG, integrando contexto do repositório remoto.
---

# 🎼 Plano de Orquestração: Projeto ArchFlow ERP

Este plano detalha a estratégia para passar o contexto do repositório existente para o agente "Jules" e executar as tarefas pendentes via DAG.

## 👥 Agentes Envolvidos (Mínimo 3)
1. **Explorer Agent**: Mapeamento da base de código legada e identificação de padrões. (Já realizado)
2. **Project Planner**: Decomposição de tarefas e criação deste plano. (Em progresso)
3. **Senior Fullstack (Jules)**: Executor das tarefas via motor de DAG.
4. **Security Auditor**: Validação de RBAC e middleware de autenticação.
5. **Backend Specialist**: Refinamento de Server Actions e integrações Prisma.

---

## 📅 Fase 1: Preparação de Contexto (ATUAL)

### 1.1 Consolidação de Conhecimento
- **Tecnologias**: Next.js 14 (App Router), Prisma (Postgres), NextAuth, Tailwind.
- **Entidades**: User, Client, Project, Stage, Task, TimeLog, AuditLog.
- **Padrões**: Server Actions em `app/actions`, componentes em `components/`, validações em `lib/validations.ts`.
- **Status**: O repositório já possui o Schema Prisma completo e estrutura básica de diretórios.

### 1.2 Criação do Dossiê de Contexto
Gerar o arquivo `docs/CONTEXT.md` que servirá de "memória de longo prazo" para cada sessão iniciada pelo Jules.

---

## 🚀 Fase 2: Execução das Tarefas via DAG

As tarefas serão executadas conforme o arquivo `dag_tasks.json`, respeitando as dependências:

| ID Tarefa | Descrição Resumida | Dependência |
|-----------|--------------------|-------------|
| `auth_01` | RBAC & Middleware | - |
| `schema_01`| Validações Zod | - |
| `api_01` | CRUD Clientes | `schema_01`, `auth_01` |
| `ui_01` | Integração UI Clientes | `api_01` |
| `api_02` | CRUD Projetos | `schema_01`, `auth_01` |
| ... | ... | ... |

### Estratégia de Contexto para "Jules":
O motor de DAG (`.agent/skills/dag-orchestrator/index.ts`) será configurado para injetar o conteúdo de `docs/CONTEXT.md` em cada prompt de tarefa, garantindo que o agente saiba:
1. Onde os arquivos já existem.
2. Quais os nomes das tabelas e enums do Prisma.
3. Como os erros são tratados (padrão Sonner/Toast).

---

## ✅ Critérios de Aceite e Verificação

### Testes Automáticos
- Executar `npx playwright test` para validar fluxos E2E após cada merge crítico.
- Rodar `npx prisma validate` a cada alteração de schema.

### Segurança
- Auditoria manual de `lib/permissions.ts` para garantir que o RBAC não tenha furos.

---

## ⏸️ Aguardando Aprovação
✅ Plano criado: `docs/PLAN.md`

Você aprova este plano para prosseguirmos com a criação do `docs/CONTEXT.md` e o início do `/run-dag`?
