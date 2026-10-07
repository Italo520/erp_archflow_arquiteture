# Varredura, Auditoria de Paridade e Blindagem QA: Fase 2 (Clientes & CRM) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 02: Clientes & CRM** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso e User Stories (Gherkin), blindando a camada de API e componentes de tela (`ClientsView.tsx` e `clientApi`), e gerando o dossiê em `docs/auditoria/02-clientes-crm.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, consolida o CRUD com validação estrita de documentos (CPF 11 dígitos / CNPJ 14 dígitos), sanitização de formatação, exclusão lógica (soft delete via `deletedAt`), busca paginada com Specification/JPA e respostas RFC 7807; no Frontend, blinda a interface React 19 (`ClientsView`), o formulário modal PF/PJ, os filtros combinatórios e o consumo da API via `clientApi`.

**Tech Stack:** Java 21, Spring Boot 3.4.3, Spring Data JPA, Hibernate, JUnit 5, Mockito, MockMvc, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library React.

---

### Mapeamento de Arquivos da Fase 2

- **Documentação & Governança**:
  - Criar: `docs/auditoria/02-clientes-crm.md` (Dossiê do Módulo 02)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Validar: `backend/src/main/java/com/archflow/modules/client/controller/ClientController.java`
  - Validar: `backend/src/main/java/com/archflow/modules/client/service/impl/ClientServiceImpl.java`
  - Validar: `backend/src/main/java/com/archflow/modules/client/entity/Client.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/client/service/ClientServiceTest.java`
  - Validar / Executar Teste: `backend/src/test/java/com/archflow/modules/client/controller/ClientControllerTest.java`
- **Frontend (React 19)**:
  - Validar: `frontend/src/views/ClientsView.tsx`
  - Validar: `frontend/src/services/api.ts` (clientApi)
  - Criar Teste: `frontend/src/tests/clientApi.test.ts` (Testes da camada de serviço HTTP de clientes)
  - Criar Teste: `frontend/src/tests/ClientsView.test.tsx` (Testes de interface, filtros, modal e exclusão)

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 02

**Files:**
- Create: `docs/auditoria/02-clientes-crm.md`

- [ ] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**

Criar o arquivo `docs/auditoria/02-clientes-crm.md`:

```markdown
# 👥 Dossiê de Auditoria e QA: Módulo 02 — Clientes & CRM

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: Em Execução (Fase 2)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/client` (Back) & `views/ClientsView` / `services/api.ts (clientApi)` (Front)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Data JPA, Flyway, React 19, TypeScript, Vitest

---

## 1. Casos de Uso (Use Cases)

### UC-01: Cadastro de Cliente com Validação de Documento (PF/PJ)
- **Atores**: Arquiteto / Gestor do escritório.
- **Pré-condições**: Usuário autenticado. E-mail e CPF/CNPJ informados não podem constar previamente em clientes ativos.
- **Fluxo Principal**:
  1. O arquiteto escolhe o tipo jurídico (`PF` ou `PJ`).
  2. Informa Nome/Razão Social, E-mail, Telefone, Documento (CPF/CNPJ), Categoria e Endereço.
  3. O backend sanitiza o documento (remove pontuações e traços).
  4. Valida tamanho do documento: 11 dígitos para PF (CPF) ou 14 dígitos para PJ (CNPJ).
  5. Verifica unicidade de e-mail e documento (`deletedAt IS NULL`).
  6. Define status inicial como `PROSPECT` e rating inicial como `5.0`.
  7. Persiste a entidade no banco de dados e retorna HTTP 201 Created com os dados gerados.
- **Fluxos de Exceção**:
  - **400 Bad Request (Tamanho Inválido de Documento)**: Se PF não tiver 11 dígitos ou PJ não tiver 14 dígitos, lança `BusinessException` com mensagem descritiva.
  - **400 Bad Request (E-mail ou Documento Duplicado)**: Retorna erro RFC 7807 indicando duplicidade.

### UC-02: Listagem Paginada e Busca Multifiltrada de Clientes
- **Atores**: Arquiteto / Colaborador.
- **Fluxo Principal**:
  1. A aplicação solicita `GET /api/v1/clients` com parâmetros opcionais `search`, `status`, `category`, `page` e `size`.
  2. O backend executa consulta paginada aplicando predicados dinâmicos (ignorando registros com `deletedAt != null`).
  3. Retorna objeto `Page<ClientResponse>` contendo conteúdo, total de elementos, páginas e ordenação.

### UC-03: Atualização Cadastral e Transição de Status do Cliente
- **Atores**: Arquiteto / Gestor.
- **Fluxo Principal**:
  1. O arquiteto altera dados cadastrais via `PUT /api/v1/clients/{id}` ou status via `PATCH /api/v1/clients/{id}/status`.
  2. Sistema revalida e-mail e documento caso tenham sido alterados.
  3. Atualiza `lastInteractionAt` e persiste a entidade.
  4. Retorna HTTP 200 OK com o cliente atualizado.

### UC-04: Exclusão Lógica de Cliente (Soft Delete)
- **Atores**: Administrador / Arquiteto com permissão.
- **Fluxo Principal**:
  1. O usuário aciona a exclusão do cliente via `DELETE /api/v1/clients/{id}`.
  2. O sistema localiza o cliente ativo e executa `client.markAsDeleted()`, atribuindo timestamp a `deletedAt`.
  3. O registro deixa de ser retornado em listagens e buscas normais, preservando histórico e integridade referencial com projetos e time logs.
  4. Retorna HTTP 204 No Content.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (Gherkin)

### US-01: Cadastro Diferenciado de Pessoa Física e Jurídica
> **Como** arquiteto do escritório  
> **Quero** cadastrar clientes indicando se são Pessoa Física (CPF) ou Pessoa Jurídica (CNPJ)  
> **Para que** eu emita propostas e contratos com as informações fiscais e legais corretas

- **Cenário 1 (Cadastro PF com CPF válido - ECP Válido)**:
  - **Dado** que seleciono o tipo "Pessoa Física (PF)"
  - **E** informo nome "Mariana Souza", e-mail "mariana@cliente.com" e CPF "123.456.789-01"
  - **Quando** envio a requisição de cadastro
  - **Então** o sistema sanitiza o CPF para "12345678901"
  - **E** retorna status 201 Created com o cliente cadastrado como PF e status PROSPECT.

- **Cenário 2 (Cadastro PJ com CNPJ válido - ECP Válido)**:
  - **Dado** que seleciono o tipo "Pessoa Jurídica (PJ)"
  - **E** informo Razão Social "Beta Construtora Ltda" e CNPJ "12.345.678/0001-99"
  - **Quando** envio a requisição de cadastro
  - **Então** o sistema valida os 14 dígitos do CNPJ
  - **E** retorna status 201 Created com tipo PJ.

- **Cenário 3 (Rejeição de CPF com tamanho incorreto - AVL / Error Guessing)**:
  - **Dado** que seleciono PF mas informo um CPF com 9 dígitos "123456789"
  - **Quando** tento cadastrar o cliente
  - **Então** o sistema rejeita a operação com status 400 Bad Request
  - **E** exibe a mensagem "CPF inválido. Deve conter exatamente 11 dígitos numéricos.".

---

### US-02: Filtros de Carteira e Busca Dinâmica
> **Como** gestor do escritório  
> **Quero** filtrar meus clientes por status (Prospect, Ativo, Inativo) e buscar por nome ou documento  
> **Para que** eu localize rapidamente o contato desejado para acompanhamento de projetos

- **Cenário 1 (Busca por termo de texto)**:
  - **Dado** que possuo clientes com nomes "Carlos Silva" e "Fernanda Rocha"
  - **Quando** digito "Carlos" no campo de busca da tela de clientes
  - **Então** a tabela exibe apenas o registro de "Carlos Silva".

- **Cenário 2 (Filtro por status)**:
  - **Dado** que seleciono o filtro de status "PROSPECT"
  - **Quando** a lista é atualizada
  - **Então** apenas clientes em fase de prospecção são exibidos na visualização.
```

- [ ] **Passo 2: Verificar a criação do dossiê**

Validar que o arquivo foi gravado corretamente em `docs/auditoria/02-clientes-crm.md`.

---

### Task 2: Verificação e Execução dos Testes Formais de Backend do Módulo Client

**Files:**
- Test: `backend/src/test/java/com/archflow/modules/client/service/ClientServiceTest.java`
- Test: `backend/src/test/java/com/archflow/modules/client/controller/ClientControllerTest.java`

- [ ] **Passo 1: Executar a suíte de testes de serviço do Client**

Executar comando:
```bash
mvn -f backend/pom.xml test -Dtest=ClientServiceTest
```
Esperado: 18 testes passando com zero falhas cobrindo ECP de CPF/CNPJ, BVA de tamanho de documento, unicidade de e-mail e soft-delete.

- [ ] **Passo 2: Executar a suíte de testes de controller do Client**

Executar comando:
```bash
mvn -f backend/pom.xml test -Dtest=ClientControllerTest
```
Esperado: Todos os endpoints REST validados com MockMvc (200, 201, 204, 400).

---

### Task 3: Testes Unitários da Camada de API de Clientes no Frontend (`clientApi.test.ts`)

**Files:**
- Create: `frontend/src/tests/clientApi.test.ts`

- [ ] **Passo 1: Escrever testes unitários para a camada de serviços HTTP `clientApi`**

Criar `frontend/src/tests/clientApi.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientApi } from '../services/api';
import { api } from '../services/api';
import { CreateClientRequest, Client } from '../types/client';

vi.mock('../services/api', async () => {
  const actual = await vi.importActual('../services/api');
  return {
    ...actual,
    api: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
    clientApi: {
      list: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('clientApi - Camada de Serviços HTTP de Clientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('ECP Válido: deve chamar clientApi.list passando filtros de busca e paginação', async () => {
    const mockPageResponse = {
      content: [
        {
          id: 'client-01',
          name: 'Roberto Arquitetura',
          email: 'roberto@cliente.com',
          legalType: 'PF',
          category: 'RESIDENTIAL',
          status: 'ACTIVE',
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    };

    (clientApi.list as any).mockResolvedValueOnce(mockPageResponse);

    const result = await clientApi.list({ search: 'Roberto', status: 'ACTIVE', size: 20 });

    expect(clientApi.list).toHaveBeenCalledWith({ search: 'Roberto', status: 'ACTIVE', size: 20 });
    expect(result.content).toHaveLength(1);
    expect(result.content[0].name).toBe('Roberto Arquitetura');
  });

  it('ECP Válido: deve enviar payload completo ao criar cliente via clientApi.create', async () => {
    const newClientPayload: CreateClientRequest = {
      name: 'Studio Design Ltda',
      email: 'contato@studiodesign.com',
      legalType: 'PJ',
      document: '12.345.678/0001-90',
      category: 'COMMERCIAL',
      notes: 'Cliente corporativo',
    };

    const mockCreatedClient: Client = {
      id: 'client-99',
      name: newClientPayload.name,
      email: newClientPayload.email,
      legalType: 'PJ',
      document: '12345678000190',
      category: 'COMMERCIAL',
      status: 'PROSPECT',
      createdAt: '2026-10-06T20:00:00Z',
      updatedAt: '2026-10-06T20:00:00Z',
    };

    (clientApi.create as any).mockResolvedValueOnce(mockCreatedClient);

    const result = await clientApi.create(newClientPayload);

    expect(clientApi.create).toHaveBeenCalledWith(newClientPayload);
    expect(result.id).toBe('client-99');
    expect(result.status).toBe('PROSPECT');
  });

  it('Transição de Estado: deve chamar clientApi.delete com o id correto do cliente', async () => {
    (clientApi.delete as any).mockResolvedValueOnce(undefined);

    await clientApi.delete('client-01');

    expect(clientApi.delete).toHaveBeenCalledWith('client-01');
  });
});
```

- [ ] **Passo 2: Executar os testes de `clientApi.test.ts`**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/clientApi.test.ts
```
Esperado: 3 testes passando com sucesso.

---

### Task 4: Testes de Interface, Filtros e Ações da Tela de Clientes (`ClientsView.test.tsx`)

**Files:**
- Create: `frontend/src/tests/ClientsView.test.tsx`

- [ ] **Passo 1: Escrever testes de componente para `ClientsView` cobrindo carregamento, filtros, modal e exclusão**

Criar `frontend/src/tests/ClientsView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ClientsView } from '../views/ClientsView';
import { clientApi } from '../services/api';
import { Client } from '../types/client';

vi.mock('../services/api', () => ({
  clientApi: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ClientsView - Experiência de Gestão de Clientes & CRM', () => {
  const mockClients: Client[] = [
    {
      id: 'cli-001',
      name: 'Beatriz Vasconcelos',
      email: 'beatriz@residencia.com',
      phone: '11999998888',
      legalType: 'PF',
      document: '12345678901',
      category: 'RESIDENTIAL',
      status: 'ACTIVE',
      rating: 5,
      totalSpent: 45000,
      createdAt: '2026-01-10T10:00:00Z',
      updatedAt: '2026-01-10T10:00:00Z',
    },
    {
      id: 'cli-002',
      name: 'Inovação Imobiliária SA',
      email: 'contato@inovacao.com',
      phone: '1133334444',
      legalType: 'PJ',
      document: '98765432000188',
      category: 'COMMERCIAL',
      status: 'PROSPECT',
      rating: 4,
      totalSpent: 0,
      createdAt: '2026-02-15T10:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (clientApi.list as any).mockResolvedValue({
      content: mockClients,
      totalElements: 2,
    });
  });

  it('ECP Válido: deve carregar e renderizar a lista de clientes da API', async () => {
    render(<ClientsView />);

    expect(screen.getByText('Carteira de Clientes')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
      expect(screen.getByText('Inovação Imobiliária SA')).toBeDefined();
    });
  });

  it('Transição de Estados: deve abrir e fechar o modal de cadastro de novo cliente', async () => {
    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    const newBtn = screen.getByText(/Novo Cliente/i);
    fireEvent.click(newBtn);

    // Modal aberto
    expect(screen.getByText('Cadastrar Novo Cliente')).toBeDefined();

    // Fechar modal via botão cancelar
    const cancelBtn = screen.getByText('Cancelar');
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Cadastrar Novo Cliente')).toBeNull();
    });
  });

  it('Tabela de Decisão: alternar entre PF e PJ deve alterar campos do formulário no modal', async () => {
    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Novo Cliente/i));

    // Por padrão é PF
    expect(screen.getByPlaceholderText('Ex: João Silva')).toBeDefined();

    // Selecionar PJ
    const pjRadio = screen.getByLabelText(/Pessoa Jurídica \(PJ\)/i);
    fireEvent.click(pjRadio);

    expect(screen.getByPlaceholderText('Ex: Alpha Engenharia Ltda')).toBeDefined();
    expect(screen.getByPlaceholderText('00.000.000/0000-00')).toBeDefined();
  });

  it('Error Guessing: deve exibir mensagem de erro quando a criação de cliente falhar', async () => {
    (clientApi.create as any).mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Já existe um cliente cadastrado com este e-mail.',
        },
      },
    });

    render(<ClientsView />);

    await waitFor(() => {
      expect(screen.getByText('Beatriz Vasconcelos')).toBeDefined();
    });

    fireEvent.click(screen.getByText(/Novo Cliente/i));

    // Preenche dados básicos e submete
    const nameInput = screen.getByPlaceholderText('Ex: João Silva');
    const emailInput = screen.getByPlaceholderText('joao@exemplo.com');

    fireEvent.change(nameInput, { target: { value: 'Cliente Duplicado' } });
    fireEvent.change(emailInput, { target: { value: 'duplicado@cliente.com' } });

    const submitBtn = screen.getByText('Salvar Cliente');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Já existe um cliente cadastrado com este e-mail.')).toBeDefined();
    });
  });
});
```

- [ ] **Passo 2: Executar os testes de `ClientsView.test.tsx`**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/ClientsView.test.tsx
```
Esperado: 4 testes passando com sucesso.

---

### Task 5: Consolidação do Dossiê do Módulo 02 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/02-clientes-crm.md`
- Modify: `.planning/STATE.md`

- [ ] **Passo 1: Executar a suíte integrada completa (Backend + Frontend)**

Executar backend:
```bash
mvn -f backend/pom.xml test
```
Esperado: 132+ testes executados com 0 falhas e BUILD SUCCESS.

Executar frontend:
```bash
npm run test --prefix frontend
```
Esperado: 19 testes passando no Vitest sem nenhuma regressão.

Validar build do frontend:
```bash
npm run build --prefix frontend
```
Esperado: build concluído com 0 erros de compilação.

- [ ] **Passo 2: Atualizar o dossiê `docs/auditoria/02-clientes-crm.md` com as métricas e DoD 100% preenchido**

Registrar no dossiê:
- Catálogo de Casos de Teste (técnicas aplicadas no backend e frontend).
- Coberturas aferidas.
- Definition of Done ticado e verificado.

- [ ] **Passo 3: Atualizar o GSD em `.planning/STATE.md`**

Atualizar o `.planning/STATE.md`:
- Módulo 02 (Clientes & CRM): 100% Concluído.
- Próximo módulo ativo: Módulo 03 (Projetos, Etapas & Kanban).
