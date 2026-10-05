package com.archflow.modules.activity.dto;

import com.archflow.modules.activity.domain.TimeLogCategory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record TimeLogResponse(
    String id,
    Double duration,
    TimeLogCategory category,
    String description,
    LocalDate logDate,
    LocalTime startTime,
    LocalTime endTime,
    boolean billable,
    BigDecimal billRate,
    String userId,
    String projectId,
    String taskId,
    String clientId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
