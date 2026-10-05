package com.archflow.modules.project.dto;

import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UpdateProjectRequest(
    @NotBlank(message = "O nome do projeto é obrigatório")
    @Size(min = 2, max = 255, message = "O nome do projeto deve ter entre 2 e 255 caracteres")
    String name,

    String clientId,

    String clientName,

    String address,

    String projectType,

    ProjectStatus status,

    ArchitecturalStyle architecturalStyle,

    ConstructionType constructionType,

    @PositiveOrZero(message = "A área total não pode ser negativa")
    Double totalArea,

    Integer numberOfFloors,

    Integer numberOfRooms,

    Boolean hasBasement,

    Boolean hasGarage,

    Integer parkingSpots,

    Double landscapingArea,

    Boolean environmentalLicenseRequired,

    LocalDateTime startDate,

    LocalDateTime deliveryDate,

    BigDecimal plannedCost,

    BigDecimal actualCost,

    ProjectVisibility visibility
) {}
