package com.archflow.modules.auth.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.dto.AuthResponse;
import com.archflow.modules.auth.dto.LoginRequest;
import com.archflow.modules.auth.dto.RegisterRequest;
import com.archflow.modules.auth.dto.UserResponse;
import com.archflow.modules.auth.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("AuthController Web Layer Tests")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    @Nested
    @DisplayName("Endpoint POST /api/v1/auth/register")
    class RegisterEndpointTests {

        @Test
        @DisplayName("Deve retornar 201 Created quando o payload for válido")
        void shouldReturn201WhenPayloadValid() throws Exception {
            // Arrange
            RegisterRequest request = new RegisterRequest("Mariana Lima", "mariana@archflow.com", "senhaForte123", Role.EDITOR);
            UserResponse userResponse = new UserResponse("usr-1", "Mariana Lima", "mariana@archflow.com", Role.EDITOR, LocalDateTime.now());
            AuthResponse authResponse = AuthResponse.of("mock-jwt-token", "mock-refresh-token", userResponse);

            when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.accessToken").value("mock-jwt-token"))
                    .andExpect(jsonPath("$.tokenType").value("Bearer"))
                    .andExpect(jsonPath("$.user.email").value("mariana@archflow.com"));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request com ProblemDetail RFC 7807 quando dados forem inválidos")
        void shouldReturn400WhenPayloadInvalid() throws Exception {
            // Arrange - e-mail inválido, senha com menos de 8 caracteres e nome em branco
            RegisterRequest invalidRequest = new RegisterRequest("", "formato-invalido", "123", null);

            // Act & Assert
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(invalidRequest)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.title").value("Validation Error"))
                    .andExpect(jsonPath("$.invalidParams.fullName").exists())
                    .andExpect(jsonPath("$.invalidParams.email").exists())
                    .andExpect(jsonPath("$.invalidParams.password").exists());
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/auth/login")
    class LoginEndpointTests {

        @Test
        @DisplayName("Deve retornar 200 OK quando credenciais forem válidas")
        void shouldReturn200WhenCredentialsValid() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("mariana@archflow.com", "senhaForte123");
            UserResponse userResponse = new UserResponse("usr-1", "Mariana Lima", "mariana@archflow.com", Role.EDITOR, LocalDateTime.now());
            AuthResponse authResponse = AuthResponse.of("mock-jwt-token", "mock-refresh-token", userResponse);

            when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

            // Act & Assert
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").value("mock-jwt-token"))
                    .andExpect(jsonPath("$.user.email").value("mariana@archflow.com"));
        }

        @Test
        @DisplayName("Deve retornar 401 Unauthorized com ProblemDetail quando credenciais forem inválidas")
        void shouldReturn401WhenBadCredentials() throws Exception {
            // Arrange
            LoginRequest request = new LoginRequest("mariana@archflow.com", "senhaIncorreta");
            when(authService.login(any(LoginRequest.class))).thenThrow(new BadCredentialsException("E-mail ou senha inválidos."));

            // Act & Assert
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.title").value("Invalid Credentials"))
                    .andExpect(jsonPath("$.detail").value("E-mail ou senha inválidos."));
        }
    }

    @Nested
    @DisplayName("Endpoint GET /api/v1/auth/me")
    class CurrentUserEndpointTests {

        @Test
        @WithMockUser(username = "mariana@archflow.com", roles = {"EDITOR"})
        @DisplayName("Deve retornar 200 OK com os dados do perfil do usuário autenticado")
        void shouldReturnCurrentUserProfile() throws Exception {
            // Arrange
            UserResponse userResponse = new UserResponse("usr-1", "Mariana Lima", "mariana@archflow.com", Role.EDITOR, LocalDateTime.now());
            when(authService.getCurrentUser("mariana@archflow.com")).thenReturn(userResponse);

            // Act & Assert
            mockMvc.perform(get("/api/v1/auth/me"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value("usr-1"))
                    .andExpect(jsonPath("$.email").value("mariana@archflow.com"))
                    .andExpect(jsonPath("$.fullName").value("Mariana Lima"));
        }
    }
}
