package com.archflow.modules.auth.dto;

import com.archflow.modules.auth.domain.Role;

import java.time.LocalDateTime;

public record UserResponse(
        String id,
        String fullName,
        String email,
        Role role,
        LocalDateTime createdAt
) {}
