package com.archflow.modules.project.service;

import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.dto.CreateProjectRequest;
import com.archflow.modules.project.dto.CreateTaskRequest;
import com.archflow.modules.project.dto.ProjectKanbanColumnResponse;
import com.archflow.modules.project.dto.ProjectResponse;
import com.archflow.modules.project.dto.TaskResponse;
import com.archflow.modules.project.dto.UpdateProjectRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectService {

    Page<ProjectResponse> listProjects(String search, String clientId, ProjectStatus status, Pageable pageable);

    ProjectResponse getProjectById(String id);

    ProjectResponse createProject(CreateProjectRequest request, String ownerId);

    ProjectResponse updateProject(String id, UpdateProjectRequest request);

    ProjectResponse moveProjectKanban(String projectId, String targetColumnId);

    void deleteProject(String id);

    List<ProjectKanbanColumnResponse> getProjectKanbanColumns(String projectId);

    TaskResponse createTask(String projectId, CreateTaskRequest request);

    List<TaskResponse> listProjectTasks(String projectId);
}
