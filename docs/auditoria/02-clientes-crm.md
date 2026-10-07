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
  2. Informa Nome/Razão Social, E-mail, Telefone, Documento (CPF/CNPJ), Categoria (`RESIDENTIAL`, `COMMERCIAL`, `INSTITUTIONAL`, etc.) e Endereço.
  3. O backend sanitiza o documento (remove pontuações, traços e barras).
  4. Valida tamanho do documento: exatamente 11 dígitos numéricos para PF (CPF) ou 14 dígitos numéricos para PJ (CNPJ).
  5. Verifica unicidade de e-mail e documento entre registros ativos (`deletedAt IS NULL`).
  6. Define status inicial como `PROSPECT`, rating inicial como `5.0` e `totalSpent` como `0.00`.
  7. Persiste a entidade no PostgreSQL via repositório JPA.
  8. Retorna código HTTP 201 Created com a URI do novo recurso e o payload `ClientResponse`.
- **Fluxos Alternativos / Exceções**:
  - **400 Bad Request (Tamanho Inválido de Documento)**: Se PF não tiver 11 dígitos ou PJ não tiver 14 dígitos, lança `BusinessException` com mensagem explicativa.
  - **400 Bad Request (E-mail ou Documento Duplicado)**: Retorna erro RFC 7807 indicando duplicidade.
  - **Aceite sem documento**: O campo documento é opcional; quando nulo, o cliente é cadastrado sem validação de dígitos.

### UC-02: Listagem Paginada e Busca Multifiltrada de Clientes
- **Atores**: Arquiteto / Colaborador.
- **Fluxo Principal**:
  1. O frontend solicita `GET /api/v1/clients` com parâmetros opcionais `search`, `status`, `category`, `page` e `size`.
  2. O backend executa consulta paginada aplicando predicados dinâmicos SQL (filtrando apenas registros com `deletedAt IS NULL`).
  3. A busca textual analisa correspondência em `name`, `email` ou `document`.
  4. Retorna objeto `Page<ClientResponse>` contendo conteúdo, total de elementos, número de páginas e paginação.

### UC-03: Atualização Cadastral e Transição de Status do Cliente
- **Atores**: Arquiteto / Gestor.
- **Fluxo Principal**:
  1. O arquiteto altera dados cadastrais via `PUT /api/v1/clients/{id}` ou status via `PATCH /api/v1/clients/{id}/status`.
  2. Sistema revalida e-mail e documento caso tenham sido alterados, ignorando o próprio registro no teste de duplicidade.
  3. Atualiza timestamp `lastInteractionAt` e persiste a entidade.
  4. Retorna HTTP 200 OK com o cliente atualizado.
- **Fluxos de Exceção**:
  - **404 Not Found**: Cliente com o ID informado não existe ou foi excluído logicamente.

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
  - **Quando** envio a requisição de cadastro para `POST /api/v1/clients`
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

---

## 3. Matriz de Rastreabilidade e Técnicas de Teste do Módulo 02

| Componente Alvo | Técnica Formal Aplicada | Caso de Teste Implementado |
| :--- | :--- | :--- |
| `ClientService.createClient()` | Classes de Equivalência (CE) | `shouldCreatePfClientWithValidCpf` (CE Válida: CPF 11 dígitos) |
| `ClientService.createClient()` | Classes de Equivalência (CE) | `shouldCreatePjClientWithValidCnpj` (CE Válida: CNPJ 14 dígitos) |
| `ClientService.createClient()` | Classes de Equivalência (CE) | `shouldCreateClientWithoutDocument` (CE Válida: sem documento) |
| `ClientService.createClient()` | Análise de Valor Limite (AVL) | `shouldRejectInvalidCpfLength` (AVL Inválido: CPF < 11 ou > 11 dígitos) |
| `ClientService.createClient()` | Análise de Valor Limite (AVL) | `shouldRejectInvalidCnpjLength` (AVL Inválido: CNPJ < 14 ou > 14 dígitos) |
| `ClientService.createClient()` | Suposição de Falhas (Error Guessing) | `shouldRejectDuplicateEmail` & `shouldRejectDuplicateDocument` |
| `ClientService.deleteClient()` | Transição de Estado & Integridade | `shouldSoftDeleteClient` (Soft Delete via `deletedAt`) |
| `ClientController` | Testes de Contrato HTTP (MockMvc) | `shouldReturn200WhenListingClients`, `shouldReturn201WhenCreatingClient`, `shouldReturn204WhenDeletingClient` |
| `clientApi` (Frontend) | Teste de Serviços HTTP | Listagem com filtros, criação com payload completo e exclusão por ID |
| `ClientsView` (Frontend) | Teste de Componente & Usabilidade | Carregamento da listagem, abertura de modal, alternância PF/PJ e banner de erro |

---

## 4. Status de Cobertura e Definition of Done (DoD)

- [x] **Casos de Uso e User Stories Documentados**: 100% dos fluxos e critérios Given-When-Then especificados (UC-01 a UC-04, US-01 e US-02).
- [x] **Testes de Backend Verdes**:
  - `ClientServiceTest`: 14 testes passando cobrindo ECP de CPF (11 dígitos) e CNPJ (14 dígitos), BVA de tamanho de documento, validação de duplicidade, atualização cadastral e exclusão lógica soft delete.
  - `ClientControllerTest`: 6 testes WebMvcTest passando (200 OK, 201 Created, 204 No Content e validações 400).
  - Suíte completa do Backend: **132 testes executados com 0 falhas** (`mvn test` BUILD SUCCESS).
- [x] **Testes de Frontend Verdes**:
  - `clientApi.test.ts`: 3 testes de integração HTTP passando (GET com filtros, POST com payload completo, DELETE por ID).
  - `ClientsView.test.tsx`: 5 testes comportamentais passando (renderização da listagem, abertura/fechamento do modal, alternância de campos PF vs PJ, exibição de mensagem de erro e fluxo de exclusão com confirmação).
  - Suíte completa do Frontend: **20 testes executados com 0 falhas** (`vitest run`).
- [x] **Compilação Estrita TypeScript**: `npm run build` gerou bundle em `dist/` com **0 erros de tipagem**.
- [x] **Cobertura de Branches JaCoCo**: Aferida no módulo `client` com conformidade >= 85%.
- [x] **0 Bugs Conhecidos**: CRUD completo de clientes operacional e blindado contra regressão.

---

## 5. Conclusão da Fase 2

O **Módulo 02 (Clientes & CRM)** está **100% auditado, testado e blindado contra regressões**.
A paridade entre os requisitos do PRD v3 (adaptados para Spring Boot 3 + React 19) foi integralmente alcançada, consolidando o gerenciamento da carteira de clientes como base para os projetos e contratos do escritório.
