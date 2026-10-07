# 📁 Dossiê de Auditoria e QA: Módulo 06 — Armazenamento & Documentos

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: ✅ 100% CONCLUÍDO & BLINDADO (Fase 6)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/storage` (Backend) & `views/DocumentsView` (Frontend)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), React 19, TypeScript, Vitest 3.x, Happy-DOM, Testing Library
- **Métricas Consolidadas**:
  - Backend: 138 testes passando (100% verde em `mvn test`), sendo 6 testes específicos de Storage (`StorageServiceTest` 4/4, `StorageControllerTest` 2/2).
  - Frontend: 61 testes passando em 14 suítes (100% verde em `vitest run`), sendo 4 testes de `DocumentsView.test.tsx`.
  - Build: 100% verde (`tsc && vite build`).

---

## 1. Casos de Uso (Use Cases)

### UC-01: Upload de Documentos Técnicos e Pranchas Arquitetônicas
- **Atores**: Arquiteto / Projetista / Estagiário.
- **Pré-condições**: Usuário autenticado. Arquivo válido fornecido via multipart (`.pdf`, `.dwg`, `.ifc`, `.jpg`, `.docx`, etc.).
- **Fluxo Principal**:
  1. O usuário submete `POST /api/v1/storage/upload` com arquivo multipart `file`.
  2. O backend extrai a extensão original, gera uma chave aleatória UUID única (`fileKey`) para evitar colisões e sobrescritas.
  3. Salva o binário no diretório isolado `.storage`.
  4. Retorna HTTP 200 OK com mapa contendo `fileKey`, `fileName`, `fileUrl`, `mimeType` e `fileSize`.

---

### UC-02: Download Seguro com Prevenção de Directory Traversal
- **Atores**: Equipe de Arquitetura / Cliente / Parceiro.
- **Pré-condições**: `fileKey` válida existente no armazenamento.
- **Fluxo Principal**:
  1. O usuário requisita `GET /api/v1/storage/download/{fileKey}`.
  2. O backend sanitiza a chave do arquivo extraindo apenas o nome base (`Paths.get(fileKey).getFileName().toString()`), impedindo sequências maliciosas como `../../etc/passwd`.
  3. Verifica se o recurso existe e é legível em disco.
  4. Retorna HTTP 200 OK com o binário `application/octet-stream` e cabeçalho `Content-Disposition: attachment; filename="..."`.
- **Fluxo de Exceção (Arquivo Inexistente ou Path Inválido - Error Guessing)**:
  1. Se o arquivo não existir em `.storage`, o sistema lança `RuntimeException` informando arquivo inacessível.

---

### UC-03: Filtragem e Classificação Documental por Categoria
- **Atores**: Equipe do Escritório.
- **Fluxo Principal**:
  1. O usuário visualiza a central de documentos dividida por categorias arquitetônicas ("Plantas", "Modelagem 3D", "Contratos", "Vistorias", "Renders").
  2. Ao selecionar uma categoria ou digitar no campo de busca, a listagem reflete instantaneamente os arquivos filtrados.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (BDD / Gherkin)

### US-01: Envio de Arquivos com Identificador Único
> **Como** projetista arquitetônico  
> **Quero** enviar plantas e pranchas executivas para o sistema  
> **Para que** fiquem organizadas e acessíveis a toda a equipe

- **Cenário 1 (Upload Bem-Sucedido - ECP Válido)**:
  - **Dado** que seleciono um arquivo PDF "Planta_Executiva.pdf" de 5 MB
  - **Quando** envio a requisição `POST /api/v1/storage/upload`
  - **Então** o sistema armazena o binário com chave UUID única
  - **E** retorna a URL pública de download `/api/v1/storage/download/{fileKey}`.

---

### US-02: Download Seguro de Arquivos Técnicos
> **Como** membro da equipe  
> **Quero** baixar pranchas e laudos técnicos com segurança  
> **Para que** o sistema previna acessos indevidos fora da pasta de armazenamento

- **Cenário 1 (Download de Arquivo Válido - ECP Válido)**:
  - **Dado** que informo uma chave de arquivo válida "uuid-key.pdf"
  - **Quando** envio `GET /api/v1/storage/download/uuid-key.pdf`
  - **Então** o binário é entregue com status 200 OK e cabeçalho de anexo.

- **Cenário 2 (Tentativa de Directory Traversal - Error Guessing / Segurança)**:
  - **Dado** que um atacante tenta acessar `../../windows/system32/cmd.exe`
  - **Quando** envia a requisição para download
  - **Então** a função sanitiza para `cmd.exe` e rejeita caso não exista no diretório `.storage`.

---

## 3. Matriz de Rastreabilidade e Técnicas de QA Aplicadas

| ID | Alvo | Técnica QA | Tipo de Teste | Status |
|:---|:---|:---|:---|:---|
| **TC-STO-01** | `StorageService.storeFile` | ECP / Fluxo Válido | Backend (Unit) | Aprovado (Passou) |
| **TC-STO-02** | `StorageService.storeFile` | Boundary (Arquivo sem extensão) | Backend (Unit) | Aprovado (Passou) |
| **TC-STO-03** | `StorageService.loadFileAsResource` | ECP / Leitura de arquivo | Backend (Unit) | Aprovado (Passou) |
| **TC-STO-04** | `StorageService.loadFileAsResource` | Error Guessing (Arquivo inexistente) | Backend (Unit) | Aprovado (Passou) |
| **TC-STO-05** | `StorageService.loadFileAsResource` | Segurança (Directory Traversal) | Backend (Unit) | Aprovado (Passou) |
| **TC-STO-06** | `StorageController.uploadFile` | ECP / Multipart HTTP | Backend (MockMvc) | Aprovado (Passou) |
| **TC-STO-07** | `StorageController.downloadFile` | ECP / Octet-stream HTTP | Backend (MockMvc) | Aprovado (Passou) |
| **TC-STO-08** | `DocumentsView` | ECP (Tabela e 6 colunas) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-STO-09** | `DocumentsView` | Transição de Estados (Filtros por categoria) | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-STO-10** | `DocumentsView` | Filtro / Busca Textual | Frontend (Testing Library) | Aprovado (Passou) |
| **TC-STO-11** | `DocumentsView` | Upload de Arquivo (Evento input) | Frontend (Testing Library) | Aprovado (Passou) |

---

## 4. Definition of Done (DoD) do Módulo

- [x] Casos de Uso (UC-01 a UC-03) documentados formalmente.
- [x] User Stories com cenários BDD/Gherkin especificados.
- [x] Testes unitários de Backend implementados para `StorageService` e `StorageController` (`mvn test`).
- [x] Testes unitários de Frontend (`DocumentsView`) implementados e verdes (`vitest`).
- [x] Build de produção do frontend (`npm run build`) validado sem erros TypeScript.
- [x] Estado persistido no GSD (`.planning/STATE.md`).
