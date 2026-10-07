# Varredura, Auditoria de Paridade e Blindagem QA: Fase 4 (Atividades & Time Tracking) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 04: Atividades & Time Tracking** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso (UC) e User Stories (US com Gherkin), blindando a camada de API (`activityApi`) e os componentes de tela (`ActivitiesView.tsx` e `ScheduleView.tsx`), e gerando o dossiê em `docs/auditoria/04-atividades-timetracking.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida agendamentos de reuniões, visitas técnicas, revisões de projetos (`Activity`), controle de status (`SCHEDULED`, `COMPLETED`, `CANCELLED`), apontamentos de horas (`TimeLog`), cálculo de horas faturáveis/não faturáveis, métricas financeiras consolidadas (`TimeSummaryResponse`), soft delete e conformidade RFC 7807; no Frontend, blinda o quadro de atividades com filtros e busca (`ActivitiesView`), o cronograma de prazos (`ScheduleView`) e a integração HTTP (`activityApi`).

**Tech Stack:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Hibernate, JUnit 5, Mockito, MockMvc, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 4

- **Documentação & Governança**:
  - Criar: `docs/auditoria/04-atividades-timetracking.md` (Dossiê do Módulo 04)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/activity/controller/ActivityController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/activity/controller/TimeLogController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/activity/service/impl/ActivityServiceImpl.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/activity/service/ActivityServiceTest.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/activity/controller/ActivityControllerTest.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/activity/controller/TimeLogControllerTest.java`
- **Frontend (React 19)**:
  - Validar: `frontend/src/views/ActivitiesView.tsx`
  - Validar: `frontend/src/views/ScheduleView.tsx`
  - Validar: `frontend/src/services/api.ts` (`activityApi`)
  - Criar Teste: `frontend/src/tests/activityApi.test.ts` (Testes da camada de serviços HTTP de atividades e time tracking)
  - Criar Teste: `frontend/src/tests/ActivitiesView.test.tsx` (Testes de interface, filtros, busca e badges)
  - Criar Teste: `frontend/src/tests/ScheduleView.test.tsx` (Testes de cronograma, prazos e eventos)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 04

**Files:**
- Create: `docs/auditoria/04-atividades-timetracking.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**
- [x] **Passo 2: Verificar a gravação do dossiê em `docs/auditoria/04-atividades-timetracking.md`**

---

### Task 2: Verificação e Execução dos Testes Formais de Backend do Módulo Activity & Time Tracking

**Files:**
- Test: `backend/src/test/java/com/archflow/modules/activity/service/ActivityServiceTest.java`
- Test: `backend/src/test/java/com/archflow/modules/activity/controller/ActivityControllerTest.java`
- Test: `backend/src/test/java/com/archflow/modules/activity/controller/TimeLogControllerTest.java`

- [x] **Passo 1: Executar a suíte de testes de Activity e TimeLog no Backend**
```bash
mvn -f backend/pom.xml test "-Dtest=ActivityServiceTest,ActivityControllerTest,TimeLogControllerTest"
```
Esperado: 32 testes passando com 0 falhas cobrindo criação de atividade, transição de status, apontamento de horas, cálculo faturável e exclusão.

---

### Task 3: Testes Unitários da Camada de API de Atividades e Time Tracking (`activityApi.test.ts`)

**Files:**
- Create: `frontend/src/tests/activityApi.test.ts`

- [x] **Passo 1: Escrever testes unitários para a camada de serviços HTTP `activityApi`**
- [x] **Passo 2: Executar os testes de `activityApi.test.ts` no Vitest**
```bash
npm run test --prefix frontend -- src/tests/activityApi.test.ts
```
Esperado: 8 testes passando com sucesso.

---

### Task 4: Testes de Interface e Componentes de Tela (`ActivitiesView.test.tsx` e `ScheduleView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/ActivitiesView.test.tsx`
- Create: `frontend/src/tests/ScheduleView.test.tsx`

- [x] **Passo 1: Escrever testes de componente para `ActivitiesView.test.tsx`**
- [x] **Passo 2: Executar os testes de `ActivitiesView.test.tsx`**
```bash
npm run test --prefix frontend -- src/tests/ActivitiesView.test.tsx
```
- [x] **Passo 3: Escrever testes de componente para `ScheduleView.test.tsx`**
- [x] **Passo 4: Executar os testes de `ScheduleView.test.tsx`**
```bash
npm run test --prefix frontend -- src/tests/ScheduleView.test.tsx
```

---

### Task 5: Consolidação do Dossiê do Módulo 04 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/04-atividades-timetracking.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**
```bash
mvn -f backend/pom.xml test
npm run test --prefix frontend
npm run build --prefix frontend
```
- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/04-atividades-timetracking.md` com status 100% CONCLUÍDO e métricas**
- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md` apontando o Módulo 05 (Vistorias & Punch List) como próximo**
