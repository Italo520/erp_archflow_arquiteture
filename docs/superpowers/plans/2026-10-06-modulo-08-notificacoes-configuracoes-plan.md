# Varredura, Auditoria de Paridade e Blindagem QA: Fase 8 (Notificações & Configurações) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 08: Notificações & Configurações** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso (UC) e User Stories (US com Gherkin), implementando testes unitários e de integração no Backend para `NotificationController` (streaming SSE Server-Sent Events, listagem de eventos, leitura individual e leitura em lote), blindando os componentes de interface `NotificationBell.tsx` e `SettingsView.tsx` (popover de alertas em tempo real, contagem unread, alternância de temas Claro/Escuro/Sistema, paletas Ant Design e Verde Sálvia, e preferências operacionais), e gerando o dossiê em `docs/auditoria/08-notificacoes-configuracoes.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida gestão reativa de eventos via SSE (`NotificationController`), controle de emissores por usuário (`ConcurrentHashMap<String, List<SseEmitter>>`), persistência e consulta indexada (`NotificationRepository`); no Frontend, blinda a central de notificações (`NotificationBell`), contagem reativa e atualização otimista de status lido/não lido, e a tela de preferências globais (`SettingsView`), integrando `ThemeContext` (dark mode, light mode, system, paletas customizadas) e formulários operacionais.

**Tech Stack:** Java 21, Spring Boot 3.4.3, SseEmitter, MockMvc, JUnit 5, Mockito, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 8

- **Documentação & Governança**:
  - Criar: `docs/auditoria/08-notificacoes-configuracoes.md` (Dossiê do Módulo 08)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/notification/controller/NotificationController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/notification/entity/Notification.java`
  - Validar: `backend/src/main/java/com/archflow/modules/notification/repository/NotificationRepository.java`
  - Criar Teste: `backend/src/test/java/com/archflow/modules/notification/controller/NotificationControllerTest.java` (Testes web de SSE, listagem, patch de leitura e lote)
- **Frontend (React 19)**:
  - Validar: `frontend/src/components/layout/NotificationBell.tsx`
  - Validar: `frontend/src/views/SettingsView.tsx`
  - Criar Teste: `frontend/src/tests/NotificationBell.test.tsx` (Testes de dropdown, badge de não lidas, marcar como lida e marcar todas)
  - Criar Teste: `frontend/src/tests/SettingsView.test.tsx` (Testes de alternância de tema, paleta, campos cadastrais e checkboxes)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 08

**Files:**
- Create: `docs/auditoria/08-notificacoes-configuracoes.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**
- [x] **Passo 2: Verificar a gravação do dossiê em `docs/auditoria/08-notificacoes-configuracoes.md`**

---

### Task 2: Implementação e Execução dos Testes Formais de Backend do Módulo Notificações

**Files:**
- Create: `backend/src/test/java/com/archflow/modules/notification/controller/NotificationControllerTest.java`

- [x] **Passo 1: Criar testes web para `NotificationControllerTest.java`**
- [x] **Passo 2: Executar os testes de Notificação no Backend**
```bash
mvn -f backend/pom.xml test "-Dtest=NotificationControllerTest"
```
Esperado: testes passando com 0 falhas cobrindo SSE streaming, listagem ordenada, patch individual e marcação em lote.

---

### Task 3: Testes de Interface e Componentes no Frontend (`NotificationBell.test.tsx`, `SettingsView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/NotificationBell.test.tsx`
- Create: `frontend/src/tests/SettingsView.test.tsx`

- [x] **Passo 1: Criar testes de componente para `NotificationBell.test.tsx`**
- [x] **Passo 2: Criar testes de componente para `SettingsView.test.tsx`**
- [x] **Passo 3: Executar os testes do Módulo 08 no Vitest**
```bash
npm run test --prefix frontend -- src/tests/NotificationBell.test.tsx src/tests/SettingsView.test.tsx
```
Esperado: todos os testes passando com sucesso.

---

### Task 4: Consolidação do Dossiê do Módulo 08, Suíte Integrada e Encerramento da Varredura no GSD

**Files:**
- Modify: `docs/auditoria/08-notificacoes-configuracoes.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**
```bash
mvn -f backend/pom.xml test
npm run test --prefix frontend
npm run build --prefix frontend
```
- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/08-notificacoes-configuracoes.md` com status 100% CONCLUÍDO e métricas**
- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md` marcando 100% das 8 Fatias Verticais do ERP Concluídas e Blindadas**
