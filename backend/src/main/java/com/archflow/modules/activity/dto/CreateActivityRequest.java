package com.archflow.modules.activity.dto;

import com.archflow.modules.activity.domain.ActivityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateActivityRequest(
    @NotNull(message = "O tipo de atividade é obrigatório")
    ActivityType type,

    @NotBlank(message = "O título é obrigatório")
    @Size(min = 2, max = 255, message = "O título deve ter entre 2 e 255 caracteres")
    String title,

    String description,

    @PositiveOrZero(message = "A duração não pode ser negativa")
    Integer duration,

    @NotNull(message = "A data/hora de início é obrigatória")
    LocalDateTime startTime,

    LocalDateTime endTime,

    String location,

    String clientId,

    String projectId,

    String taskId
) {}
