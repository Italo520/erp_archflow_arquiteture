package com.archflow.modules.project.dto;

import jakarta.validation.constraints.NotBlank;

public record MoveKanbanColumnRequest(
    @NotBlank(message = "O ID da coluna de destino é obrigatório")
    String columnId
) {}
