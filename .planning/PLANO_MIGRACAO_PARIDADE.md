# Plano de Execução: Migração e Paridade Total do ArchFlow ERP

## 1. Abordagem Geral
Consolidar a migração do legado (Next.js 15 + Prisma) para a nova arquitetura (React 19 + Vite + TanStack Router/Query no frontend; Spring Boot 3.4 + Java 21 + PostgreSQL Flyway no backend), eliminando todas as divergências levantadas em [`.planning/ANALISE_DIVERGENCIAS.md`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/.planning/ANALISE_DIVERGENCIAS.md). O plano adota um design system híbrido (variáveis HSL do legado + temas selecionáveis Azul e Sálvia), roteamento com URLs reais tipadas, Kanban com `@dnd-kit` e botões de acessibilidade, SSE para tempo real e paridade funcional 1:1.

---

## 2. Escopo do Projeto

### No Escopo (In)
- **Design System & Temas**: Suporte a modo claro/escuro nativo com variáveis HSL, alternância de paleta (Legado Ant Design Blue `#1677ff` e Verde Sálvia `#CDD5C6`), tipografia e tokens shadcn/ui.
- **Responsividade & Layout**: Sidebar retrátil (`w-64` para `w-20`), drawer mobile com overlay e menu hamburger, header unificado com breadcrumbs, busca e notificações.
- **Roteamento & Estado**: TanStack Router para navegação tipada (`/projects/:id?tab=...`), TanStack Query para cache e revalidação de dados, e Context/Zustand para estado local.
- **Kanban Interativo**: Migração do `@dnd-kit` com drag-and-drop suave entre colunas, reordenação de cards e fallback com botões manuais de navegação.
- **Backend Completo**: Tabelas e migrações Flyway V7+ para `Deliverable`, `ProjectMember`, `Budget`/`Estimate`, `Notification` e `AuditLog`; endpoints REST correspondentes e SSE nativo.
- **Página de Detalhes do Projeto**: Rota dedicada `/projects/:id` com as 10 abas ativas e sincronizadas via URL.
- **Módulos Faltantes**: Documentos com upload/download em disco (`DiskStorageService`), Relatórios com métricas e exportação, Agenda/Cronograma, Configurações de sistema e perfil.
- **Massa de Dados Coerente**: Seed rica no Flyway/Runner garantindo projetos em todas as fases, entregáveis, vistorias e orçamentos preenchidos.

### Fora do Escopo (Out)
- Dependência de serviços externos pagos de WebSocket (substituído por Server-Sent Events nativo do Spring Boot).
- Multi-tenancy isolado por schema de banco de dados (mantém multi-tenancy a nível de linha/organização atual).

---

## 3. Fases e Checklist de Ações

### Fase 1: Fundação UI, Design System Híbrido, Roteamento e Layout Responsivo
- [x] **Configurar Tokens CSS e Tailwind**: Portadas variáveis HSL de [`app/globals.css`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/app/globals.css) e estendido [`frontend/tailwind.config.js`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/tailwind.config.js) com suporte a `.dark`, `.theme-blue` e `.theme-sage`.
- [x] **Implementar ThemeProvider e ModeToggle**: Criado contexto de tema em [`frontend/src/context/ThemeContext.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/context/ThemeContext.tsx) e [`frontend/src/components/ui/ModeToggle.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/ui/ModeToggle.tsx) suportando claro/escuro e alternância dinâmica entre Azul e Sálvia.
- [x] **Instalar e Configurar TanStack Router & Query**: Configurado `@tanstack/react-router` e `@tanstack/react-query` em [`frontend/src/router.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/router.tsx) e [`frontend/src/App.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/App.tsx).
- [x] **Refatorar Shell e Layout Responsivo**: Criado [`frontend/src/components/layout/AppLayout.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/layout/AppLayout.tsx):
  - Sidebar colapsável desktop (`w-64` <-> `w-20` com tooltips e transição suave).
  - Drawer mobile deslizante com overlay escuro e botão de fechamento.
  - Header responsivo com hamburger button, indicador de rota, busca global, sino de notificações e seletor de tema/paleta.
- [x] **Componentes Base Reutilizáveis (UI Kit)**: Portados componentes shadcn em `frontend/src/components/ui/`: `Button`, `Input`, `Badge`, `Card`, `Dialog`, `Tabs`, `Skeleton`, `Separator`.

---

### Fase 2: Backend Parity & Expansão de Domínio (Spring Boot + Flyway)
- [x] **Criar Migração Flyway V7 (Entidades Centrais de Projeto)**:
  - Tabela `project_members` (papéis, taxas horárias, permissões).
  - Tabela `deliverables` (fases, status, arquivos anexos, prazos).
  - Tabelas `budgets` e `estimates` (orçamentos, custos previstos vs realizados).
- [x] **Criar Migração Flyway V8 (Notificações e Auditoria)**:
  - Tabela `notifications` e preferências do usuário.
  - Tabela `audit_logs` (rastreabilidade de ações em projetos e clientes).
- [x] **Implementar Entidades JPA, DTOs e Repositories**:
  - `Deliverable` + `DeliverableRepository`
  - `ProjectMember` + `ProjectMemberRepository`
  - `Budget` + `BudgetRepository`
  - `Notification` + `NotificationRepository`
- [x] **Implementar Services e Controllers REST**:
  - `DeliverableController` (CRUD de entregáveis, alteração de status).
  - `ProjectMemberController` (adicionar/remover membros do projeto).
  - `BudgetController` (gestão financeira e itens de custo).
  - `DashboardMetricsController` (cálculo agregado real: total de projetos ativos, clientes, vistorias, faturamento e distribuição por fase).
- [x] **Implementar Storage Service no Backend**:
  - `StorageService` e `StorageController` gravando em `.storage/` para upload seguro de fotos e pranchas (`/api/v1/storage/upload` e `/api/v1/storage/download/{key}`).
- [x] **Implementar Notificações via Server-Sent Events (SSE)**:
  - Endpoint `/api/v1/notifications/stream` e emissor `SseEmitter` nativo no Spring Boot.

---

### Fase 3: Dashboard & Projetos em Paridade Total
- [x] **Dashboard com Métricas Agregadas e Gráficos**:
  - Cards de métricas com shadcn/ui Card e tema dinâmico.
  - Gráficos Recharts (Evolução Financeira em Linhas + Distribuição por Fases em Barras coloridas).
  - Lista de projetos em destaque com navegação para a rota de 10 abas.
- [x] **Quadro Kanban com `@dnd-kit` e Acessibilidade**:
  - Suíte `@dnd-kit/core` e `@dnd-kit/sortable` implementada em [`frontend/src/views/ProjectsKanbanView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ProjectsKanbanView.tsx).
  - Drag-and-drop suave entre colunas (`CONCEPTUAL`, `PRELIMINARY`, `EXECUTIVE`, `CONSTRUCTION`, `COMPLETED`).
  - Atualização otimista sincronizada com a API do backend.
  - Botões manuais de seta (`Anterior` e `Próximo`) nos cards para acessibilidade/mobile.
- [x] **Tela de Detalhes do Projeto (`/projects/:id`) com 10 Abas**:
  - Implementada em [`frontend/src/views/ProjectDetailView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ProjectDetailView.tsx) com as 10 abas ativas e sincronizadas via URL (`?tab=...`):
    1. *Visão Geral*: Descrição, dados contratuais, especificações arquitetônicas e custos.
    2. *Fases e Tarefas*: Checklist com sub-tarefas e status.
    3. *Entregáveis*: Gestão de documentos de entrega e aprovação formal.
    4. *Equipe*: Alocação de profissionais, papéis e taxas horárias.
    5. *Financeiro*: Orçamento previsto vs realizado, itens de despesa.
    6. *Apontamento de Horas*: Histórico de `TimeLog` por data e usuário.
    7. *Vistorias*: Histórico de vistorias técnicas vinculadas.
    8. *Documentos*: Pranchas e arquivos técnicos anexados.
    9. *Auditoria / Histórico*: Linha do tempo de todas as alterações ocorridas.

---

### Fase 4: Telas e Módulos Faltantes
- [x] **Módulo de Documentos (`/documents`)**:
  - [`frontend/src/views/DocumentsView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/DocumentsView.tsx) com catálogo de arquivos técnicos, filtros por categoria (Plantas, Modelagem 3D, Contratos, Vistorias, Renders), upload e download.
- [x] **Módulo de Agenda e Cronograma (`/schedule`)**:
  - [`frontend/src/views/ScheduleView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ScheduleView.tsx) com visualização em grade mensal de prazos, entregas executivas e vistorias agendadas.
- [x] **Módulo de Relatórios (`/reports`)**:
  - [`frontend/src/views/ReportsView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ReportsView.tsx) com KPIs gerenciais, detalhamento financeiro por contrato e opções de exportação CSV/PDF.
- [x] **Módulo de Configurações (`/settings`)**:
  - [`frontend/src/views/SettingsView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/SettingsView.tsx) com seletor de modo (Claro / Escuro / Sistema), paleta (Azul Legado / Verde Sálvia), dados do escritório e regras de notificações.
- [x] **Módulo de Atividades (`/activities`)**:
  - [`frontend/src/views/ActivitiesView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ActivitiesView.tsx) com quadro de tarefas, filtros de status e apontamento.

---

### Fase 5: Massa de Dados Coerente, Testes Automatizados e Auditoria de Qualidade
- [x] **Seed Flyway V9 (Dados Avançados)**:
  - Inseridos membros alocados em projetos (`project_members`), entregáveis em status Draft/In Review/Approved (`deliverables`), orçamentos com detalhamento de custos (`budgets`), notificações ativas (`notifications`) e logs de auditoria (`audit_logs`).
- [x] **Validação e Build do Frontend**:
  - Compilado com `npm run build` e verificado via `npx tsc --noEmit` (0 erros TypeScript).
- [x] **Validação e Build do Backend**:
  - Compilado e empacotado com `mvn clean package -DskipTests` gerando `archflow-backend-1.0.0-SNAPSHOT.jar` com 111 classes compiladas com sucesso.

---

### Fase 6: Refinamentos Finais & Remoção do Módulo de Horas (Concluída)
- [x] **Remoção Completa do Módulo de Controle de Horas**:
  - Removido do menu lateral desktop e do drawer mobile em [`AppLayout.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/layout/AppLayout.tsx).
  - Removida rota `/time-tracking` e arquivo `TimeTrackingView.tsx`.
  - Substituído card do Dashboard por "Atividades & Prazos" e botão superior por "Nova Atividade" em [`DashboardView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/DashboardView.tsx).
  - Removida aba de horas dos detalhes do projeto em [`ProjectDetailView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ProjectDetailView.tsx).
- [x] **Preservação Integral dos Logs de Auditoria**:
  - Rastreabilidade de horas e datas exatas mantida com tipo de ação, autor e timestamps (`audit_logs`) em [`AuditTab.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/projects/tabs/AuditTab.tsx).
- [x] **Modularização Atômica das Abas de Projetos**:
  - 8 abas extraídas para componentes dedicados em [`frontend/src/components/projects/tabs/`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/projects/tabs/) (`OverviewTab`, `TasksTab`, `DeliverablesTab`, `TeamTab`, `FinancialTab`, `InspectionsTab`, `DocumentsTab`, `AuditTab`).
- [x] **Formulário Completo de PJ & Endereço em Clientes**:
  - Toggle PF/PJ com campos condicionais (Nome Fantasia, Razão Social, CNPJ com máscara, Inscrição Estadual e Endereço) em [`ClientsView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ClientsView.tsx).
- [x] **Busca Global Interativa com Dropdown & Atalho de Teclado**:
  - Componente [`GlobalSearch.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/components/layout/GlobalSearch.tsx) com `Ctrl+K` / `Cmd+K`, resultados categorizados e navegação direta.
- [x] **Criação de Colunas Customizadas no Kanban**:
  - Botão e modal "Nova Coluna" com seletor de cor e persistência no [`ProjectsKanbanView.tsx`](file:///c:/Users/italo/Desktop/Projects/erp_archflow_arquiteture/frontend/src/views/ProjectsKanbanView.tsx).
- [x] **Compilação Validada**: Frontend (`tsc && vite build`) e Backend (`mvn compile`) executados com sucesso (código de saída 0).

<!-- GOAL_COMPLETE -->
