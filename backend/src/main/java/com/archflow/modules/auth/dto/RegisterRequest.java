package com.archflow.modules.auth.dto;

import com.archflow.modules.auth.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "O nome completo é obrigatório.")
        @Size(min = 2, max = 255, message = "O nome deve conter entre 2 e 255 caracteres.")
        String fullName,

        @NotBlank(message = "O e-mail é obrigatório.")
        @Email(message = "Formato de e-mail inválido.")
        String email,

        @NotBlank(message = "A senha é obrigatória.")
        @Size(min = 8, message = "A senha deve conter no mínimo 8 caracteres.")
        String password,

        Role role
) {
    public Role getRoleOrDefault() {
        return role != null ? role : Role.VIEWER;
    }
}
