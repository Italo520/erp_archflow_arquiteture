---
artifact_type: context_dossier
summary: Dossiê de contexto arquitetural para o agente Jules executar as tarefas do ArchFlow ERP via DAG.
---

# 🧠 Dossiê de Contexto: ArchFlow ERP (Projeto em Andamento)

Este documento contém o estado atual, padrões e infraestrutura do repositório para o agente **Jules** (Senior Fullstack) seguir rigorosamente durante a execução das tarefas via DAG.

## 🏗️ Arquitetura de Referência
- **Frontend**: Next.js 14+ (App Router), Tailwind CSS.
- **Backend**: Server Actions (`app/actions`, `actions`).
- **Data**: Prisma ORM (Postgres), Schema em `prisma/schema.prisma`.
- **Auth**: NextAuth.js v5 (beta) em `auth.ts`, `auth.config.ts`.
- **Validation**: Zod em `lib/validations.ts`.
- **Components**: UI via `lucide-react`, `radix-ui` (shadcn pattern).

## 📄 Schema Prisma (Principais Modelos)
- `User`: RBAC com roles (`OWNER`, `EDITOR`, `VIEWER`).
- `Client`: Campos de endereço em JSON, categoria (`RESIDENTIAL`, etc), status.
- `Project`: Campos arquitetônicos (Estilo, Áreas, Fases do projeto via JSON).
- `Task`: Kanban, prioridades, checklist em JSON.
- `TimeLog`: Mapeamento de horas reais vs planejadas.

## 📏 Padrões de Implementação (MANTENHA ESTES)
1. **Server Actions Únicas**: Toda mutação no banco DEVE ser via Server Action assíncrona.
2. **Validação Rigorosa**: Use Zod `lib/validations.ts` em TODA Server Action e `ClientSide` Form.
3. **Tratamento de Erros**: Use o padrão `Sonner` (Toasts) para feedback visual no frontend.
4. **Isolamento de Git**: Trabalhe na branch criada pelo orquestrador (`feature/ag-ID`).
5. **RBAC**: Sempre valide a permissão do usuário (`auth.ts` / `lib/permissions.ts`) antes de executar mutações sensíveis.

## 🖇️ Mapeamento de Arquivos Locais
- **Ações**: `app/actions` e `actions/`
- **Componentes**: `components/` (organizados por domínio: `projects`, `clients`, `kanban`)
- **Utilitários**: `lib/utils.js`, `lib/prisma.ts`, `lib/validations.ts`
- **Testes**: `tests/unit`, `tests/integration`, `tests/e2e` (Playwright)

---

## 🔴 NOTA PARA O AGENTE
> Ao iniciar qualquer tarefa, primeiro verifique se os arquivos alvo já possuem conteúdo e nunca ignore definições pré-existentes do Prisma ou validações do Zod. O objetivo é COMPLEMENTAR a arquitetura, não substituí-la.
