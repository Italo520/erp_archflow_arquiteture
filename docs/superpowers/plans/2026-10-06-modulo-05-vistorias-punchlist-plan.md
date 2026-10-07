# Varredura, Auditoria de Paridade e Blindagem QA: Fase 5 (Vistorias de Obra & Punch List) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 05: Vistorias de Obra & Punch List** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso (UC) e User Stories (US com Gherkin), blindando a camada de API (`inspectionApi`) e o componente de tela (`InspectionsView.tsx`), e gerando o dossiê em `docs/auditoria/05-vistorias-punchlist.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida relatórios de inspeção técnica (`SiteInspection`), ciclo de vida (`DRAFT`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), controle de apontamentos de defeito/punch list (`PunchListItem`), severidades (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), ciclo de resolução (`OPEN`, `RESOLVED`, `VERIFIED`), notas de resolução, fotos, soft delete e respostas RFC 7807; no Frontend, blinda a interface com painel duplo de vistorias e itens pendentes (`InspectionsView`), modais de criação e apontamentos, e integração HTTP via `inspectionApi`.

**Tech Stack:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Hibernate, JUnit 5, Mockito, MockMvc, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 5

- **Documentação & Governança**:
  - Criar: `docs/auditoria/05-vistorias-punchlist.md` (Dossiê do Módulo 05)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/inspection/controller/InspectionController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/inspection/service/impl/InspectionServiceImpl.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/inspection/service/InspectionServiceTest.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/inspection/controller/InspectionControllerTest.java`
- **Frontend (React 19)**:
  - Validar: `frontend/src/views/InspectionsView.tsx`
  - Validar: `frontend/src/services/api.ts` (`inspectionApi`)
  - Criar Teste: `frontend/src/tests/inspectionApi.test.ts` (Testes da camada de serviços HTTP de vistorias e punch list)
  - Criar Teste: `frontend/src/tests/InspectionsView.test.tsx` (Testes de interface, listagem, seleção de vistoria, modais e resolução de pendências)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 05

**Files:**
- Create: `docs/auditoria/05-vistorias-punchlist.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**
- [x] **Passo 2: Verificar a gravação do dossiê em `docs/auditoria/05-vistorias-punchlist.md`**

---

### Task 2: Verificação e Execução dos Testes Formais de Backend do Módulo Inspection

**Files:**
- Test: `backend/src/test/java/com/archflow/modules/inspection/service/InspectionServiceTest.java`
- Test: `backend/src/test/java/com/archflow/modules/inspection/controller/InspectionControllerTest.java`

- [x] **Passo 1: Executar a suíte de testes de Inspection no Backend**
```bash
mvn -f backend/pom.xml test "-Dtest=InspectionServiceTest,InspectionControllerTest"
```
Esperado: 20 testes passando com 0 falhas cobrindo criação de vistoria, ciclo de vida de itens de punch list, resolução e soft delete.

---

### Task 3: Testes Unitários da Camada de API de Vistorias e Punch List (`inspectionApi.test.ts`)

**Files:**
- Create: `frontend/src/tests/inspectionApi.test.ts`

- [x] **Passo 1: Escrever testes unitários para a camada de serviços HTTP `inspectionApi`**
- [x] **Passo 2: Executar os testes de `inspectionApi.test.ts` no Vitest**
```bash
npm run test --prefix frontend -- src/tests/inspectionApi.test.ts
```
Esperado: 7 testes passando com sucesso.

---

### Task 4: Testes de Interface e Componentes de Tela (`InspectionsView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/InspectionsView.test.tsx`

- [x] **Passo 1: Escrever testes de componente para `InspectionsView.test.tsx`**
- [x] **Passo 2: Executar os testes de `InspectionsView.test.tsx`**
```bash
npm run test --prefix frontend -- src/tests/InspectionsView.test.tsx
```

---

### Task 5: Consolidação do Dossiê do Módulo 05 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/05-vistorias-punchlist.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**
```bash
mvn -f backend/pom.xml test
npm run test --prefix frontend
npm run build --prefix frontend
```
- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/05-vistorias-punchlist.md` com status 100% CONCLUÍDO e métricas**
- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md` apontando o Módulo 06 (Armazenamento & Documentos) como próximo**
