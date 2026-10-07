# Varredura, Auditoria de Paridade e Blindagem QA: Fase 1 (Auth & RBAC) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Executar a primeira fatia vertical completa de varredura, auditoria funcional, testes unitários formais e blindagem de regressão no **Módulo 01: Autenticação & RBAC** (Backend Spring Boot 3 + Frontend React 19), documentando Casos de Uso/User Stories, eliminando gaps e gerando o primeiro dossiê em `docs/auditoria/01-auth-rbac.md` com governança persistente no GSD.

**Architecture:** Abordagem de Fatia Vertical 4D (Discover -> Diagnose -> Defend -> Document). No Backend, assegura segurança stateless via Spring Security com JWT, Bean Validation e mapeamento RFC 7807; no Frontend, blinda o ciclo de vida de autenticação (AuthContext, token persistence e interceptors) e a experiência de login/cadastro em React 19.

**Tech Stack:** Java 21, Spring Boot 3.4.3, Spring Security, jjwt 0.12.6, JUnit 5, Mockito, MockMvc, JaCoCo, React 19, TypeScript, Vitest 3.x, Happy-DOM, TanStack Router.

---

### Mapeamento de Arquivos da Fase 1

- **Documentação & Governança**:
  - Criar: `docs/auditoria/01-auth-rbac.md` (Dossiê do Módulo 01)
  - Modificar: `.planning/STATE.md` (Registro de estado em loop GSD)
- **Backend (Spring Boot 3)**:
  - Existente / Validar: `backend/src/main/java/com/archflow/modules/auth/controller/AuthController.java`
  - Existente / Validar: `backend/src/main/java/com/archflow/modules/auth/service/impl/AuthServiceImpl.java`
  - Existente / Validar: `backend/src/main/java/com/archflow/core/security/JwtServiceImpl.java`
  - Criar Teste: `backend/src/test/java/com/archflow/core/security/JwtServiceTest.java`
  - Existente Teste: `backend/src/test/java/com/archflow/modules/auth/service/AuthServiceTest.java`
  - Existente Teste: `backend/src/test/java/com/archflow/modules/auth/controller/AuthControllerTest.java`
- **Frontend (React 19)**:
  - Existente / Validar: `frontend/src/context/AuthContext.tsx`
  - Existente / Validar: `frontend/src/views/LoginView.tsx`
  - Criar Teste: `frontend/src/tests/AuthContext.test.tsx`
  - Criar Teste: `frontend/src/tests/LoginView.test.tsx`
  - Modificar Teste: `frontend/src/tests/auth.test.ts`

---

### Task 1: Especificação Formal de Casos de Uso (UC) e User Stories (US) do Módulo 01

**Files:**
- Create: `docs/auditoria/01-auth-rbac.md`

- [ ] **Passo 1: Escrever a estrutura inicial do Dossiê com Casos de Uso e User Stories (Gherkin)**

Criar o arquivo `docs/auditoria/01-auth-rbac.md` formalizando os requisitos de negócio adaptados do PRD v3:

```markdown
# 🛡️ Dossiê de Auditoria e QA: Módulo 01 — Autenticação, RBAC & Usuários

- **Data da Auditoria**: 06 de Outubro de 2026
- **Status de Conformidade**: Em Execução (Fase 1)
- **Módulo**: `modules/auth` (Back) & `views/LoginView` / `context/AuthContext` (Front)

---

## 1. Casos de Uso (Use Cases)

### UC-01: Registro de Novo Usuário no Sistema
- **Ator**: Usuário não cadastrado / Administrador.
- **Pré-condições**: E-mail não registrado previamente.
- **Fluxo Principal**:
  1. Usuário informa Nome Completo, E-mail, Senha e Papel (Role).
  2. Sistema valida formato do e-mail e força da senha (mínimo 6 caracteres).
  3. Sistema aplica hash BCrypt na senha e persiste o usuário.
  4. Sistema emite Access Token JWT e Refresh Token.
  5. Retorna código HTTP 201 Created.
- **Fluxos de Exceção**:
  - E-mail já existente: Retorna HTTP 400 Bad Request com ProblemDetail "Já existe um usuário cadastrado...".
  - Dados malformados: Retorna HTTP 400 com mapa de campos inválidos.

### UC-02: Autenticação e Emissão de Token (Login)
- **Ator**: Usuário previamente cadastrado.
- **Pré-condições**: Conta de usuário ativa (`deletedAt == null`).
- **Fluxo Principal**:
  1. Usuário envia credenciais (e-mail e senha).
  2. Sistema autentica credenciais contra hash BCrypt.
  3. Sistema emite Access Token e Refresh Token com claims de usuário e roles.
  4. Retorna HTTP 200 OK com payload de autenticação.
- **Fluxos de Exceção**:
  - Senha incorreta ou e-mail inexistente: Retorna HTTP 401 Unauthorized com ProblemDetail.
  - Usuário inativo ou excluído logicamente: Retorna HTTP 401 Unauthorized ("Usuário inativo ou excluído").

### UC-03: Consulta do Perfil Autenticado (/me)
- **Ator**: Usuário logado.
- **Pré-condições**: Header `Authorization: Bearer <token>` válido.
- **Fluxo Principal**:
  1. Filtro JWT intercepta a requisição e valida a assinatura do token.
  2. Identidade é injetada no SecurityContext.
  3. Endpoint `/api/v1/auth/me` localiza o usuário e retorna `UserResponse` (HTTP 200).

### UC-04: Gerenciamento de Sessão no Frontend
- **Ator**: Arquiteto / Usuário SPA.
- **Fluxo Principal**:
  1. Token JWT é salvo em storage seguro e propagado via headers em chamadas Axios.
  2. Ao recarregar a página, a sessão é restaurada sem deslogar o arquiteto.
  3. Ao acionar Logout, o estado é limpo e o usuário é redirecionado para a tela de login.

---

## 2. Histórias de Usuário (User Stories) com Critérios de Aceite (Gherkin)

### US-01: Registro Seguro com Validação
> *Como um arquiteto ou administrador, quero me cadastrar no ArchFlow ERP para gerenciar projetos do escritório.*

- **Cenário 1 (CE Válida)**:
  - **Dado** que envio um nome "Carlos Silva", e-mail inédito "carlos@archflow.com" e senha forte "Senha@123"
  - **Quando** solicito o registro na API
  - **Então** recebo status 201 Created com os tokens JWT e os dados do usuário.

- **Cenário 2 (CE Inválida - E-mail duplicado)**:
  - **Dado** que o e-mail "carlos@archflow.com" já está cadastrado
  - **Quando** tento me registrar com este mesmo e-mail
  - **Então** recebo status 400 Bad Request informando duplicidade.

### US-02: Login e Proteção Contra Credenciais Inválidas
> *Como usuário cadastrado, quero informar meu e-mail e senha para acessar o painel de projetos.*

- **Cenário 1 (Credenciais Corretas)**:
  - **Dado** que possuo conta ativa com e-mail "admin@archflow.com" e senha "Admin@123456"
  - **Quando** submeto o formulário de login
  - **Então** sou autenticado com sucesso e redirecionado ao Dashboard.

- **Cenário 2 (Credenciais Incorretas - Error Guessing)**:
  - **Dado** que informo uma senha incorreta
  - **Quando** submeto a tentativa de login
  - **Então** recebo erro 401 com mensagem amigável "E-mail ou senha inválidos."
```

- [ ] **Passo 2: Verificar a criação do dossiê**

Validar que o arquivo foi gravado corretamente em `docs/auditoria/01-auth-rbac.md`.

---

### Task 2: Blindagem e Testes Unitários de Token e Segurança (JwtService)

**Files:**
- Create: `backend/src/test/java/com/archflow/core/security/JwtServiceTest.java`

- [ ] **Passo 1: Escrever o teste unitário formal do JwtService (com técnicas ECP, AVL e Error Guessing)**

Criar o arquivo `backend/src/test/java/com/archflow/core/security/JwtServiceTest.java`:

```java
package com.archflow.core.security;

import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService Formal Unit & Security Tests")
class JwtServiceTest {

    private JwtServiceImpl jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl();
        // Chave secreta de 256 bits para testes
        String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        ReflectionTestUtils.setField(jwtService, "secretKey", testSecret);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 3600000L); // 1 hora
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 86400000L); // 24 horas

        testUser = User.builder()
                .fullName("Mariana Arquiteta")
                .email("mariana@archflow.com")
                .passwordHash("hashedPass")
                .role(Role.OWNER)
                .build();
        testUser.setId("usr-001");
        testUser.setCreatedAt(LocalDateTime.now());
    }

    @Nested
    @DisplayName("Técnica ECP: Geração e Validação de Access Token")
    class AccessTokenTests {

        @Test
        @DisplayName("ECP Partição Válida: Deve gerar token válido contendo email como subject")
        void shouldGenerateValidToken() {
            String token = jwtService.generateToken(testUser);

            assertThat(token).isNotBlank();
            assertThat(jwtService.extractUsername(token)).isEqualTo("mariana@archflow.com");
            assertThat(jwtService.isTokenValid(token, testUser)).isTrue();
        }

        @Test
        @DisplayName("ECP Partição Válida: Deve gerar refresh token válido com subject do usuário")
        void shouldGenerateValidRefreshToken() {
            String refreshToken = jwtService.generateRefreshToken(testUser);

            assertThat(refreshToken).isNotBlank();
            assertThat(jwtService.extractUsername(refreshToken)).isEqualTo("mariana@archflow.com");
            assertThat(jwtService.isTokenValid(refreshToken, testUser)).isTrue();
        }
    }

    @Nested
    @DisplayName("Técnica Error Guessing: Tokens Corrompidos ou Divergentes")
    class ErrorGuessingTests {

        @Test
        @DisplayName("Error Guessing: Deve invalidar token quando o usuário verificado for diferente do subject")
        void shouldReturnFalseWhenUsernameDoesNotMatch() {
            String token = jwtService.generateToken(testUser);

            User anotherUser = User.builder()
                    .fullName("Outro Usuário")
                    .email("outro@archflow.com")
                    .passwordHash("hashedPass")
                    .role(Role.VIEWER)
                    .build();

            assertThat(jwtService.isTokenValid(token, anotherUser)).isFalse();
        }

        @Test
        @DisplayName("Error Guessing: Deve falhar ao tentar extrair dados de token com assinatura forjada")
        void shouldThrowExceptionWhenTokenMalformed() {
            String malformedToken = "eyJhbGciOiJIUzI1NiJ9.malformedPayload.invalidSignature";

            assertThatThrownBy(() -> jwtService.extractUsername(malformedToken))
                    .isInstanceOf(Exception.class);
        }
    }
}
```

- [ ] **Passo 2: Executar o teste do JwtService**

Executar comando:
```bash
mvn -f backend/pom.xml test -Dtest=JwtServiceTest
```
Esperado: `Tests run: 4, Failures: 0, Errors: 0, Skipped: 0` e `BUILD SUCCESS`.

---

### Task 3: Testes de Ciclo de Vida e Sessão no Frontend (AuthContext)

**Files:**
- Create: `frontend/src/tests/AuthContext.test.tsx`

- [ ] **Passo 1: Escrever testes unitários para o AuthContext cobrindo armazenamento de token, login, logout e persistência**

Criar `frontend/src/tests/AuthContext.test.tsx`:

```tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { api } from '../services/api';

vi.mock('../services/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    defaults: {
      headers: {
        common: {} as Record<string, string>,
      },
    },
  },
}));

describe('AuthContext - Gestão de Estado e Ciclo de Sessão', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it('Transição de Estado: deve iniciar não autenticado quando não há token no localStorage', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('ECP Válido: deve autenticar com sucesso, armazenar token e injetar no header axios', async () => {
    const mockAuthResponse = {
      data: {
        accessToken: 'mock-valid-jwt-token',
        tokenType: 'Bearer',
        user: {
          id: 'usr-001',
          fullName: 'Arquiteto Sênior',
          email: 'arquiteto@archflow.com',
          role: 'ROLE_ARCHITECT',
        },
      },
    };

    (api.post as any).mockResolvedValueOnce(mockAuthResponse);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login({ email: 'arquiteto@archflow.com', password: 'senhaForte123' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('mock-valid-jwt-token');
    expect(result.current.user?.email).toBe('arquiteto@archflow.com');
    expect(localStorage.getItem('archflow_token')).toBe('mock-valid-jwt-token');
  });

  it('Transição de Estado: logout deve remover token do storage e zerar autenticação', async () => {
    localStorage.setItem('archflow_token', 'initial-token');
    localStorage.setItem(
      'archflow_user',
      JSON.stringify({ id: 'usr-1', email: 'test@archflow.com', name: 'User', role: 'ROLE_ADMIN' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('archflow_token')).toBeNull();
  });
});
```

- [ ] **Passo 2: Executar os testes de AuthContext no Vitest**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/AuthContext.test.tsx
```
Esperado: 3 testes passando com sucesso.

---

### Task 4: Testes de Interface e Tratamento de Erros da View de Login (LoginView)

**Files:**
- Create: `frontend/src/tests/LoginView.test.tsx`

- [ ] **Passo 1: Escrever testes unitários e comportamentais para LoginView**

Criar `frontend/src/tests/LoginView.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginView } from '../views/LoginView';
import { useAuth } from '../context/AuthContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

describe('LoginView - Experiência do Usuário e Tratamento de Erros', () => {
  const mockLogin = vi.fn();
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      isAuthenticated: false,
    });
  });

  it('deve renderizar campos de e-mail e senha por padrão no modo login', () => {
    render(<LoginView />);

    expect(screen.getByText('ArchFlow ERP')).toBeDefined();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeDefined();
    expect(screen.getByPlaceholderText('••••••••')).toBeDefined();
    expect(screen.getByRole('button', { name: /Entrar na Plataforma/i })).toBeDefined();
  });

  it('Transição de Estados: deve alternar entre modo Login e modo Cadastro', () => {
    render(<LoginView />);

    const toggleButton = screen.getByText(/Criar uma conta agora/i);
    fireEvent.click(toggleButton);

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeDefined();
    expect(screen.getByRole('button', { name: /Criar Conta Corporativa/i })).toBeDefined();
  });

  it('Error Guessing: deve exibir banner de erro amigável quando o login falha', async () => {
    mockLogin.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'E-mail ou senha inválidos.',
        },
      },
    });

    render(<LoginView />);

    const submitBtn = screen.getByRole('button', { name: /Entrar na Plataforma/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeDefined();
    });
  });
});
```

- [ ] **Passo 2: Executar os testes do LoginView**

Executar comando:
```bash
npm run test --prefix frontend -- src/tests/LoginView.test.tsx
```
Esperado: 3 testes passando com sucesso.

---

### Task 5: Consolidação do Dossiê do Módulo 01 e Atualização do GSD

**Files:**
- Modify: `docs/auditoria/01-auth-rbac.md`
- Modify: `.planning/STATE.md`

- [ ] **Passo 1: Rodar a suíte completa de testes do Backend e Frontend**

Executar backend:
```bash
mvn -f backend/pom.xml test
```
Esperado: 100% dos testes verdes (138+ testes) e cobertura JaCoCo no módulo auth >= 85%.

Executar frontend:
```bash
npm run test --prefix frontend
```
Esperado: 100% dos testes verdes (11+ testes).

- [ ] **Passo 2: Atualizar o dossiê `docs/auditoria/01-auth-rbac.md` com a Matriz de Testes e DoD preenchido**

Adicionar as seções finais ao dossiê:
- Catálogo de Testes Implementados (classes e técnicas associadas).
- Resultado das coberturas medidas (JaCoCo & Vitest).
- Checklist de Definition of Done (DoD) com 100% de itens ticados.

- [ ] **Passo 3: Atualizar o GSD em `.planning/STATE.md`**

Registrar o progresso no `.planning/STATE.md`:
- Módulo 01 (Auth & RBAC): 100% Auditado, Testado e Documentado.
- Próximo Módulo ativo: Módulo 02 (Clientes & CRM).
