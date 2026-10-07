# Varredura, Auditoria de Paridade e Blindagem QA: Fase 7 (Dashboards & Relatórios Financeiros) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 07: Dashboards & Relatórios Financeiros** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso (UC) e User Stories (US com Gherkin), implementando testes unitários e de integração no Backend para `DashboardMetricsController` (cálculo de métricas consolidadas, total orçado com BigDecimal, distribuição por fases e projetos recentes excluindo registros deletados), blindando as interfaces `DashboardView.tsx` e `ReportsView.tsx` com testes de renderização, KPIs, gráficos Recharts, filtros temporais e exportação, integrando a tipagem e chamada da API em `dashboardApi`, e gerando o dossiê em `docs/auditoria/07-dashboards-relatorios.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida agregações analíticas (`DashboardMetricsController`), unificando `ProjectRepository`, `ClientRepository`, `SiteInspectionRepository` e `TimeLogRepository` com proteção contra registros deletados logicamente (`deletedAt == null`) e cálculo de volume financeiro orçado via `BigDecimal`; no Frontend, blinda o dashboard executivo (`DashboardView`), navegação por cards de KPI, gráficos de evolução financeira e distribuição do Kanban via Recharts, listagem de projetos em destaque com navegação TanStack Router, e a visão analítica de relatórios (`ReportsView`) com seletor de período, margem líquida, badges de conformidade e botões de exportação.

**Tech Stack:** Java 21, Spring Boot 3.4.3, MockMvc, JUnit 5, Mockito, React 19, TypeScript, Recharts, TanStack Router, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 7

- **Documentação & Governança**:
  - Criar: `docs/auditoria/07-dashboards-relatorios.md` (Dossiê do Módulo 07)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/project/controller/DashboardMetricsController.java`
  - Criar Teste: `backend/src/test/java/com/archflow/modules/project/controller/DashboardMetricsControllerTest.java` (Testes de agregação de métricas, soft-delete filtering, cálculo financeiro e ordenação)
- **Frontend (React 19)**:
  - Modificar/Integrar: `frontend/src/services/api.ts` (Adicionar `dashboardApi.getMetrics`)
  - Validar: `frontend/src/views/DashboardView.tsx`
  - Validar: `frontend/src/views/ReportsView.tsx`
  - Criar Teste: `frontend/src/tests/dashboardApi.test.ts` (Testes de contrato e integração da API de dashboard)
  - Criar Teste: `frontend/src/tests/DashboardView.test.tsx` (Testes de interface, cards de KPI, gráficos Recharts e projetos em destaque)
  - Criar Teste: `frontend/src/tests/ReportsView.test.tsx` (Testes de relatórios financeiros, seletor de período, margens e ações de exportação)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 07

**Files:**
- Create: `docs/auditoria/07-dashboards-relatorios.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**
- [x] **Passo 2: Verificar a gravação do dossiê em `docs/auditoria/07-dashboards-relatorios.md`**

---

### Task 2: Implementação e Execução dos Testes Formais de Backend do Módulo Dashboard

**Files:**
- Create: `backend/src/test/java/com/archflow/modules/project/controller/DashboardMetricsControllerTest.java`

- [x] **Passo 1: Criar testes web e unitários para `DashboardMetricsControllerTest.java`**
- [x] **Passo 2: Executar os testes de Dashboard no Backend**
```bash
mvn -f backend/pom.xml test "-Dtest=DashboardMetricsControllerTest"
```
Esperado: testes passando com 0 falhas cobrindo agregação de métricas, cálculo orçamentário BigDecimal e filtro de soft delete.

---

### Task 3: Contrato de API e Testes de Interface no Frontend (`dashboardApi.test.ts`, `DashboardView.test.tsx`, `ReportsView.test.tsx`)

**Files:**
- Modify: `frontend/src/services/api.ts`
- Create: `frontend/src/tests/dashboardApi.test.ts`
- Create: `frontend/src/tests/DashboardView.test.tsx`
- Create: `frontend/src/tests/ReportsView.test.tsx`

- [x] **Passo 1: Adicionar `dashboardApi` em `frontend/src/services/api.ts`**
- [x] **Passo 2: Criar testes de contrato em `frontend/src/tests/dashboardApi.test.ts`**
- [x] **Passo 3: Criar testes de componente para `DashboardView.test.tsx`**
- [x] **Passo 4: Criar testes de componente para `ReportsView.test.tsx`**
- [x] **Passo 5: Executar os testes do Módulo 07 no Vitest**
```bash
npm run test --prefix frontend -- src/tests/dashboardApi.test.ts src/tests/DashboardView.test.tsx src/tests/ReportsView.test.tsx
```
Esperado: todos os testes passando com sucesso.

---

### Task 4: Consolidação do Dossiê do Módulo 07 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/07-dashboards-relatorios.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**
```bash
mvn -f backend/pom.xml test
npm run test --prefix frontend
npm run build --prefix frontend
```
- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/07-dashboards-relatorios.md` com status 100% CONCLUÍDO e métricas**
- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md` apontando o Módulo 08 (Notificações & Configurações) como próximo**
