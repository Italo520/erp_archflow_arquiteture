package com.archflow.modules.inspection.dto;

import com.archflow.modules.inspection.domain.PunchListSeverity;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CreatePunchListItemRequest(
    @NotBlank(message = "O ambiente é obrigatório")
    String environment,

    @NotBlank(message = "A disciplina / empreiteiro é obrigatória")
    String contractorTrade,

    String contractorName,

    @NotBlank(message = "A descrição da pendência é obrigatória")
    String description,

    @NotNull(message = "A severidade é obrigatória")
    PunchListSeverity severity,

    LocalDateTime dueDate,

    String beforePhotoUrl
) {}
