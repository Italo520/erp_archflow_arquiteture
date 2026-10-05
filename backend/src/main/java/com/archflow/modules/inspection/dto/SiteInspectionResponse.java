package com.archflow.modules.inspection.dto;

import com.archflow.modules.inspection.domain.InspectionStatus;

import java.time.LocalDateTime;

public record SiteInspectionResponse(
    String id,
    String title,
    LocalDateTime date,
    InspectionStatus status,
    String generalNotes,
    String weatherCondition,
    String projectId,
    String inspectorId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
