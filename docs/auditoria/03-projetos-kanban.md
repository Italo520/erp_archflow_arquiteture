# 📐 Dossiê de Auditoria e QA: Módulo 03 — Projetos, Etapas & Kanban

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/project` (Backend) & `views/ProjectsKanbanView` / `services/api.ts (projectApi)` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Data JPA, Hibernate, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library

---

## 1. Casos de Uso (Use Cases)

### UC-01: Criação de Projeto Arquitetônico com Inicialização de Fluxo Kanban
- **Atores**: Arquiteto / Gestor de Projetos.
- **Pré-condições**: Usuário autenticado com perfil válido (`ADMIN` ou `ARCHITECT`). Cliente associado deve existir ativo no sistema.
- **Fluxo Principal**:
  1. O arquiteto fornece Nome do Projeto, Cliente (`clientId`), Descrição, Estilo Arquitetônico, Metragem Quadrada (`areaSquareMeters`), Quantidade de Pavimentos (`numberOfFloors`) e Valor Contratado (`contractValue`).
  2. O backend valida a existência e integridade do cliente associado.
  3. Define o status inicial do projeto como `CONCEPTUAL` (Estudo Preliminar).
  4. Inicializa automaticamente as colunas arquitetônicas padrão do Kanban (`Estudo Preliminar`, `Anteprojeto`, `Projeto Executivo`, `Em Obra / Acompanhamento`, `Entregue / Concluído`).
  5. Persiste o projeto no banco de dados e retorna HTTP 201 Created com os dados gerados.
- **Fluxo de Exceção (Cliente Inexistente)**:
  1. Se o `clientId` informado não existir ou estiver inativo, aborta a transação e retorna HTTP 400/404 com RFC 7807 (`ProblemDetail`).

---

### UC-02: Gestão do Fluxo de Trabalho no Quadro Kanban
- **Atores**: Equipe de Arquitetura.
- **Pré-condições**: Projeto previamente cadastrado.
- **Fluxo Principal**:
  1. O usuário visualiza o quadro Kanban dividido pelas etapas do ciclo de vida arquitetônico.
  2. Ao avançar ou recuar um projeto no fluxo (seja via Drag & Drop ou controles manuais acessíveis de seta Anterior/Próximo), o frontend emite `PUT /api/v1/projects/{id}` com o novo `status`.
  3. O backend valida a transição, atualiza a entidade e persiste o timestamp de modificação.
  4. Retorna HTTP 200 OK com o projeto atualizado e a interface sincroniza a posição do card.

---

### UC-03: Criação e Acompanhamento de Tarefas por Etapa de Projeto
- **Atores**: Arquiteto responsável / Colaborador.
- **Pré-condições**: Projeto existente.
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/projects/{id}/tasks` com título, prioridade (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), prazo (`dueDate`) e descrição.
  2. O backend valida a existência do projeto e cria a tarefa vinculada ao escopo do projeto.
  3. Retorna HTTP 201 Created com a tarefa cadastrada.

---

### UC-04: Exclusão Lógica de Projeto (Soft Delete)
- **Atores**: Administrador / Gestor do escritório.
- **Pré-condições**: Projeto existente.
- **Fluxo Principal**:
  1. O usuário aciona `DELETE /api/v1/projects/{id}`.
  2. O backend marca o campo `deletedAt` com o timestamp atual, preservando histórico financeiro e rastreabilidade documental.
  3. Retorna HTTP 204 No Content.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Criação de Projeto com Inicialização Automática de Kanban
> **Como** arquiteto gestor  
> **Quero** cadastrar um novo projeto informando cliente e especificações técnicas  
> **Para que** as etapas e o fluxo de acompanhamento visual sejam criados automaticamente

- **Cenário 1 (Criação com Sucesso - ECP Válido)**:
  - **Dado** que informo o nome "Residência Alphaville", cliente válido "cli-001" e área "350.5" m²
  - **Quando** envio a requisição para `POST /api/v1/projects`
  - **Então** o projeto é cadastrado com status `CONCEPTUAL`
  - **E** suas 5 colunas de Kanban são inicializadas com sucesso.

- **Cenário 2 (Cliente Inexistente - Error Guessing)**:
  - **Dado** que tento criar um projeto associando a um `clientId` inexistente "cli-inexistente"
  - **Quando** submeto a requisição
  - **Então** o sistema rejeita com status 400 Bad Request ou 404 Not Found
  - **E** informa que o cliente referenciado não foi localizado.

---

### US-02: Transição de Fases de Projeto no Kanban
> **Como** arquiteto de projeto  
> **Quero** mover o card do projeto da fase de "Estudo Preliminar" para "Anteprojeto"  
> **Para que** a equipe saiba exatamente o estágio de maturidade do projeto

- **Cenário 1 (Avanço de Etapa - Transição de Estado)**:
  - **Dado** que o projeto "Residência Alphaville" está na etapa `CONCEPTUAL`
  - **Quando** avanço o card para a coluna `PRELIMINARY` (via drag-and-drop ou botão manual "Próximo")
  - **Então** o status do projeto no sistema é atualizado para `PRELIMINARY`
  - **E** o card passa a ser renderizado na coluna correspondente.

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-PRJ-01** | `ProjectService.createProject` | ECP / Fluxo Válido | Backend (Unit/Mock) | ✅ Verde (6/6) |
| **TC-PRJ-02** | `ProjectService.createProject` | Error Guessing (Cliente inexistente) | Backend (Unit/Mock) | ✅ Verde |
| **TC-PRJ-03** | `ProjectService.updateProjectStatus` | Transição de Estados (Fases do projeto) | Backend (Unit/Mock) | ✅ Verde (12/12) |
| **TC-PRJ-04** | `ProjectService.createTask` | ECP Válido (Tarefas vinculadas) | Backend (Unit/Mock) | ✅ Verde |
| **TC-PRJ-05** | `ProjectService.deleteProject` | Soft Delete | Backend (Unit/Mock) | ✅ Verde |
| **TC-PRJ-06** | `projectApi.list / create / update` | ECP / Chamadas HTTP REST | Frontend (Vitest) | ✅ Verde (7/7) |
| **TC-PRJ-07** | `ProjectsKanbanView` | ECP (Renderização das 5 colunas) | Frontend (Testing Library) | ✅ Verde |
| **TC-PRJ-08** | `ProjectsKanbanView` | Transição de Estados (Modal Novo Projeto) | Frontend (Testing Library) | ✅ Verde |
| **TC-PRJ-09** | `ProjectsKanbanView` | Transição de Estados (Movimentação Manual) | Frontend (Testing Library) | ✅ Verde |
| **TC-PRJ-10** | `ProjectsKanbanView` | Filtro / Busca Dinâmica | Frontend (Testing Library) | ✅ Verde (5/5) |

---

## 4. Métricas de Execução e Cobertura

- **Backend (`mvn test`)**:
  - `ProjectServiceTest`: 18/18 testes verdes.
  - `ProjectControllerTest`: 8/8 testes verdes.
  - Total Módulo Project: 26 testes unitários e de integração de controlador.
  - Total Suíte Backend Geral: 132/132 testes verdes (0 falhas).
- **Frontend (`npm run test`)**:
  - `projectApi.test.ts`: 7/7 testes verdes.
  - `ProjectsKanbanView.test.tsx`: 5/5 testes verdes.
  - Total Suíte Frontend Geral: 32/32 testes verdes em 8 suítes (0 falhas).
- **Compilação (`npm run build`)**: 
  - 0 erros TypeScript (`tsc && vite build` bem-sucedido em ~10s).

---

## 5. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-04) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários de Backend passando com zero regressões (`mvn test` 132/132).
- [x] Testes unitários de Frontend (`projectApi` e `ProjectsKanbanView`) implementados e verdes (`vitest` 32/32).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Estado persistido no GSD (`.planning/STATE.md`).
