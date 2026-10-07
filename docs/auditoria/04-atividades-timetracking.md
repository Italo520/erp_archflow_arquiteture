# ⏱️ Dossiê de Auditoria e QA: Módulo 04 — Atividades & Time Tracking

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/activity` (Backend) & `views/ActivitiesView` / `views/ScheduleView` / `services/api.ts (activityApi)` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Data JPA, Hibernate, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library

---

## 1. Casos de Uso (Use Cases)

### UC-01: Agendamento de Atividade Técnica Arquitetônica
- **Atores**: Arquiteto / Coordenador de Projetos.
- **Pré-condições**: Usuário autenticado. Caso vinculado a cliente ou projeto, essas entidades devem existir no sistema.
- **Fluxo Principal**:
  1. O usuário fornece Tipo de Atividade (`MEETING`, `SITE_VISIT`, `DESIGN`, `REVISION`, `APPROVAL`, etc.), Título, Data/Hora de Início (`startTime`), Data/Hora de Fim (`endTime`), Duração em Horas, Localização e Vínculos (`projectId`, `clientId`).
  2. O backend valida a existência e integridade do cliente e projeto referenciados.
  3. Define o status inicial como `SCHEDULED` (Agendado).
  4. Persiste a atividade no banco de dados e retorna HTTP 201 Created.
- **Fluxo de Exceção (Data de Fim Anterior ao Início - Boundary Value / ECP Inválido)**:
  1. Se `endTime` for anterior a `startTime`, o sistema rejeita com HTTP 400 Bad Request e mensagem RFC 7807 descritiva.

---

### UC-02: Transição de Ciclo de Vida da Atividade
- **Atores**: Arquiteto / Membro da Equipe.
- **Pré-condições**: Atividade existente com status `SCHEDULED`.
- **Fluxo Principal**:
  1. O usuário aciona `PATCH /api/v1/activities/{id}/status` informando o novo status (`COMPLETED` ou `CANCELLED`).
  2. O backend valida a transição de estado.
  3. Atualiza o status e persiste o timestamp de modificação.
  4. Retorna HTTP 200 OK com o payload da atividade atualizado.

---

### UC-03: Apontamento de Horas de Trabalho (Time Tracking)
- **Atores**: Colaborador / Arquiteto / Estagiário.
- **Pré-condições**: Projeto ativo cadastrado no sistema.
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/time-logs` com `duration` (horas dedicadas), `category` (`DESIGN`, `REVIEW`, `MEETING`, `ADMIN`, etc.), `logDate`, indicador faturável (`billable = true/false`), taxa horária (`billRate`) e `projectId`.
  2. O backend valida se a duração é maior que zero e se o projeto existe.
  3. Atribui o `userId` autenticado ao apontamento.
  4. Persiste o registro de tempo e retorna HTTP 201 Created.
- **Fluxo de Exceção (Duração Negativa ou Nula - Boundary Value Analysis)**:
  1. Se a duração for $\le 0$, a validação `@Positive` rejeita a requisição com HTTP 400 Bad Request.

---

### UC-04: Consolidação de Horas e Rentabilidade do Projeto
- **Atores**: Gestor do Escritório / Diretor Financeiro.
- **Pré-condições**: Projeto com apontamentos de horas.
- **Fluxo Principal**:
  1. O usuário consulta `GET /api/v1/time-logs/summary/{projectId}`.
  2. O backend agrega a soma de horas totais, horas faturáveis, horas não faturáveis e calcula o montante financeiro total faturável (`sum(duration * billRate)`).
  3. Retorna HTTP 200 OK com a DTO consolidada (`TimeSummaryResponse`).

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Agendamento de Visita Técnica e Reunião
> **Como** coordenador de projetos arquitetônicos  
> **Quero** agendar visitas técnicas à obra e reuniões com clientes  
> **Para que** a equipe mantenha a agenda de campo sincronizada e sem conflitos

- **Cenário 1 (Agendamento Válido - ECP Válido)**:
  - **Dado** que informo o tipo `SITE_VISIT`, título "Vistoria Estrutural", data de início "2026-10-18T09:00:00" e projeto válido "proj-001"
  - **Quando** envio a requisição para `POST /api/v1/activities`
  - **Então** a atividade é registrada com status `SCHEDULED`
  - **E** retorna HTTP 201 Created com os dados da atividade.

- **Cenário 2 (Período Temporal Inválido - Boundary Value)**:
  - **Dado** que informo `startTime` "2026-10-18T14:00:00" e `endTime` "2026-10-18T10:00:00"
  - **Quando** submeto o cadastro
  - **Então** o sistema rejeita com HTTP 400 Bad Request
  - **E** informa que a data final deve ser posterior à data inicial.

---

### US-02: Apontamento de Horas com Cálculo Faturável
> **Como** arquiteto de projeto  
> **Quero** apontar as horas dedicadas ao desenvolvimento de um projeto  
> **Para que** o escritório calcule a rentabilidade real e emita a cobrança correta ao cliente

- **Cenário 1 (Apontamento Faturável - ECP Válido)**:
  - **Dado** que registrei 4.5 horas na categoria `DESIGN` com taxa de R$ 150,00/h no projeto "proj-001"
  - **Quando** submeto `POST /api/v1/time-logs`
  - **Então** o apontamento é salvo com `billable = true`
  - **E** a consulta do resumo consolidado do projeto totaliza o valor correspondente.

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-ACT-01** | `ActivityService.createActivity` | ECP / Fluxo Válido | Backend (Unit/Mock) | ✅ Verde (5/5) |
| **TC-ACT-02** | `ActivityService.createActivity` | Boundary Value (Início > Fim) | Backend (Unit/Mock) | ✅ Verde |
| **TC-ACT-03** | `ActivityService.updateActivityStatus` | Transição de Estados (`SCHEDULED` -> `COMPLETED`) | Backend (Unit/Mock) | ✅ Verde (7/7) |
| **TC-ACT-04** | `ActivityService.logTime` | ECP Válido (Horas faturáveis) | Backend (Unit/Mock) | ✅ Verde (11/11) |
| **TC-ACT-05** | `ActivityService.getProjectTimeSummary` | Tabela de Decisão / Cálculo financeiro | Backend (Unit/Mock) | ✅ Verde |
| **TC-ACT-06** | `activityApi.listActivities / create / update` | ECP / Chamadas HTTP REST | Frontend (Vitest) | ✅ Verde (8/8) |
| **TC-ACT-07** | `activityApi.logTime / summary` | ECP / Time Tracking HTTP | Frontend (Vitest) | ✅ Verde |
| **TC-ACT-08** | `ActivitiesView` | ECP (Renderização e tabela de tarefas) | Frontend (Testing Library) | ✅ Verde (3/3) |
| **TC-ACT-09** | `ActivitiesView` | Transição de Estados (Filtros por status) | Frontend (Testing Library) | ✅ Verde |
| **TC-ACT-10** | `ScheduleView` | ECP (Marcos, entregas e vistorias) | Frontend (Testing Library) | ✅ Verde (3/3) |

---

## 4. Métricas de Execução e Cobertura

- **Backend (`mvn test`)**:
  - `ActivityServiceTest`: 23/23 testes verdes.
  - `ActivityControllerTest`: 5/5 testes verdes.
  - `TimeLogControllerTest`: 4/4 testes verdes.
  - Total Módulo Activity & Time Tracking: 32 testes unitários e de integração web.
  - Total Suíte Backend Geral: 132/132 testes verdes (0 falhas).
- **Frontend (`npm run test`)**:
  - `activityApi.test.ts`: 8/8 testes verdes.
  - `ActivitiesView.test.tsx`: 3/3 testes verdes.
  - `ScheduleView.test.tsx`: 3/3 testes verdes.
  - Total Suíte Frontend Geral: 46/46 testes verdes em 11 suítes (0 falhas).
- **Compilação (`npm run build`)**: 
  - 0 erros TypeScript (`tsc && vite build` bem-sucedido).

---

## 5. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-04) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários de Backend passando com zero regressões (`mvn test` 132/132).
- [x] Testes unitários de Frontend (`activityApi`, `ActivitiesView` e `ScheduleView`) implementados e verdes (`vitest` 46/46).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Estado persistido no GSD (`.planning/STATE.md`).
