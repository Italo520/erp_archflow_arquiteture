package com.archflow.modules.inspection.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateSiteInspectionRequest(
    @NotBlank(message = "O título da vistoria é obrigatório")
    @Size(min = 2, max = 255, message = "O título deve ter entre 2 e 255 caracteres")
    String title,

    LocalDateTime date,

    String generalNotes,

    String weatherCondition,

    @NotBlank(message = "O ID do projeto é obrigatório")
    String projectId
) {}
