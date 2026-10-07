# 🔍 Dossiê de Auditoria e QA: Módulo 05 — Vistorias de Obra & Punch List

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/inspection` (Backend) & `views/InspectionsView` / `services/api.ts (inspectionApi)` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Data JPA, Hibernate, React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library

---

## 1. Casos de Uso (Use Cases)

### UC-01: Cadastro de Vistoria Técnica em Canteiro de Obras
- **Atores**: Arquiteto Fiscal de Obra / Engenheiro Residente.
- **Pré-condições**: Usuário autenticado. Projeto associado deve existir no sistema.
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/inspections` com Título ("Vistoria de Concretagem e Instalações"), Data, Projeto (`projectId`), Notas Gerais e Condições Climáticas ("Ensolarado, 26°C").
  2. O backend valida a existência e integridade do projeto.
  3. Define o status inicial da vistoria como `DRAFT` (Rascunho) ou `IN_PROGRESS`.
  4. Atribui o inspetor autenticado e persiste o registro no banco de dados.
  5. Retorna HTTP 201 Created com os dados da vistoria e o cabeçalho `Location`.
- **Fluxo de Exceção (Projeto Inexistente - Error Guessing)**:
  1. Se `projectId` não for encontrado, rejeita com HTTP 404 Not Found ou 400 Bad Request com RFC 7807 (`ProblemDetail`).

---

### UC-02: Apontamento de Item de Não-Conformidade (Punch List)
- **Atores**: Arquiteto / Inspetor de Qualidade.
- **Pré-condições**: Vistoria previamente cadastrada.
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/inspections/{id}/items` com Descrição do defeito ("Desaprumo no requadro da esquadria"), Localização ("Dormitório Suíte 02"), Severidade (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) e URL de foto comprobatória.
  2. O backend valida os dados, define o status do item como `OPEN` e associa ao identificador da vistoria.
  3. Retorna HTTP 201 Created com o item de punch list persistido.

---

### UC-03: Resolução e Aceite de Item de Pendência
- **Atores**: Responsável Técnico / Empreiteiro / Fiscal.
- **Pré-condições**: Item de punch list em estado `OPEN` ou `IN_PROGRESS`.
- **Fluxo Principal**:
  1. O usuário submete `PATCH /api/v1/inspections/items/{itemId}/resolve` com Notas de Resolução ("Requadro ajustado com desempenadeira e reemboçado") e foto comprobatória da correção.
  2. O backend marca o status como `RESOLVED`, preenche `resolvedAt = now()` e salva as notas de resolução.
  3. Retorna HTTP 200 OK com o item atualizado.

---

### UC-04: Exclusão Lógica de Vistoria (Soft Delete)
- **Atores**: Administrador / Gerente de Projetos.
- **Pré-condições**: Vistoria existente.
- **Fluxo Principal**:
  1. O usuário submete `DELETE /api/v1/inspections/{id}`.
  2. O backend preenche o campo `deletedAt` com timestamp atual, mantendo histórico de pendências sem perda irreversível de dados.
  3. Retorna HTTP 204 No Content.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Registro de Inspeção Técnica com Contexto Climático
> **Como** arquiteto fiscalizador  
> **Quero** registrar a realização de uma vistoria presencial informando clima e escopo  
> **Para que** o histórico de acompanhamento da obra seja formalizado e respaldado

- **Cenário 1 (Criação Válida - ECP Válido)**:
  - **Dado** que informo o título "Vistoria de Alvenaria Térrea", projeto "proj-001" e clima "Ensolarado, 25°C"
  - **Quando** envio a requisição para `POST /api/v1/inspections`
  - **Então** a vistoria é registrada com sucesso
  - **E** retorna status HTTP 201 Created.

---

### US-02: Gerenciamento e Resolução de Pendências da Punch List
> **Como** fiscal de qualidade de acabamentos  
> **Quero** cadastrar pendências com nível de severidade e marcá-las como resolvidas após a correção  
> **Para que** nenhuma não-conformidade passe despercebida até a entrega final das chaves

- **Cenário 1 (Cadastro de Pendência - ECP Válido)**:
  - **Dado** que registro um apontamento de severidade `CRITICAL` em uma vistoria existente
  - **Quando** envio `POST /api/v1/inspections/{id}/items`
  - **Então** o item é criado com status `OPEN`
  - **E** é vinculado à vistoria correspondente.

- **Cenário 2 (Resolução de Pendência - Transição de Estado)**:
  - **Dado** que o item está no estado `OPEN`
  - **Quando** envio `PATCH /api/v1/inspections/items/{itemId}/resolve` com notas de resolução
  - **Então** o status do item transiciona para `RESOLVED`
  - **E** a data de resolução é gravada automaticamente.

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-INS-01** | `InspectionService.createInspection` | ECP / Fluxo Válido | Backend (Unit/Mock) | ✅ Verde (3/3) |
| **TC-INS-02** | `InspectionService.addPunchListItem` | ECP (Pendências) | Backend (Unit/Mock) | ✅ Verde (10/10) |
| **TC-INS-03** | `InspectionService.resolvePunchListItem` | Transição de Estados (`OPEN` -> `RESOLVED`) | Backend (Unit/Mock) | ✅ Verde |
| **TC-INS-04** | `InspectionService.deleteInspection` | Soft Delete | Backend (Unit/Mock) | ✅ Verde |
| **TC-INS-05** | `inspectionApi.list / create / getItems` | ECP / Chamadas HTTP REST | Frontend (Vitest) | ✅ Verde (7/7) |
| **TC-INS-06** | `inspectionApi.resolvePunchListItem` | Transição de Estados HTTP | Frontend (Vitest) | ✅ Verde |
| **TC-INS-07** | `InspectionsView` | ECP (Painel duplo vistorias e itens) | Frontend (Testing Library) | ✅ Verde (4/4) |
| **TC-INS-08** | `InspectionsView` | Transição de Estados (Abertura de modais) | Frontend (Testing Library) | ✅ Verde |
| **TC-INS-09** | `InspectionsView` | Resolução de Pendências (Modal e notas) | Frontend (Testing Library) | ✅ Verde |

---

## 4. Métricas de Execução e Cobertura

- **Backend (`mvn test`)**:
  - `InspectionServiceTest`: 13/13 testes verdes.
  - `InspectionControllerTest`: 7/7 testes verdes.
  - Total Módulo Inspection: 20 testes unitários e de integração web.
  - Total Suíte Backend Geral: 132/132 testes verdes (0 falhas).
- **Frontend (`npm run test`)**:
  - `inspectionApi.test.ts`: 7/7 testes verdes.
  - `InspectionsView.test.tsx`: 4/4 testes verdes.
  - Total Suíte Frontend Geral: 57/57 testes verdes em 13 suítes (0 falhas).
- **Compilação (`npm run build`)**: 
  - 0 erros TypeScript (`tsc && vite build` bem-sucedido em ~10s).

---

## 5. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-04) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários de Backend passando com zero regressões (`mvn test` 132/132).
- [x] Testes unitários de Frontend (`inspectionApi` e `InspectionsView`) implementados e verdes (`vitest` 57/57).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Estado persistido no GSD (`.planning/STATE.md`).
