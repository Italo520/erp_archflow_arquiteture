package com.archflow.modules.activity.dto;

import com.archflow.modules.activity.domain.ActivityStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateActivityStatusRequest(
    @NotNull(message = "O status da atividade é obrigatório")
    ActivityStatus status
) {
}
