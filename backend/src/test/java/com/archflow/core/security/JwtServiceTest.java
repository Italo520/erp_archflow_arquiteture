package com.archflow.core.security;

import com.archflow.modules.auth.domain.Role;
import com.archflow.modules.auth.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService Unit Tests")
class JwtServiceTest {

    private JwtService jwtService;
    private static final String SECRET = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long EXPIRATION = 3600000; // 1 hour
    private static final long REFRESH_EXPIRATION = 86400000; // 24 hours

    private User testUser;

    @BeforeEach
    void setUp() {
        jwtService = new JwtServiceImpl(SECRET, EXPIRATION, REFRESH_EXPIRATION);

        testUser = User.builder()
                .fullName("Arquitecto Silva")
                .email("silva@archflow.com")
                .passwordHash("hashed_password")
                .role(Role.OWNER)
                .build();
        testUser.setId("uuid-user-123");
    }

    @Test
    @DisplayName("Should generate valid access token with correct subject and claims")
    void shouldGenerateAccessTokenWithClaims() {
        // Act
        String token = jwtService.generateToken(testUser);

        // Assert
        assertThat(token).isNotBlank();
        assertThat(jwtService.extractUsername(token)).isEqualTo("silva@archflow.com");
        assertThat(jwtService.isTokenExpired(token)).isFalse();

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));
        String userId = jwtService.extractClaim(token, claims -> claims.get("userId", String.class));
        String fullName = jwtService.extractClaim(token, claims -> claims.get("fullName", String.class));

        assertThat(role).isEqualTo("OWNER");
        assertThat(userId).isEqualTo("uuid-user-123");
        assertThat(fullName).isEqualTo("Arquitecto Silva");
    }

    @Test
    @DisplayName("Should generate valid refresh token")
    void shouldGenerateRefreshToken() {
        // Act
        String refreshToken = jwtService.generateRefreshToken(testUser);

        // Assert
        assertThat(refreshToken).isNotBlank();
        assertThat(jwtService.extractUsername(refreshToken)).isEqualTo("silva@archflow.com");
        assertThat(jwtService.isTokenExpired(refreshToken)).isFalse();
    }

    @Test
    @DisplayName("Should validate token against matching UserDetails")
    void shouldValidateTokenSuccessfully() {
        // Arrange
        String token = jwtService.generateToken(testUser);

        // Act
        boolean isValid = jwtService.isTokenValid(token, testUser);

        // Assert
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Should reject token when username does not match UserDetails")
    void shouldRejectTokenWhenUsernameMismatch() {
        // Arrange
        String token = jwtService.generateToken(testUser);
        UserDetails differentUser = User.builder()
                .email("other@archflow.com")
                .passwordHash("pwd")
                .role(Role.VIEWER)
                .build();

        // Act
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should return false for invalid or corrupted token string")
    void shouldReturnFalseForMalformedToken() {
        // Act
        boolean isValid = jwtService.isTokenValid("invalid.token.signature", testUser);

        // Assert
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Should recognize expired token when expiration time is negative")
    void shouldRecognizeExpiredToken() {
        // Arrange - create JwtService with negative expiration (already expired)
        JwtService expiredService = new JwtServiceImpl(SECRET, -1000, -1000);
        String expiredToken = expiredService.generateToken(testUser);

        // Act & Assert
        boolean isExpired = expiredService.isTokenExpired(expiredToken);
        assertThat(isExpired).isTrue();

        boolean isValid = expiredService.isTokenValid(expiredToken, testUser);
        assertThat(isValid).isFalse();
    }
}
