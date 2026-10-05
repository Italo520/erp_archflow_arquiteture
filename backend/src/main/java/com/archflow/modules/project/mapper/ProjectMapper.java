package com.archflow.modules.project.mapper;

import com.archflow.modules.project.dto.CreateProjectRequest;
import com.archflow.modules.project.dto.ProjectKanbanColumnResponse;
import com.archflow.modules.project.dto.ProjectResponse;
import com.archflow.modules.project.dto.TaskResponse;
import com.archflow.modules.project.dto.UpdateProjectRequest;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.entity.ProjectKanbanColumn;
import com.archflow.modules.project.entity.Task;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    builder = @Builder(disableBuilder = true),
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ProjectMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentColumnId", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "status", constant = "CONCEPTUAL")
    @Mapping(target = "actualEndDate", ignore = true)
    @Mapping(target = "actualCost", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "ownerId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Project toEntity(CreateProjectRequest request);

    ProjectResponse toResponse(Project project);

    ProjectKanbanColumnResponse toColumnResponse(ProjectKanbanColumn column);

    TaskResponse toTaskResponse(Task task);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "currentColumnId", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "ownerId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    void updateEntityFromRequest(UpdateProjectRequest request, @MappingTarget Project project);
}
