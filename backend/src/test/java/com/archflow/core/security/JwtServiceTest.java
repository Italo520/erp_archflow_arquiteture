package com.archflow.core.security;

import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("JwtService Formal Unit & Security Tests")
class JwtServiceTest {

    private JwtServiceImpl jwtService;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Chave secreta de 256 bits (32 bytes) para testes com HMAC-SHA256
        String testSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        long jwtExpiration = 3600000L; // 1 hora
        long refreshExpiration = 86400000L; // 24 horas

        jwtService = new JwtServiceImpl(testSecret, jwtExpiration, refreshExpiration);

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
