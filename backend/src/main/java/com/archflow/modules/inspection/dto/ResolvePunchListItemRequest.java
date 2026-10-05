package com.archflow.modules.inspection.dto;

import jakarta.validation.constraints.NotBlank;

public record ResolvePunchListItemRequest(
    @NotBlank(message = "As notas de resolução são obrigatórias")
    String resolutionNotes,

    String afterPhotoUrl
) {}
