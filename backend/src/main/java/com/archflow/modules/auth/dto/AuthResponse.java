package com.archflow.modules.auth.dto;

public record AuthResponse(
        String accessToken,
        String token,
        String refreshToken,
        String tokenType,
        UserResponse user,
        String id,
        String name,
        String email,
        String role
) {
    public static AuthResponse of(String accessToken, String refreshToken, UserResponse user) {
        return new AuthResponse(
                accessToken,
                accessToken,
                refreshToken,
                "Bearer",
                user,
                user != null ? user.id() : null,
                user != null ? user.fullName() : null,
                user != null ? user.email() : null,
                user != null && user.role() != null ? user.role().name() : null
        );
    }
}

