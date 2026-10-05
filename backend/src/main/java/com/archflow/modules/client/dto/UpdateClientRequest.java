package com.archflow.modules.client.dto;

import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdateClientRequest(
    @NotBlank(message = "O nome do cliente é obrigatório")
    @Size(min = 2, max = 255, message = "O nome deve ter entre 2 e 255 caracteres")
    String name,

    @NotBlank(message = "O e-mail é obrigatório")
    @Email(message = "Formato de e-mail inválido")
    String email,

    String phone,

    String website,

    @NotNull(message = "O tipo legal (PF ou PJ) é obrigatório")
    ClientLegalType legalType,

    String document,

    String razaoSocial,

    String inscricaoEstadual,

    String address,

    @NotNull(message = "A categoria do cliente é obrigatória")
    ClientCategory category,

    ClientStatus status,

    Double rating,

    ContactPreference contactPreference,

    String notes,

    String avatar,

    String userId
) {}
