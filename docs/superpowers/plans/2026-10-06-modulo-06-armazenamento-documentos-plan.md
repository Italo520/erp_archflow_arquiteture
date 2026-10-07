# Varredura, Auditoria de Paridade e Blindagem QA: Fase 6 (Armazenamento & Documentos) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 06: Armazenamento & Documentos** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso (UC) e User Stories (US com Gherkin), implementando testes unitários robustos no Backend para `StorageService` e `StorageController` (com validações de segurança contra Directory Traversal), blindando o componente de interface `DocumentsView.tsx`, e gerando o dossiê em `docs/auditoria/06-armazenamento-documentos.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida gestão de arquivos técnicos multipart (`StorageController`, `StorageService`), isolamento no diretório `.storage`, blindagem contra Directory Traversal via sanitização de path, mime types e headers de download RFC 6266; no Frontend, blinda a central de pranchas e arquivos técnicos (`DocumentsView`), filtragem por categorias arquitetônicas ("Plantas", "Modelagem 3D", "Contratos", "Vistorias", "Renders"), busca dinâmica e fluxo de upload.

**Tech Stack:** Java 21, Spring Boot 3.4.3, MockMvc, JUnit 5, Mockito, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 6

- **Documentação & Governança**:
  - Criar: `docs/auditoria/06-armazenamento-documentos.md` (Dossiê do Módulo 06)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/storage/StorageController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/storage/StorageService.java`
  - Criar Teste: `backend/src/test/java/com/archflow/modules/storage/StorageServiceTest.java` (Testes unitários de armazenamento, UUID e Directory Traversal)
  - Criar Teste: `backend/src/test/java/com/archflow/modules/storage/StorageControllerTest.java` (Testes de integração web para multipart upload e download)
- **Frontend (React 19)**:
  - Validar: `frontend/src/views/DocumentsView.tsx`
  - Criar Teste: `frontend/src/tests/DocumentsView.test.tsx` (Testes de interface, categorias, busca e upload)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 06

**Files:**
- Create: `docs/auditoria/06-armazenamento-documentos.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**
- [x] **Passo 2: Verificar a gravação do dossiê em `docs/auditoria/06-armazenamento-documentos.md`**

---

### Task 2: Implementação e Execução dos Testes Formais de Backend do Módulo Storage

**Files:**
- Create: `backend/src/test/java/com/archflow/modules/storage/StorageServiceTest.java`
- Create: `backend/src/test/java/com/archflow/modules/storage/StorageControllerTest.java`

- [x] **Passo 1: Criar testes unitários para `StorageServiceTest.java`**
- [x] **Passo 2: Criar testes web para `StorageControllerTest.java`**
- [x] **Passo 3: Executar os testes de Storage no Backend**
```bash
mvn -f backend/pom.xml test "-Dtest=StorageServiceTest,StorageControllerTest"
```
Esperado: testes passando com 0 falhas cobrindo upload multipart, download de recursos técnicos e blindagem Directory Traversal.

---

### Task 3: Testes de Interface e Componentes de Tela no Frontend (`DocumentsView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/DocumentsView.test.tsx`

- [x] **Passo 1: Escrever testes de componente para `DocumentsView.test.tsx`**
- [x] **Passo 2: Executar os testes de `DocumentsView.test.tsx` no Vitest**
```bash
npm run test --prefix frontend -- src/tests/DocumentsView.test.tsx
```
Esperado: 4 testes passando com sucesso.

---

### Task 4: Consolidação do Dossiê do Módulo 06 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/06-armazenamento-documentos.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**
```bash
mvn -f backend/pom.xml test
npm run test --prefix frontend
npm run build --prefix frontend
```
- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/06-armazenamento-documentos.md` com status 100% CONCLUÍDO e métricas**
- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md` apontando o Módulo 07 (Dashboards & Relatórios) como próximo**
