package com.archflow.modules.project.controller;

import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.dto.CreateProjectRequest;
import com.archflow.modules.project.dto.CreateTaskRequest;
import com.archflow.modules.project.dto.MoveKanbanColumnRequest;
import com.archflow.modules.project.dto.ProjectKanbanColumnResponse;
import com.archflow.modules.project.dto.ProjectResponse;
import com.archflow.modules.project.dto.TaskResponse;
import com.archflow.modules.project.dto.UpdateProjectRequest;
import com.archflow.modules.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Projetos", description = "Endpoints para gerenciamento de projetos arquitetônicos, Kanban e tarefas")
@SecurityRequirement(name = "Bearer Authentication")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Listar projetos com paginação e filtros")
    public ResponseEntity<Page<ProjectResponse>> listProjects(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String clientId,
        @RequestParam(required = false) ProjectStatus status,
        @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectResponse> page = projectService.listProjects(search, clientId, status, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes de um projeto por ID")
    public ResponseEntity<ProjectResponse> getProjectById(@PathVariable String id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Criar novo projeto arquitetônico")
    public ResponseEntity<ProjectResponse> createProject(
        @Valid @RequestBody CreateProjectRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String ownerId = (userDetails != null) ? userDetails.getUsername() : "system";
        ProjectResponse created = projectService.createProject(request, ownerId);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar projeto existente")
    public ResponseEntity<ProjectResponse> updateProject(
        @PathVariable String id,
        @Valid @RequestBody UpdateProjectRequest request
    ) {
        ProjectResponse updated = projectService.updateProject(id, request);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/kanban")
    @Operation(summary = "Mover projeto entre colunas do Kanban")
    public ResponseEntity<ProjectResponse> moveProjectKanban(
        @PathVariable String id,
        @Valid @RequestBody MoveKanbanColumnRequest request
    ) {
        ProjectResponse moved = projectService.moveProjectKanban(id, request.columnId());
        return ResponseEntity.ok(moved);
    }

    @GetMapping("/{id}/kanban-columns")
    @Operation(summary = "Listar colunas de Kanban do projeto")
    public ResponseEntity<List<ProjectKanbanColumnResponse>> getProjectKanbanColumns(@PathVariable String id) {
        List<ProjectKanbanColumnResponse> columns = projectService.getProjectKanbanColumns(id);
        return ResponseEntity.ok(columns);
    }

    @PostMapping("/{id}/tasks")
    @Operation(summary = "Adicionar nova tarefa ao projeto")
    public ResponseEntity<TaskResponse> createTask(
        @PathVariable String id,
        @Valid @RequestBody CreateTaskRequest request
    ) {
        TaskResponse created = projectService.createTask(id, request);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/{id}/tasks")
    @Operation(summary = "Listar tarefas do projeto")
    public ResponseEntity<List<TaskResponse>> listProjectTasks(@PathVariable String id) {
        List<TaskResponse> tasks = projectService.listProjectTasks(id);
        return ResponseEntity.ok(tasks);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir projeto logicamente (Soft Delete)")
    public ResponseEntity<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }
}
