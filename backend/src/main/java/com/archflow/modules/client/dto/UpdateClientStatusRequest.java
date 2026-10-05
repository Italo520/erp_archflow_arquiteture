package com.archflow.modules.client.dto;

import com.archflow.modules.client.domain.ClientStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateClientStatusRequest(
    @NotNull(message = "O novo status é obrigatório")
    ClientStatus status
) {}
