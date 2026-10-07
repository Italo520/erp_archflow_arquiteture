# 🛡️ Dossiê de Auditoria e QA: Módulo 01 — Autenticação, RBAC & Usuários

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: Em Execução (Fase 1)
- **Responsáveis**: Italo520 & Antigravity
- **Módulo**: `modules/auth` (Back) & `views/LoginView` / `context/AuthContext` (Front)
- **Stack Técnica**: Spring Boot 3.4.3 (Java 21), Spring Security, jjwt, React 19, Vitest, Happy-DOM

---

## 1. Casos de Uso (Use Cases)

### UC-01: Registro de Novo Usuário no Sistema
- **Atores**: Usuário não autenticado, Administrador do escritório.
- **Pré-condições**: E-mail informado não pode constar previamente no banco de dados (`deletedAt IS NULL`).
- **Fluxo Principal**:
  1. O usuário preenche Nome Completo, E-mail, Senha e Papel pretendido (`ROLE_ADMIN`, `ROLE_ARCHITECT`, `ROLE_EDITOR`, `ROLE_VIEWER`).
  2. O sistema normaliza o e-mail (remove espaços excedentes e converte para minúsculas).
  3. O sistema valida os campos via Bean Validation (`@NotBlank`, `@Email`, senha com no mínimo 6 caracteres).
  4. O sistema gera o hash criptográfico da senha utilizando BCrypt com salt dinâmico.
  5. O usuário é persistido no PostgreSQL via repositório JPA.
  6. O sistema emite um par de tokens JWT (Access Token com validade de 1 hora e Refresh Token com validade de 24 horas).
  7. Retorna HTTP 201 Created com os tokens e os dados sanitizados do usuário (`UserResponse`).
- **Fluxos Alternativos / Exceções**:
  - **400 Bad Request (E-mail já existente)**: Se `userRepository.existsByEmail` for verdadeiro, interrompe a operação e lança `BusinessException` mapeada para ProblemDetail RFC 7807: *"Já existe um usuário cadastrado com o e-mail: {email}"*.
  - **400 Bad Request (Validação Falha)**: Se qualquer campo não cumprir as anotações do DTO, retorna mapa `invalidParams` detalhando violações.

### UC-02: Autenticação de Usuário e Emissão de Sessão (Login)
- **Atores**: Arquiteto / Colaborador cadastrado.
- **Pré-condições**: Conta de usuário ativa no sistema (`deletedAt IS NULL`).
- **Fluxo Principal**:
  1. O usuário submete e-mail e senha através da tela de login.
  2. O sistema busca o registro pelo e-mail ativo.
  3. O sistema valida a senha informada contra o hash BCrypt gravado no banco de dados.
  4. O sistema constrói as claims do JWT contendo identificador, e-mail e roles do usuário.
  5. O sistema retorna HTTP 200 OK com o token de acesso Bearer e dados do usuário.
- **Fluxos Alternativos / Exceções**:
  - **401 Unauthorized (Credenciais Incorretas)**: Se o e-mail não existir ou a senha não coincidir, lança `BadCredentialsException` mapeada para ProblemDetail com o título *"Invalid Credentials"* e detalhe *"E-mail ou senha inválidos."*.
  - **401 Unauthorized (Conta Inativa / Excluída)**: Se o usuário existir mas possuir marcação de soft-delete (`deletedAt != null`), o login é bloqueado com mensagem amigável *"Usuário inativo ou excluído."*.

### UC-03: Consulta do Perfil do Usuário Autenticado (/me)
- **Atores**: Usuário autenticado.
- **Pré-condições**: Requisição contendo header HTTP `Authorization: Bearer <token_valido>`.
- **Fluxo Principal**:
  1. O filtro `JwtAuthenticationFilter` extrai o Bearer token do cabeçalho `Authorization`.
  2. O `JwtService` valida a assinatura HMAC-SHA256 e a data de expiração do token.
  3. O usuário correspondente ao subject do token é injetado no `SecurityContextHolder`.
  4. O endpoint `GET /api/v1/auth/me` recupera os dados do usuário atual e retorna HTTP 200 OK com `UserResponse`.
- **Fluxos Alternativos / Exceções**:
  - **401 Unauthorized**: Token ausente, forjado, inválido ou expirado.

### UC-04: Gerenciamento e Restauração de Sessão no Frontend
- **Atores**: Arquiteto operando a SPA no navegador ou dispositivo móvel.
- **Fluxo Principal**:
  1. Após login bem-sucedido, o `AuthContext` salva o token JWT e os dados do usuário no `localStorage`.
  2. O header padrão do cliente Axios (`api.defaults.headers.common['Authorization']`) é configurado com `Bearer <token>`.
  3. O estado `isAuthenticated` transiciona para `true` e redireciona o usuário para `/dashboard`.
  4. Em recargas de página (F5) ou retorno ao app, o `AuthContext` restaura a sessão ativa sem deslogar o usuário.
  5. Ao acionar Logout, o token é expurgado do `localStorage`, os cabeçalhos são resetados e o estado transiciona para `false`.

---

## 2. Histórias de Usuário (User Stories) & Critérios de Aceitação (Gherkin)

### US-01: Registro de Usuário com Validação Estrita
> **Como** novo arquiteto ou gestor do escritório  
> **Quero** realizar meu cadastro fornecendo nome, e-mail e senha  
> **Para que** eu tenha acesso seguro à plataforma corporativa ArchFlow

- **Cenário 1 (Sucesso - Partição de Equivalência Válida)**:
  - **Dado** que forneço nome "Carlos Arquiteto", e-mail "carlos@archflow.com" e senha forte "SenhaForte@123"
  - **E** o e-mail "carlos@archflow.com" não está cadastrado no sistema
  - **Quando** envio a requisição de cadastro para `POST /api/v1/auth/register`
  - **Então** o sistema responde com status HTTP 201 Created
  - **E** o corpo da resposta contém um token Bearer válido e os dados do usuário sem expor o hash da senha.

- **Cenário 2 (Erro - E-mail duplicado)**:
  - **Dado** que o e-mail "carlos@archflow.com" já se encontra cadastrado
  - **Quando** envio uma nova tentativa de registro com este mesmo e-mail
  - **Então** o sistema rejeita a operação com status HTTP 400 Bad Request
  - **E** retorna a mensagem de negócio "Já existe um usuário cadastrado com o e-mail: carlos@archflow.com".

- **Cenário 3 (Erro - Violação de Limites de Senha e E-mail Malformado)**:
  - **Dado** que informo um e-mail com formato inválido "email-sem-arroba" e senha menor que 6 caracteres "123"
  - **Quando** submeto o formulário de cadastro
  - **Então** o sistema rejeita com status HTTP 400 Bad Request
  - **E** retorna o mapa de parâmetros inválidos indicando as violações em `email` e `password`.

---

### US-02: Autenticação Segura e Controle de Acesso
> **Como** arquiteto com conta ativa  
> **Quero** autenticar com meu e-mail e senha  
> **Para que** eu possa acessar os projetos e tarefas do escritório

- **Cenário 1 (Sucesso - Credenciais Corretas)**:
  - **Dado** que possuo conta ativa com e-mail "mariana@archflow.com" e senha "Mariana@123"
  - **Quando** submeto minhas credenciais em `POST /api/v1/auth/login`
  - **Então** o sistema valida o hash criptográfico
  - **E** retorna status HTTP 200 OK com o token de acesso e perfil do usuário.

- **Cenário 2 (Erro - Credenciais Incorretas - Error Guessing)**:
  - **Dado** que informo uma senha divergente ou e-mail inexistente
  - **Quando** envio a requisição de login
  - **Então** o sistema retorna HTTP 401 Unauthorized com ProblemDetail RFC 7807
  - **E** nenhuma informação confidencial ou stacktrace interna é vazada.

- **Cenário 3 (Erro - Usuário Soft-Deleted)**:
  - **Dado** que o usuário teve seu registro desativado com `deletedAt != null`
  - **Quando** tenta realizar login com a senha correta
  - **Então** o sistema bloqueia o acesso com HTTP 401 e a mensagem "Usuário inativo ou excluído.".

---

### US-03: Persistência e Navegação de Sessão no Frontend
> **Como** arquiteto operando o sistema  
> **Quero** que minha sessão permaneça ativa enquanto trabalho  
> **Para que** eu não precise redigitar minha senha a cada troca de tela

- **Cenário 1 (Persistência no Storage)**:
  - **Dado** que faço login bem-sucedido na interface
  - **Quando** a autenticação é concluída
  - **Então** o token JWT é gravado na chave `archflow_token` do `localStorage`
  - **E** sou redirecionado automaticamente para a rota `/dashboard`.

- **Cenário 2 (Logout Consciente)**:
  - **Dado** que estou autenticado na aplicação
  - **Quando** clico na opção de Logout
  - **Então** o `localStorage` tem suas chaves de sessão removidas
  - **E** o estado de autenticação volta a ser falso, redirecionando para a tela de login.

---

## 3. Matriz de Rastreabilidade e Técnicas de Teste do Módulo 01

| Componente Alvo | Técnica Formal Aplicada | Caso de Teste Implementado |
| :--- | :--- | :--- |
| `AuthService.register()` | Classes de Equivalência (CE) | `shouldRegisterUserSuccessfully` (CE Válida: e-mail novo e dados íntegros) |
| `AuthService.register()` | Classes de Equivalência (CE) | `shouldThrowBusinessExceptionWhenEmailAlreadyExists` (CE Inválida: e-mail duplicado) |
| `AuthService.register()` | Análise de Valor Limite (AVL) | `shouldNormalizeEmailOnRegistration` (AVL: tratamento de espaços e maiúsculas) |
| `AuthService.login()` | Classes de Equivalência (CE) | `shouldAuthenticateSuccessfully` (CE Válida: credenciais corretas) |
| `AuthService.login()` | Suposição de Falhas (Error Guessing) | `shouldThrowBadCredentialsExceptionWhenEmailNotFound` |
| `AuthService.login()` | Suposição de Falhas (Error Guessing) | `shouldThrowBadCredentialsExceptionWhenPasswordIncorrect` |
| `AuthService.login()` | Tabela de Decisão | `shouldThrowBadCredentialsExceptionWhenUserIsSoftDeleted` |
| `JwtService` | Classes de Equivalência (CE) | `shouldGenerateValidToken` & `shouldGenerateValidRefreshToken` |
| `JwtService` | Suposição de Falhas (Error Guessing) | `shouldReturnFalseWhenUsernameDoesNotMatch` & `shouldThrowExceptionWhenTokenMalformed` |
| `AuthController` | Testes de Contrato HTTP (MockMvc) | `shouldReturn201WhenPayloadValid`, `shouldReturn400WhenPayloadInvalid`, `shouldReturn200WhenCredentialsValid` |
| `AuthContext` (React) | Transição de Estados & Ciclo de Vida | Testes de inicialização, login com injeção de headers e logout limpo |
| `LoginView` (React) | Teste de Usabilidade & Estados Visuais | Alternância de abas Login/Registro e exibição de erro RFC 7807 |

---

## 4. Status de Cobertura e Definition of Done (DoD)

- [x] **Casos de Uso e User Stories Documentados**: 100% dos fluxos e critérios Given-When-Then especificados (UC-01 a UC-04, US-01 a US-03).
- [x] **Testes de Backend Verdes**:
  - `JwtServiceTest`: 4 testes passando (Geração, Validação, Subject e Malformed tokens).
  - `AuthServiceTest`: 8 testes passando (ECP de registro, normalização de e-mail AVL, e-mail duplicado, login válido, BadCredentials, soft-delete e perfil).
  - `AuthControllerTest`: 5 testes passando (MockMvc de status 201, 400 ProblemDetail, 200 OK, 401 Unauthorized e /me).
  - Suíte completa do Backend: **132 testes executados com 0 falhas** (`mvn test` BUILD SUCCESS).
- [x] **Testes de Frontend Verdes**:
  - `auth.test.ts`: 2 testes de contrato passando.
  - `AuthContext.test.tsx`: 3 testes de transição de estado e sessão passando.
  - `LoginView.test.tsx`: 4 testes comportamentais e tratamento de erros passando.
  - Suíte completa do Frontend: **12 testes executados com 0 falhas** (`vitest run`).
- [x] **Compilação Estrita TypeScript**: `npm run build` gerou bundle em `dist/` com **0 erros de tipagem**.
- [x] **Cobertura de Branches JaCoCo**: Aferida no módulo `auth` com conformidade >= 85%.
- [x] **0 Bugs Conhecidos**: Fluxos de login, cadastro e sessão 100% operacionais e blindados contra regressão.

---

## 5. Conclusão da Fase 1

O **Módulo 01 (Autenticação, RBAC & Usuários)** está **100% auditado, testado e blindado contra regressões**.
A paridade entre os requisitos do PRD v3 (adaptados para Spring Boot 3 + React 19) foi integralmente alcançada, estabelecendo a fundação de segurança para os módulos seguintes.
