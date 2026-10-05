package com.archflow.modules.activity.dto;

import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;

import java.time.LocalDateTime;

public record ActivityResponse(
    String id,
    ActivityType type,
    String title,
    String description,
    Integer duration,
    LocalDateTime startTime,
    LocalDateTime endTime,
    String location,
    ActivityStatus status,
    String clientId,
    String projectId,
    String taskId,
    String createdById,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
