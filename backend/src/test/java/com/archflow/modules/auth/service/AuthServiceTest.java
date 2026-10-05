package com.archflow.modules.auth.service;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.core.security.JwtService;
import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.dto.AuthResponse;
import com.archflow.modules.auth.dto.LoginRequest;
import com.archflow.modules.auth.dto.RegisterRequest;
import com.archflow.modules.auth.dto.UserResponse;
import com.archflow.modules.auth.entity.User;
import com.archflow.modules.auth.mapper.UserMapper;
import com.archflow.modules.auth.repository.UserRepository;
import com.archflow.modules.auth.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService Unit & Formal QA Tests")
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private UserResponse sampleUserResponse;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .fullName("Carlos Arquiteto")
                .email("carlos@archflow.com")
                .passwordHash("$2a$12$hashedPasswordSample")
                .role(Role.OWNER)
                .build();
        sampleUser.setId("usr-12345");
        sampleUser.setCreatedAt(LocalDateTime.now());

        sampleUserResponse = new UserResponse(
                "usr-12345",
                "Carlos Arquiteto",
                "carlos@archflow.com",
                Role.OWNER,
                sampleUser.getCreatedAt()
        );
    }

    @Nested
    @DisplayName("Técnica ECP & BVA: Registro de Usuário (register)")
    class RegisterTests {

        @Test
        @DisplayName("ECP Partição Válida: Deve registrar usuário com sucesso quando e-mail é inédito e dados são válidos")
        void shouldRegisterUserSuccessfully() {
            // Arrange
            RegisterRequest request = new RegisterRequest("Carlos Arquiteto", "carlos@archflow.com", "senhaForte123", Role.OWNER);

            when(userRepository.existsByEmail("carlos@archflow.com")).thenReturn(false);
            when(passwordEncoder.encode("senhaForte123")).thenReturn("$2a$12$hashedPasswordSample");
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);
            when(jwtService.generateToken(sampleUser)).thenReturn("access-token-xyz");
            when(jwtService.generateRefreshToken(sampleUser)).thenReturn("refresh-token-xyz");
            when(userMapper.toResponse(sampleUser)).thenReturn(sampleUserResponse);

            // Act
            AuthResponse response = authService.register(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("access-token-xyz");
            assertThat(response.refreshToken()).isEqualTo("refresh-token-xyz");
            assertThat(response.tokenType()).isEqualTo("Bearer");
            assertThat(response.user()).isEqualTo(sampleUserResponse);

            verify(userRepository).save(any(User.class));
        }

        @Test
        @DisplayName("BVA Normalização de Limite: Deve normalizar e-mail com espaços e maiúsculas")
        void shouldNormalizeEmailOnRegistration() {
            // Arrange - e-mail com espaços e maiúsculas
            RegisterRequest request = new RegisterRequest("Carlos Arquiteto", "   CARLOS@ArchFlow.COM   ", "senhaForte123", null);

            when(userRepository.existsByEmail("carlos@archflow.com")).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("hashed");
            when(userRepository.save(any(User.class))).thenReturn(sampleUser);
            when(jwtService.generateToken(any())).thenReturn("token");
            when(jwtService.generateRefreshToken(any())).thenReturn("refresh");
            when(userMapper.toResponse(any())).thenReturn(sampleUserResponse);

            // Act
            authService.register(request);

            // Assert
            verify(userRepository).existsByEmail("carlos@archflow.com");
        }

        @Test
        @DisplayName("ECP Partição Inválida: Deve lançar BusinessException quando e-mail já estiver cadastrado")
        void shouldThrowBusinessExceptionWhenEmailAlreadyExists() {
            // Arrange
            RegisterRequest request = new RegisterRequest("Outro Nome", "carlos@archflow.com", "senhaForte123", Role.EDITOR);
            when(userRepository.existsByEmail("carlos@archflow.com")).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.register(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("Já existe um usuário cadastrado com o e-mail: carlos@archflow.com");

            verify(userRepository, never()).save(any(User.class));
        }
    }

    @Nested
    @DisplayName("Técnica ECP & Tabela de Decisão: Autenticação de Usuário (login)")
    class LoginTests {

        @Test
        @DisplayName("ECP Partição Válida: Deve autenticar com sucesso quando credenciais estiverem corretas")
        void shouldAuthenticateSuccessfully() {
            // Arrange
            LoginRequest request = new LoginRequest("carlos@archflow.com", "senhaCorreta123");

            when(userRepository.findByEmailAndDeletedAtIsNull("carlos@archflow.com")).thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("senhaCorreta123", sampleUser.getPasswordHash())).thenReturn(true);
            when(jwtService.generateToken(sampleUser)).thenReturn("access-token-login");
            when(jwtService.generateRefreshToken(sampleUser)).thenReturn("refresh-token-login");
            when(userMapper.toResponse(sampleUser)).thenReturn(sampleUserResponse);

            // Act
            AuthResponse response = authService.login(request);

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.accessToken()).isEqualTo("access-token-login");
            assertThat(response.user().email()).isEqualTo("carlos@archflow.com");
        }

        @Test
        @DisplayName("ECP Partição Inválida 1: Deve lançar BadCredentialsException quando e-mail não existir")
        void shouldThrowBadCredentialsExceptionWhenEmailNotFound() {
            // Arrange
            LoginRequest request = new LoginRequest("inexistente@archflow.com", "qualquerSenha");
            when(userRepository.findByEmailAndDeletedAtIsNull("inexistente@archflow.com")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("E-mail ou senha inválidos.");
        }

        @Test
        @DisplayName("ECP Partição Inválida 2: Deve lançar BadCredentialsException quando a senha estiver incorreta")
        void shouldThrowBadCredentialsExceptionWhenPasswordIncorrect() {
            // Arrange
            LoginRequest request = new LoginRequest("carlos@archflow.com", "senhaErrada");

            when(userRepository.findByEmailAndDeletedAtIsNull("carlos@archflow.com")).thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("senhaErrada", sampleUser.getPasswordHash())).thenReturn(false);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("E-mail ou senha inválidos.");
        }

        @Test
        @DisplayName("Tabela de Decisão: Usuário excluído (deletedAt != null) não deve conseguir logar")
        void shouldThrowBadCredentialsExceptionWhenUserIsSoftDeleted() {
            // Arrange
            sampleUser.markAsDeleted(); // deletedAt = now
            LoginRequest request = new LoginRequest("carlos@archflow.com", "senhaCorreta123");

            when(userRepository.findByEmailAndDeletedAtIsNull("carlos@archflow.com")).thenReturn(Optional.of(sampleUser));
            when(passwordEncoder.matches("senhaCorreta123", sampleUser.getPasswordHash())).thenReturn(true);

            // Act & Assert
            assertThatThrownBy(() -> authService.login(request))
                    .isInstanceOf(BadCredentialsException.class)
                    .hasMessage("Usuário inativo ou excluído.");
        }
    }

    @Nested
    @DisplayName("Perfil do Usuário Autenticado (getCurrentUser)")
    class CurrentUserTests {

        @Test
        @DisplayName("Deve retornar perfil do usuário quando e-mail existir")
        void shouldReturnCurrentUserProfile() {
            // Arrange
            when(userRepository.findByEmailAndDeletedAtIsNull("carlos@archflow.com")).thenReturn(Optional.of(sampleUser));
            when(userMapper.toResponse(sampleUser)).thenReturn(sampleUserResponse);

            // Act
            UserResponse response = authService.getCurrentUser("carlos@archflow.com");

            // Assert
            assertThat(response).isNotNull();
            assertThat(response.id()).isEqualTo("usr-12345");
            assertThat(response.fullName()).isEqualTo("Carlos Arquiteto");
        }

        @Test
        @DisplayName("Deve lançar ResourceNotFoundException quando usuário não for encontrado")
        void shouldThrowResourceNotFoundExceptionWhenUserNotFound() {
            // Arrange
            when(userRepository.findByEmailAndDeletedAtIsNull("inexistente@archflow.com")).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> authService.getCurrentUser("inexistente@archflow.com"))
                    .isInstanceOf(ResourceNotFoundException.class)
                    .hasMessageContaining("Usuário não encontrado com email: 'inexistente@archflow.com'");
        }
    }
}
