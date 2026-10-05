# Fase 1: Migração Monorepo Desacoplado - Infraestrutura, Core & Módulo Auth

> **Para agentes executores:** SUB-SKILL OBRIGATÓRIA: Use `superpowers:subagent-driven-development` (recomendado) ou `superpowers:executing-plans` para implementar este plano tarefa por tarefa. As etapas utilizam a sintaxe de caixas de seleção (`- [ ]`) para rastreamento atômico.

**Objetivo:** Estruturar o Monorepo desacoplado com `/backend` (Java 21 LTS / Spring Boot 3.4 / Maven / Flyway / Spring Security JWT) e preparar `/frontend` (Vite SPA React 19 TypeScript), implementando a camada `core` e o módulo `auth` com cobertura mínima de 85% de linhas e branches no JaCoCo e testes formais com técnicas de QA (Classes de Equivalência, Valor Limite e Tabela de Decisão).

**Arquitetura:** Padrão Modular Package-by-Feature (`com.archflow.modules.<feature>`) com camadas internas coesas (`controller`, `service`, `entity`, `repository`, `dto` com Records imutáveis e `mapper` com MapStruct), camada transversal `com.archflow.core` (ProblemDetail RFC 7807, Auditoria, Swagger OpenAPI 3) e segurança stateless JWT com Spring Security 6.

**Tech Stack:** Java 21 LTS, Spring Boot 3.4.x, Spring Data JPA, Spring Security 6, JJWT (io.jsonwebtoken 0.12.6), PostgreSQL 16, Flyway Migration, MapStruct 1.6, Lombok, Jakarta Validation, Springdoc OpenAPI 2.8, JUnit 5, Mockito, AssertJ, JaCoCo Maven Plugin (gate fail-on-violation para 85%+).

---

## 📁 Estrutura de Diretórios do Monorepo

```
erp_archflow_arquiteture/
├── docker-compose.yml               # Container PostgreSQL (porta local 5436 -> 5432)
├── .gitignore                       # Ignora targets, node_modules, .storage, envs
├── backend/                         # Módulo Backend Java 21 + Spring Boot 3
│   ├── pom.xml                      # Gerenciador de dependências Maven + JaCoCo 85%
│   └── src/
│       ├── main/
│       │   ├── java/com/archflow/
│       │   │   ├── ArchflowApplication.java
│       │   │   ├── core/                    # Módulo Transversal / Infra
│       │   │   │   ├── domain/              # BaseEntity, AuditableEntity
│       │   │   │   ├── exception/           # GlobalExceptionHandler, ProblemDetail RFC 7807
│       │   │   │   ├── config/              # OpenApiConfig, AuditorAwareConfig
│       │   │   │   └── security/            # JwtService, JwtFilter, SecurityConfig, CurrentUser
│       │   │   └── modules/
│       │   │       └── auth/                # Módulo de Autenticação (Feature)
│       │   │           ├── controller/      # AuthController
│       │   │           ├── service/         # AuthService, AuthServiceImpl
│       │   │           ├── entity/          # User (JPA)
│       │   │           ├── domain/          # Role (Enum: OWNER, EDITOR, VIEWER)
│       │   │           ├── repository/      # UserRepository
│       │   │           ├── dto/             # LoginRequest, RegisterRequest, AuthResponse, UserResponse
│       │   │           └── mapper/          # UserMapper (MapStruct)
│       │   └── resources/
│       │       ├── application.yml          # Configuração padrão (dev / porta 8080)
│       │       ├── application-test.yml     # Profile de testes contra Postgres 5436
│       │       └── db/migration/
│       │           └── V1__init_auth_schema.sql  # DDL inicial Flyway (users, enums, etc.)
│       └── test/
│           └── java/com/archflow/
│               ├── core/
│               │   └── exception/GlobalExceptionHandlerTest.java
│               └── modules/auth/
│                   ├── service/AuthServiceTest.java       # ECP, BVA, Tabela de Decisão
│                   ├── security/JwtServiceTest.java       # Validação, Expiração, Claims
│                   ├── controller/AuthControllerTest.java # MockMvc, WebMvcTest, RFC 7807
│                   └── repository/UserRepositoryIT.java   # Integração JPA + Postgres
└── frontend/                        # Módulo Frontend SPA (Vite + React 19 + TypeScript)
    └── (Estrutura base preparada para a Fase 6)
```

---

## 📋 Lista de Tarefas de Implementação

### Tarefa 1: Estruturação Inicial do Monorepo e Workspace

**Objetivo:** Criar os diretórios raiz `/backend` e `/frontend`, atualizar o `.gitignore` para ignorar artefatos de build do Maven (`backend/target/`) e garantir que a raiz permaneça limpa e orquestrada.

**Arquivos:**
- Modificar: `.gitignore`
- Criar: `backend/` (diretório base)
- Criar: `frontend/` (diretório base com `.gitkeep`)

**Passos:**
- [ ] Atualizar `.gitignore` adicionando as regras do ecossistema Java/Maven (`**/target/`, `backend/.flattened-pom.xml`, `.mvn/timing.properties`, `.project`, `.classpath`, `.settings/`).
- [ ] Criar a estrutura física de pastas `backend/src/main/java/com/archflow`, `backend/src/main/resources`, `backend/src/test/java/com/archflow` e `frontend/`.
- [ ] Verificar com `git status` que a estrutura de diretórios foi devidamente reconhecida.

---

### Tarefa 2: Configuração do `backend/pom.xml` e Gate JaCoCo 85%

**Objetivo:** Configurar o `pom.xml` com Spring Boot 3.4.3, Java 21, dependências completas e plugin JaCoCo configurado para quebrar o build (`fail-on-violation`) se as linhas ou branches das regras de negócio tiverem cobertura inferior a 85%.

**Arquivos:**
- Criar: `backend/pom.xml`

**Dependências Principais:**
- `spring-boot-starter-web`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-security`
- `spring-boot-starter-validation`
- `org.postgresql:postgresql`
- `org.flywaydb:flyway-core` & `org.flywaydb:flyway-database-postgresql`
- `org.projectlombok:lombok` (escopo provided)
- `org.mapstruct:mapstruct` (1.6.3) & `mapstruct-processor`
- `io.jsonwebtoken:jjwt-api`, `jjwt-impl`, `jjwt-jackson` (0.12.6)
- `org.springdoc:springdoc-openapi-starter-webmvc-ui` (2.8.5)
- `spring-boot-starter-test` (JUnit 5, Mockito, AssertJ)
- `org.springframework.security:spring-security-test`
- `jacoco-maven-plugin` com regra `BUNDLE`:
  - `COUNTER: LINE`, `VALUE: COVEREDRATIO`, `MINIMUM: 0.85`
  - `COUNTER: BRANCH`, `VALUE: COVEREDRATIO`, `MINIMUM: 0.85`
  - `excludes`: `**/dto/**`, `**/config/**`, `**/*MapperImpl.java`, `**/*Application.java`

**Passos:**
- [ ] Criar `backend/pom.xml` com toda a árvore de dependências e configuração do plugin `jacoco-maven-plugin`.
- [ ] Executar `mvn -f backend/pom.xml validate` para validar sintaxe e resolução de dependências.

---

### Tarefa 3: Configuração dos Profiles do Spring Boot (`application.yml` e `application-test.yml`)

**Objetivo:** Configurar as propriedades de conexão com o PostgreSQL existente na porta local 5436, habilitar Flyway, logs estruturados e definir as variáveis de JWT (`jwt.secret`, `jwt.expiration`, etc.).

**Arquivos:**
- Criar: `backend/src/main/resources/application.yml`
- Criar: `backend/src/main/resources/application-test.yml`

**Configurações:**
- Porta do servidor: `8080` (context-path opcional: `/`)
- Datasource: `jdbc:postgresql://localhost:5436/archflow`, user `archflow`, pass `archflow_secret`
- JPA: `hibernate.ddl-auto: validate` (schema sempre gerenciado exclusivamente pelo Flyway)
- Flyway: `enabled: true`, `locations: classpath:db/migration`
- JWT:
  - `archflow.jwt.secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` (chave HMAC-SHA256 256 bits)
  - `archflow.jwt.expiration-ms: 86400000` (24 horas)
  - `archflow.jwt.refresh-expiration-ms: 604800000` (7 dias)
- Test profile (`application-test.yml`):
  - Conexão com o banco de teste, logs em nível INFO/DEBUG para testes.

**Passos:**
- [ ] Criar `backend/src/main/resources/application.yml`.
- [ ] Criar `backend/src/main/resources/application-test.yml`.

---

### Tarefa 4: Migração Inicial do Schema com Flyway (`V1__init_auth_schema.sql`)

**Objetivo:** Criar o script SQL de migração da tabela `users` mantendo compatibilidade direta com a tabela do PostgreSQL atual (gerada anteriormente pelo Prisma).

**Arquivos:**
- Criar: `backend/src/main/resources/db/migration/V1__init_auth_schema.sql`

**Definição do Schema:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'VIEWER',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_deleted_at ON users(deleted_at);
```

**Passos:**
- [ ] Criar o script `V1__init_auth_schema.sql`.
- [ ] Validar a integridade dos nomes de colunas comparando com `prisma/schema.prisma` (`full_name`, `email`, `password_hash`, `role`, `created_at`, `updated_at`, `deleted_at`).

---

### Tarefa 5: Camada Compartilhada Core (`com.archflow.core`)

**Objetivo:** Implementar a infraestrutura transversal de domínio, tratamento global de erros (RFC 7807), auditoria e documentação Swagger.

**Arquivos:**
- Criar: `backend/src/main/java/com/archflow/ArchflowApplication.java`
- Criar: `backend/src/main/java/com/archflow/core/domain/BaseEntity.java`
- Criar: `backend/src/main/java/com/archflow/core/exception/BusinessException.java`
- Criar: `backend/src/main/java/com/archflow/core/exception/ResourceNotFoundException.java`
- Criar: `backend/src/main/java/com/archflow/core/exception/UnauthorizedException.java`
- Criar: `backend/src/main/java/com/archflow/core/exception/GlobalExceptionHandler.java` (RFC 7807 ProblemDetail)
- Criar: `backend/src/main/java/com/archflow/core/config/OpenApiConfig.java` (Swagger Bearer Auth)
- Criar: `backend/src/test/java/com/archflow/core/exception/GlobalExceptionHandlerTest.java`

**Padrões Técnicos:**
- `BaseEntity`: `@MappedSuperclass` com `id` (UUID), `createdAt`, `updatedAt`, `deletedAt` e métodos `isDeleted()`.
- `GlobalExceptionHandler`: Usa o `ProblemDetail` nativo do Spring 6 / RFC 7807:
  - `@ExceptionHandler(MethodArgumentNotValidException.class)`: Retorna status 400 com lista de erros de validação nos campos (`invalidParams`).
  - `@ExceptionHandler(BusinessException.class)`: Retorna status 400 ou 422 com mensagem de regra violada.
  - `@ExceptionHandler(ResourceNotFoundException.class)`: Retorna status 404 Not Found.
  - `@ExceptionHandler(BadCredentialsException.class)`: Retorna status 401 Unauthorized.
  - `@ExceptionHandler(Exception.class)`: Retorna status 500 com log mascarado.

**Passos:**
- [ ] Criar `ArchflowApplication.java` com `@SpringBootApplication` e `@EnableJpaAuditing`.
- [ ] Criar `BaseEntity.java` e as classes de exceção do domínio.
- [ ] Criar `GlobalExceptionHandler.java`.
- [ ] Criar `OpenApiConfig.java` configurando títulos, versão e SecurityScheme Bearer JWT.
- [ ] Criar testes unitários para `GlobalExceptionHandlerTest.java` garantindo cobertura do tratamento de erros.

---

### Tarefa 6: Módulo de Autenticação (`com.archflow.modules.auth`)

**Objetivo:** Implementar o fluxo completo de registro, login, validação de tokens JWT e verificação do usuário atual com padrão Layer-by-Feature, SOLID e Records imutáveis.

**Arquivos:**
- Criar: `backend/src/main/java/com/archflow/modules/auth/domain/Role.java` (Enum: OWNER, EDITOR, VIEWER)
- Criar: `backend/src/main/java/com/archflow/modules/auth/entity/User.java` (JPA Entity mapeando `users`)
- Criar: `backend/src/main/java/com/archflow/modules/auth/repository/UserRepository.java`
- Criar: `backend/src/main/java/com/archflow/modules/auth/dto/RegisterRequest.java` (Record com Bean Validation)
- Criar: `backend/src/main/java/com/archflow/modules/auth/dto/LoginRequest.java` (Record com Bean Validation)
- Criar: `backend/src/main/java/com/archflow/modules/auth/dto/AuthResponse.java` (Record com token, refreshToken, user)
- Criar: `backend/src/main/java/com/archflow/modules/auth/dto/UserResponse.java` (Record de saída)
- Criar: `backend/src/main/java/com/archflow/modules/auth/mapper/UserMapper.java` (MapStruct)
- Criar: `backend/src/main/java/com/archflow/core/security/JwtService.java`
- Criar: `backend/src/main/java/com/archflow/core/security/JwtAuthenticationFilter.java`
- Criar: `backend/src/main/java/com/archflow/core/security/SecurityConfig.java`
- Criar: `backend/src/main/java/com/archflow/modules/auth/service/AuthService.java`
- Criar: `backend/src/main/java/com/archflow/modules/auth/service/impl/AuthServiceImpl.java`
- Criar: `backend/src/main/java/com/archflow/modules/auth/controller/AuthController.java`

**Regras de Negócio e SOLID:**
- **Single Responsibility (SRP):** `AuthService` gerencia exclusivamente credenciais e regras de acesso; `JwtService` é responsável único pela criptografia e emissão de tokens.
- **Dependency Inversion (DIP):** O controller e serviços dependem de interfaces (`AuthService`, `UserRepository`).
- **Imutabilidade:** Todos os DTOs utilizam `record` do Java 21 com anotações `@NotBlank`, `@Email`, `@Size(min = 8)`.
- **Criptografia:** Senhas sempre hashadas com `BCryptPasswordEncoder(12)`.
- **Segurança:** Bloqueio de e-mails duplicados com mensagem amigável no padrão RFC 7807.

**Passos:**
- [ ] Implementar `Role.java` e `User.java`.
- [ ] Implementar `UserRepository.java` com métodos `findByEmail(String email)` e `existsByEmail(String email)`.
- [ ] Implementar Records de DTO e `UserMapper.java`.
- [ ] Implementar `JwtService.java` com métodos `generateToken(User user)`, `generateRefreshToken(User user)`, `extractUsername(String token)`, `isTokenValid(String token, UserDetails userDetails)`.
- [ ] Implementar `JwtAuthenticationFilter.java` interceptando headers `Bearer <token>` e registrando `UsernamePasswordAuthenticationToken` no `SecurityContextHolder`.
- [ ] Implementar `SecurityConfig.java` configurando CORS, `SessionCreationPolicy.STATELESS` e permissões de rotas.
- [ ] Implementar `AuthService` e `AuthServiceImpl`.
- [ ] Implementar `AuthController` com endpoints:
  - `POST /api/v1/auth/register` (201 Created)
  - `POST /api/v1/auth/login` (200 OK)
  - `GET /api/v1/auth/me` (200 OK - protegido por Bearer Token)

---

### Tarefa 7: Suíte de Testes Formais de QA com Cobertura >= 85%

**Objetivo:** Garantir a qualidade do módulo com testes unitários, testes de controller MockMvc e testes de integração de repositório, aplicando rigorosamente as técnicas de QA: Classes de Equivalência (ECP), Análise de Valor Limite (BVA) e Tabela de Decisão.

**Arquivos:**
- Criar: `backend/src/test/java/com/archflow/core/security/JwtServiceTest.java`
- Criar: `backend/src/test/java/com/archflow/modules/auth/service/AuthServiceTest.java`
- Criar: `backend/src/test/java/com/archflow/modules/auth/controller/AuthControllerTest.java`
- Criar: `backend/src/test/java/com/archflow/modules/auth/repository/UserRepositoryIT.java`

**Técnicas de QA Aplicadas nos Testes:**
1. **Classes de Equivalência (ECP):**
   - *Login:* Partição Válida (credenciais corretas) ➔ 200 OK + JWT.
   - *Login:* Partição Inválida 1 (e-mail inexistente) ➔ 401 BadCredentialsException.
   - *Login:* Partição Inválida 2 (senha incorreta) ➔ 401 BadCredentialsException.
   - *Registro:* Partição Válida (dados válidos e e-mail inédito) ➔ 201 Created.
   - *Registro:* Partição Inválida (e-mail já cadastrado) ➔ 400 BusinessException.
2. **Análise de Valor Limite (BVA):**
   - *Senha no Registro:* Limite inferior exato (8 caracteres) ➔ Aceito.
   - *Senha no Registro:* Limite inferior - 1 (7 caracteres) ➔ Rejeitado com validação Bean Validation.
   - *Token Expirado:* 1ms antes da expiração ➔ Válido; 1ms após expiração ➔ ExpiredJwtException.
3. **Tabela de Decisão:**
   - Combinação de Status do Usuário (`deletedAt == null` vs `deletedAt != null`) e Role (`OWNER`, `EDITOR`, `VIEWER`). Usuário excluído logicamente não pode logar mesmo com senha correta.

**Passos:**
- [ ] Escrever `JwtServiceTest.java` cobrindo geração, assinatura, validação, extração de roles e rejeição de tokens expirados/adulterados.
- [ ] Escrever `AuthServiceTest.java` com Mockito e AssertJ cobrindo 100% dos caminhos de decisão (branches) de registro, login e busca do perfil.
- [ ] Escrever `AuthControllerTest.java` com `@WebMvcTest` testando serialização JSON, validação de payload inválido (RFC 7807 ProblemDetail) e status codes HTTP.
- [ ] Escrever `UserRepositoryIT.java` validando persistência, busca por e-mail e constraints de unicidade no banco de dados.

---

### Tarefa 8: Verificação do Gate de Cobertura JaCoCo e Execução Contínua

**Objetivo:** Executar o ciclo completo do Maven (`mvn clean verify`) no módulo `/backend` para validar que todas as migrações Flyway são executadas com sucesso, todos os testes passam sem falhas e a cobertura mínima de 85% em Linhas e Branches é atingida.

**Comando de Execução:**
```bash
mvn -f backend/pom.xml clean verify
```

**Critérios de Sucesso:**
- [ ] `BUILD SUCCESS` no Maven sem nenhum warning fatal.
- [ ] 100% dos testes unitários e de integração passando.
- [ ] Relatório JaCoCo gerado em `backend/target/site/jacoco/index.html`.
- [ ] Cobertura de regras de negócio (`service`) acima de 85% em Linhas e Branches.
- [ ] O backend sobe e responde no endpoint `http://localhost:8080/swagger-ui/index.html`.

---

## 🎯 Próximos Passos (Após Fase 1)
- **Fase 2:** Módulo de Clientes (`com.archflow.modules.client`) com validações de CPF/CNPJ, endereços e histórico de interações.
- **Fase 3:** Módulo de Projetos e Kanban (`com.archflow.modules.project`) com gestão de tarefas, prazos e horas trabalhadas.
- **Fase 4:** Módulo de Vistorias Técnicas e Punch List (`com.archflow.modules.inspection`) com geração de relatórios PDF.
- **Fase 5:** Módulos de Agenda e Financeiro (`com.archflow.modules.schedule` e `com.archflow.modules.financial`).
- **Fase 6:** Frontend SPA Vite + React 19 + TypeScript consumindo todos os módulos via API REST.
