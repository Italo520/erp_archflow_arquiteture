package com.archflow.modules.project.dto;

public record ProjectKanbanColumnResponse(
    String id,
    String title,
    String color,
    Integer order,
    String projectId
) {}
