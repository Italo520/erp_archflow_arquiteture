# Varredura, Auditoria de Paridade e Blindagem QA: Fase 3 (Projetos, Etapas & Kanban) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 03: Projetos, Etapas & Kanban** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso e User Stories (Gherkin), blindando a camada de API e componentes de tela (`ProjectsKanbanView.tsx` e `projectApi`), e gerando o dossiê em `docs/auditoria/03-projetos-kanban.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida a gestão do ciclo de vida arquitetônico (`CONCEPTUAL`, `PRELIMINARY`, `EXECUTIVE`, `CONSTRUCTION`, `COMPLETED`), geração automática de colunas Kanban, tarefas com prioridade, cálculos de áreas/orçamento, soft delete e respostas RFC 7807; no Frontend, blinda o quadro Kanban interativo (`ProjectsKanbanView`), alternância entre fases, modais de cadastro e chamadas à API via `projectApi`.

**Tech Stack:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Hibernate, JUnit 5, Mockito, MockMvc, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 3

- **Documentação & Governança**:
  - Criar: `docs/auditoria/03-projetos-kanban.md` (Dossiê do Módulo 03)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/project/controller/ProjectController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/project/service/impl/ProjectServiceImpl.java`
  - Validar: `backend/src/main/java/com/archflow/modules/project/entity/Project.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/project/service/ProjectServiceTest.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/project/controller/ProjectControllerTest.java`
- **Frontend (React 19)**:
  - Validar: `frontend/src/views/ProjectsKanbanView.tsx`
  - Validar: `frontend/src/services/api.ts` (projectApi)
  - Criar Teste: `frontend/src/tests/projectApi.test.ts` (Testes da camada de serviço HTTP de projetos)
  - Criar Teste: `frontend/src/tests/ProjectsKanbanView.test.tsx` (Testes de interface, colunas, movimentação e modal)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 03

**Files:**
- Create: `docs/auditoria/03-projetos-kanban.md`

- [x] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**

Criar o arquivo `docs/auditoria/03-projetos-kanban.md`:

```markdown
# 📐 Dossiê de Auditoria e QA: Módulo 03 — Projetos, Etapas & Kanban

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: Em Execução (Fase 3)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/project` (Back) & `views/ProjectsKanbanView` / `services/api.ts (projectApi)` (Front)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Data JPA, Flyway, React 19, TypeScript, Vitest

---

## 1. Casos de Uso (Use Cases)

### UC-01: Criação de Projeto Arquitetônico com Especificações Técnicas
- **Atores**: Arquiteto / Gestor de Projetos.
- **Pré-condições**: Usuário autenticado. Cliente associado deve existir no sistema.
- **Fluxo Principal**:
  1. O arquiteto fornece Nome do Projeto, Cliente (`clientId`), Descrição, Estilo Arquitetônico, Metragem Quadrada (`areaSquareMeters`), Quantidade de Pavimentos (`numberOfFloors`) e Valor Contratado (`contractValue`).
  2. O backend valida a existência e integridade do cliente.
  3. Define o status inicial do projeto como `CONCEPTUAL` (Estudo Preliminar).
  4. Cria automaticamente as 5 colunas arquitetônicas padrão no Kanban do projeto (`Estudo Preliminar`, `Anteprojeto`, `Projeto Executivo`, `Em Obra`, `Concluído`).
  5. Persiste o projeto no banco de dados e retorna HTTP 201 Created.

### UC-02: Gestão do Fluxo de Trabalho no Quadro Kanban
- **Atores**: Equipe de Arquitetura.
- **Fluxo Principal**:
  1. O usuário visualiza o quadro Kanban dividido pelas 5 etapas do ciclo de vida arquitetônico.
  2. Ao avançar ou recuar um projeto no fluxo, o frontend emite `PATCH /api/v1/projects/{id}/kanban` com o novo identificador de coluna/etapa.
  3. O backend atualiza o status/coluna do projeto e registra a data da última interação.
  4. Retorna HTTP 200 OK com os dados atualizados.

### UC-03: Criação e Acompanhamento de Tarefas por Etapa de Projeto
- **Atores**: Arquiteto responsável / Estagiário / Colaborador.
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/projects/{id}/tasks` com título, prioridade (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), prazo (`dueDate`) e descrição.
  2. O backend valida os dados, associa a tarefa ao projeto e salva a entidade.
  3. Retorna HTTP 201 Created com a tarefa criada.

### UC-04: Exclusão Lógica de Projeto (Soft Delete)
- **Atores**: Administrador / Gestor do escritório.
- **Fluxo Principal**:
  1. O usuário aciona `DELETE /api/v1/projects/{id}`.
  2. O backend marca `deletedAt = now()` no projeto e em suas entidades dependentes.
  3. Retorna HTTP 204 No Content.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (Gherkin)

### US-01: Criação de Projeto com Inicialização Automática de Kanban
> **Como** arquiteto gestor  
> **Quero** cadastrar um novo projeto informando cliente e detalhes técnicos  
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
  - **Quando** movo o card para a coluna `PRELIMINARY`
  - **Então** o status do projeto no sistema é atualizado para `PRELIMINARY`
  - **E** o card passa a ser renderizado na coluna correspondente.
```

- [x] **Passo 2: Verificar a criação do dossiê**

Validar que o arquivo foi gravado corretamente em `docs/auditoria/03-projetos-kanban.md`.

---

### Task 2: Verificação e Execução dos Testes Formais de Backend do Módulo Project

**Files:**
- Test: `backend/src/test/java/com/archflow/modules/project/service/ProjectServiceTest.java`
- Test: `backend/src/test/java/com/archflow/modules/project/controller/ProjectControllerTest.java`

- [x] **Passo 1: Executar a suíte de testes de Project no Backend**

Executar comando:
```bash
mvn -f backend/pom.xml test "-Dtest=ProjectServiceTest,ProjectControllerTest"
```
Esperado: 26 testes passando com zero falhas cobrindo criação com colunas Kanban, movimentação de coluna, tarefas e soft delete.

---

### Task 3: Testes Unitários da Camada de API de Projetos no Frontend (`projectApi.test.ts`)

**Files:**
- Create: `frontend/src/tests/projectApi.test.ts`

- [x] **Passo 1: Escrever testes unitários para a camada de serviços HTTP `projectApi`**

Criar `frontend/src/tests/projectApi.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import api, { projectApi } from '../services/api';
import { CreateProjectRequest, Project, CreateTaskRequest, Task } from '../types/project';

describe('projectApi - Camada de Serviços HTTP de Projetos', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('ECP Válido: deve chamar GET /projects com parâmetros de filtro', async () => {
    const mockProjectsPage = {
      data: {
        content: [
          {
            id: 'proj-001',
            name: 'Residência Jardins',
            status: 'CONCEPTUAL',
            areaSquareMeters: 450,
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 20,
        number: 0,
      },
    };

    const getSpy = vi.spyOn(api, 'get').mockResolvedValueOnce(mockProjectsPage);

    const result = await projectApi.list({ search: 'Jardins', status: 'CONCEPTUAL' });

    expect(getSpy).toHaveBeenCalledWith('/projects', {
      params: { search: 'Jardins', status: 'CONCEPTUAL' },
    });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].name).toBe('Residência Jardins');
  });

  it('ECP Válido: deve enviar POST /projects com dados completos ao criar projeto', async () => {
    const newProjectRequest: CreateProjectRequest = {
      name: 'Edifício Horizonte',
      clientId: 'cli-001',
      status: 'CONCEPTUAL',
      contractValue: 120000,
      areaSquareMeters: 1200,
      architecturalStyle: 'Contemporâneo',
    };

    const mockCreatedProject: Project = {
      id: 'proj-002',
      name: newProjectRequest.name,
      status: 'CONCEPTUAL',
      clientId: 'cli-001',
      contractValue: 120000,
      areaSquareMeters: 1200,
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedProject });

    const result = await projectApi.create(newProjectRequest);

    expect(postSpy).toHaveBeenCalledWith('/projects', newProjectRequest);
    expect(result.id).toBe('proj-002');
    expect(result.name).toBe('Edifício Horizonte');
  });

  it('Transição de Estados: deve enviar PATCH /projects/{id}/kanban ao mover coluna', async () => {
    const mockMovedProject: Project = {
      id: 'proj-001',
      name: 'Residência Jardins',
      status: 'PRELIMINARY',
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    const patchSpy = vi.spyOn(api, 'patch').mockResolvedValueOnce({ data: mockMovedProject });

    const result = await projectApi.moveKanban('proj-001', 'col-preliminary');

    expect(patchSpy).toHaveBeenCalledWith('/projects/proj-001/kanban', {
      columnId: 'col-preliminary',
    });
    expect(result.status).toBe('PRELIMINARY');
  });

  it('ECP Válido: deve criar tarefa vinculada ao projeto via POST /projects/{id}/tasks', async () => {
    const taskPayload: CreateTaskRequest = {
      title: 'Elaborar pranchas de corte',
      priority: 'HIGH',
    };

    const mockCreatedTask: Task = {
      id: 'task-001',
      title: taskPayload.title,
      priority: 'HIGH',
      status: 'TODO',
      createdAt: '2026-10-06T20:00:00Z',
    };

    const postSpy = vi.spyOn(api, 'post').mockResolvedValueOnce({ data: mockCreatedTask });

    const result = await projectApi.createTask('proj-001', taskPayload);

    expect(postSpy).toHaveBeenCalledWith('/projects/proj-001/tasks', taskPayload);
    expect(result.id).toBe('task-001');
    expect(result.priority).toBe('HIGH');
  });
});
```

- [x] **Passo 2: Executar os testes de `projectApi.test.ts`**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/projectApi.test.ts
```
Esperado: 4 testes passando com sucesso.

---

### Task 4: Testes de Interface e Transição de Estados do Kanban (`ProjectsKanbanView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/ProjectsKanbanView.test.tsx`

- [x] **Passo 1: Escrever testes de componente para `ProjectsKanbanView` cobrindo colunas, cards, movimentação e modal**

Criar `frontend/src/tests/ProjectsKanbanView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectsKanbanView } from '../views/ProjectsKanbanView';
import { projectApi, clientApi } from '../services/api';
import { Project } from '../types/project';

vi.mock('../services/api', () => ({
  projectApi: {
    list: vi.fn(),
    create: vi.fn(),
    moveKanban: vi.fn(),
  },
  clientApi: {
    list: vi.fn(),
  },
}));

describe('ProjectsKanbanView - Quadro Kanban Arquitetônico', () => {
  const mockProjects: Project[] = [
    {
      id: 'proj-001',
      name: 'Residência Alphaville',
      status: 'CONCEPTUAL',
      clientName: 'Mariana Souza',
      contractValue: 85000,
      areaSquareMeters: 420,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'proj-002',
      name: 'Edifício Mirante',
      status: 'EXECUTIVE',
      clientName: 'Beta Incorporadora',
      contractValue: 240000,
      areaSquareMeters: 1800,
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (projectApi.list as any).mockResolvedValue({
      content: mockProjects,
      totalElements: 2,
    });
    (clientApi.list as any).mockResolvedValue({
      content: [{ id: 'cli-001', name: 'Mariana Souza' }],
    });
  });

  it('ECP Válido: deve renderizar as 5 colunas arquitetônicas padrão do Kanban', async () => {
    render(<ProjectsKanbanView />);

    expect(screen.getByText('Pipeline de Projetos')).toBeDefined();

    // 5 colunas arquitetônicas
    expect(screen.getByText('Estudo Preliminar')).toBeDefined();
    expect(screen.getByText('Anteprojeto')).toBeDefined();
    expect(screen.getByText('Projeto Executivo')).toBeDefined();
    expect(screen.getByText('Em Obra / Acompanhamento')).toBeDefined();
    expect(screen.getByText('Entregue / Concluído')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
      expect(screen.getByText('Edifício Mirante')).toBeDefined();
    });
  });

  it('Transição de Estados: deve abrir o modal de criação de novo projeto ao clicar no botão', async () => {
    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    const newBtn = screen.getByText(/Novo Projeto/i);
    fireEvent.click(newBtn);

    expect(screen.getByText('Criar Novo Projeto')).toBeDefined();

    // Fechar modal
    const closeBtn = screen.getByText('Cancelar');
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Projeto')).toBeNull();
    });
  });

  it('Transição de Estados & Movimentação: deve mover projeto para a próxima coluna ao clicar no botão de avançar', async () => {
    (projectApi.moveKanban as any).mockResolvedValueOnce({
      ...mockProjects[0],
      status: 'PRELIMINARY',
    });

    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    // Clica no botão de avançar (ArrowRight) no card
    const nextButtons = screen.getAllByTitle(/Avançar para próxima etapa/i);
    fireEvent.click(nextButtons[0]);

    await waitFor(() => {
      expect(projectApi.moveKanban).toHaveBeenCalledWith('proj-001', 'PRELIMINARY');
    });
  });

  it('Error Guessing: deve exibir mensagem de erro se a criação de projeto falhar', async () => {
    (projectApi.create as any).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Nome de projeto já utilizado para este cliente.',
        },
      },
    });

    render(<ProjectsKanbanView />);

    await waitFor(() => {
      expect(screen.getByText('Residência Alphaville')).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Novo Projeto/i));

    // Preenche nome e submete
    const nameInput = screen.getByPlaceholderText('Ex: Residência Vila Nova');
    fireEvent.change(nameInput, { target: { value: 'Projeto Duplicado' } });

    const submitBtn = screen.getByText('Criar Projeto');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Nome de projeto já utilizado para este cliente.')).toBeDefined();
    });
  });
});
```

- [x] **Passo 2: Executar os testes de `ProjectsKanbanView.test.tsx`**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/ProjectsKanbanView.test.tsx
```
Esperado: 4 testes passando com sucesso.

---

### Task 5: Consolidação do Dossiê do Módulo 03 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/03-projetos-kanban.md`
- Modify: `.planning/STATE.md`

- [x] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**

Executar backend:
```bash
mvn -f backend/pom.xml test
```
Esperado: 132+ testes executados com 0 falhas e BUILD SUCCESS.

Executar frontend:
```bash
npm run test --prefix frontend
```
Esperado: 28 testes passando no Vitest sem nenhuma regressão.

Validar build do frontend:
```bash
npm run build --prefix frontend
```
Esperado: build concluído com 0 erros de compilação.

- [x] **Passo 2: Atualizar o dossiê `docs/auditoria/03-projetos-kanban.md` com as métricas e DoD 100% preenchido**

Registrar no dossiê:
- Catálogo de Casos de Teste (técnicas aplicadas no backend e frontend).
- Coberturas aferidas.
- Definition of Done ticado e verificado.

- [x] **Passo 3: Atualizar o GSD em `.planning/STATE.md`**

Atualizar o `.planning/STATE.md`:
- Módulo 03 (Projetos, Etapas & Kanban): 100% Concluído.
- Próximo módulo ativo: Módulo 04 (Atividades & Time Tracking).
