package com.archflow.modules.project.dto;

import com.archflow.modules.project.domain.TaskPriority;

import java.time.LocalDateTime;

public record TaskResponse(
    String id,
    String title,
    String description,
    TaskPriority priority,
    LocalDateTime dueDate,
    Integer position,
    String approvalStatus,
    String projectId,
    String stageId,
    String assigneeId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
