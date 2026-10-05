package com.archflow.modules.project.dto;

import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProjectResponse(
    String id,
    String name,
    String clientName,
    String currentColumnId,
    String imageUrl,
    String address,
    LocalDateTime startDate,
    LocalDateTime deliveryDate,
    Double totalArea,
    String projectType,
    ProjectStatus status,
    ArchitecturalStyle architecturalStyle,
    ConstructionType constructionType,
    Integer numberOfFloors,
    Integer numberOfRooms,
    boolean hasBasement,
    boolean hasGarage,
    Integer parkingSpots,
    Double landscapingArea,
    boolean environmentalLicenseRequired,
    LocalDateTime estimatedEndDate,
    LocalDateTime actualEndDate,
    BigDecimal plannedCost,
    BigDecimal actualCost,
    ProjectVisibility visibility,
    String ownerId,
    String clientId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
