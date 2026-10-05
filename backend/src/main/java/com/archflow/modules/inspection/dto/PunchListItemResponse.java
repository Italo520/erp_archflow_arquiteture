package com.archflow.modules.inspection.dto;

import com.archflow.modules.inspection.domain.PunchListSeverity;
import com.archflow.modules.inspection.domain.PunchListStatus;

import java.time.LocalDateTime;

public record PunchListItemResponse(
    String id,
    String environment,
    String contractorTrade,
    String contractorName,
    String description,
    PunchListSeverity severity,
    PunchListStatus status,
    LocalDateTime dueDate,
    String beforePhotoUrl,
    String afterPhotoUrl,
    String resolutionNotes,
    LocalDateTime resolvedAt,
    String inspectionId,
    String projectId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
