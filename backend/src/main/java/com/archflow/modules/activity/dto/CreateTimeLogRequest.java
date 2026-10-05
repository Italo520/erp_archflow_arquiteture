package com.archflow.modules.activity.dto;

import com.archflow.modules.activity.domain.TimeLogCategory;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record CreateTimeLogRequest(
    @NotNull(message = "A duração em horas é obrigatória")
    @Positive(message = "A duração deve ser maior que zero")
    Double duration,

    @NotNull(message = "A categoria de horas é obrigatória")
    TimeLogCategory category,

    String description,

    LocalDate logDate,

    LocalTime startTime,

    LocalTime endTime,

    Boolean billable,

    BigDecimal billRate,

    @NotNull(message = "O ID do projeto é obrigatório")
    String projectId,

    String taskId,

    String clientId
) {}
