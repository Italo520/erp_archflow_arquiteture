package com.archflow.modules.project.dto;

import com.archflow.modules.project.domain.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateTaskRequest(
    @NotBlank(message = "O título da tarefa é obrigatório")
    @Size(min = 2, max = 255, message = "O título deve ter entre 2 e 255 caracteres")
    String title,

    String description,

    TaskPriority priority,

    LocalDateTime dueDate,

    @NotNull(message = "O ID do estágio (stageId) é obrigatório")
    String stageId,

    String assigneeId
) {}
