---
artifact_type: context_dossier
summary: Dossiê de contexto arquitetural oficial e atualizado do ArchFlow ERP (Spring Boot 3 + React 19).
---

# 🧠 Dossiê de Contexto: ArchFlow ERP (Arquitetura Atual)

Este documento contém o estado consolidado, infraestrutura e padrões técnicos do repositório **ArchFlow ERP** pós-migração completa para Spring Boot 3 e React 19, servindo como a fonte oficial da verdade arquitetural.

---

## 🏛️ 1. Arquitetura do Sistema

O sistema é construído sobre uma arquitetura desacoplada, moderna e orientada a contratos rigorosos:

- **Backend (`backend/`):**
  - **Runtime & Framework:** Java 21 LTS, Spring Boot 3.4.3
  - **Segurança & RBAC:** Spring Security 6 com JWT (`JwtAuthenticationFilter`, `JwtService`) e papéis (`ADMIN`, `ARCHITECT`, `VIEWER`).
  - **Camada de Dados:** Spring Data JPA, Hibernate, PostgreSQL 16 (Docker, porta `5436`).
  - **Migrações de Banco:** Flyway versionado com 13 migrações aplicadas (`V1__...` até `V13__...`).
  - **Tempo Real:** Server-Sent Events (SSE) nativo via `SseEmitter` (`/api/v1/notifications/stream`).
  - **Tratamento de Exceções:** Padrão RFC 7807 (`ProblemDetail`) via `GlobalExceptionHandler`.
  - **Armazenamento:** Armazenamento isolado de arquivos técnicos multipart com proteção contra Directory Traversal.
  - **Qualidade & Blindagem:** 147 testes automatizados (JUnit 5, Mockito, MockMvc).

- **Frontend (`frontend/`):**
  - **Runtime & Build:** Node.js 20+, React 19, Vite, TypeScript 5.x.
  - **Roteamento:** TanStack Router com rotas estáticas e dinâmicas fortemente tipadas (`/dashboard`, `/clients`, `/projects`, `/inspections`, `/activities`, `/schedule`, `/documents`, `/reports`, `/settings`).
  - **Estilização & UI:** Tailwind CSS, Radix UI, Lucide React e Design System flexível com temas Claro, Escuro e Sistema, além de paletas dinâmicas ("Azul Ant Design" e "Verde Sálvia").
  - **Gráficos & Visualizações:** Recharts (LineChart financeiro, BarChart de etapas do Kanban).
  - **Gestão de Tarefas:** Drag-and-drop de pranchas arquitetônicas via `@hello-pangea/dnd`.
  - **Qualidade & Testes:** 79 testes automatizados em 19 suítes com Vitest e Testing Library.

---

## 📁 2. Estrutura de Módulos do Backend

```
backend/src/main/java/com/archflow/
├── core/
│   ├── config/              # Configurações globais (CORS, Jackson, Web)
│   ├── domain/              # BaseEntity com UUID, auditoria e soft-delete (deletedAt)
│   ├── exception/           # GlobalExceptionHandler (RFC 7807 ProblemDetail)
│   └── security/            # SecurityConfig, JwtService, JwtAuthenticationFilter
└── modules/
    ├── auth/                # Login, Registro, Me, RBAC, User & UserRepository
    ├── client/              # CRM de Clientes (PF/PJ, documentos, status, paginação)
    ├── project/             # Projetos, Colunas Kanban, Tarefas, DashboardMetrics
    ├── activity/            # Atividades do Arquiteto & Time Tracking faturável
    ├── inspection/          # Vistorias de Obra & Punch List (Itens e resolução)
    ├── storage/             # Upload multipart & Download seguro de arquivos técnicos
    └── notification/        # Server-Sent Events (SSE) & Notificações em lote
```

---

## 🗄️ 3. Modelo de Dados e Migrações Flyway

As tabelas do banco de dados são geridas pelo Flyway em `backend/src/main/resources/db/migration/`:
- `V1__create_users_table.sql`: Usuários, senhas com BCrypt, roles.
- `V2__create_clients_table.sql`: Clientes PF/PJ, contatos, categorias e status.
- `V3__create_projects_table.sql`: Projetos, áreas, tipologias, estilo e custos orçado/realizado.
- `V4__create_kanban_columns_table.sql`: Colunas do fluxo de entrega de pranchas.
- `V5__create_tasks_table.sql`: Tarefas do projeto associadas ao Kanban.
- `V6__create_activities_table.sql`: Atividades e agendamentos com time tracking.
- `V7__create_time_logs_table.sql`: Apontamentos de horas faturáveis e produtividade.
- `V8__create_site_inspections_table.sql`: Laudos e vistorias de campo.
- `V9__create_punch_list_items_table.sql`: Pendências e não-conformidades de obra.
- `V10__create_notifications_table.sql`: Central de notificações e leituras.
- `V11__seed_users.sql`, `V12__seed_demo_data.sql`, `V13__seed_kanban_columns.sql`: Carga de demonstração.

---

## 📏 4. Padrões de Implementação & Boas Práticas

1. **Exclusão Lógica Obrigatória (`Soft Delete`):** Entidades herdam de `BaseEntity`. Mutações de exclusão marcam `deletedAt = now()`. Métodos de consulta filtram `deletedAt == null`.
2. **Precisão Monetária:** Valores monetários (`plannedCost`, `actualCost`, `contractValue`) utilizam `BigDecimal` no backend e formatação monetária padrão BRL (`pt-BR`) no frontend.
3. **Respostas Padronizadas de Erro:** Todo erro HTTP do backend emite `ProblemDetail` com `status`, `title`, `detail` e timestamp.
4. **Comunicação Frontend-Backend:** Todas as chamadas HTTP utilizam clientes centralizados em `frontend/src/services/api.ts` com interceptor de JWT automático no cabeçalho `Authorization: Bearer <token>`.
5. **Garantia de Qualidade Pré-Commit:**
   - Backend: `mvn test` deve passar com 0 falhas (147 testes).
   - Frontend: `npm run test` deve passar com 0 falhas (79 testes).
   - Build: `npm run build` deve compilar sem nenhum erro de tipagem no TypeScript.
