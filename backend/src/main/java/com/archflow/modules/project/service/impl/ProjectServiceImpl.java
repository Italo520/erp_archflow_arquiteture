package com.archflow.modules.project.service.impl;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.dto.CreateProjectRequest;
import com.archflow.modules.project.dto.CreateTaskRequest;
import com.archflow.modules.project.dto.ProjectKanbanColumnResponse;
import com.archflow.modules.project.dto.ProjectResponse;
import com.archflow.modules.project.dto.TaskResponse;
import com.archflow.modules.project.dto.UpdateProjectRequest;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.entity.ProjectKanbanColumn;
import com.archflow.modules.project.entity.Stage;
import com.archflow.modules.project.entity.Task;
import com.archflow.modules.project.mapper.ProjectMapper;
import com.archflow.modules.project.repository.ProjectKanbanColumnRepository;
import com.archflow.modules.project.repository.ProjectRepository;
import com.archflow.modules.project.repository.StageRepository;
import com.archflow.modules.project.repository.TaskRepository;
import com.archflow.modules.project.service.ProjectService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectKanbanColumnRepository columnRepository;
    private final StageRepository stageRepository;
    private final TaskRepository taskRepository;
    private final ClientRepository clientRepository;
    private final ProjectMapper projectMapper;

    public ProjectServiceImpl(
        ProjectRepository projectRepository,
        ProjectKanbanColumnRepository columnRepository,
        StageRepository stageRepository,
        TaskRepository taskRepository,
        ClientRepository clientRepository,
        ProjectMapper projectMapper
    ) {
        this.projectRepository = projectRepository;
        this.columnRepository = columnRepository;
        this.stageRepository = stageRepository;
        this.taskRepository = taskRepository;
        this.clientRepository = clientRepository;
        this.projectMapper = projectMapper;
    }

    @Override
    public Page<ProjectResponse> listProjects(String search, String clientId, ProjectStatus status, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Project> projectsPage = projectRepository.searchProjects(trimmedSearch, clientId, status, pageable);
        return projectsPage.map(projectMapper::toResponse);
    }

    @Override
    public ProjectResponse getProjectById(String id) {
        Project project = findActiveProjectById(id);
        return projectMapper.toResponse(project);
    }

    @Override
    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request, String ownerId) {
        validateProjectDates(request.startDate(), request.deliveryDate());

        String clientName = request.clientName();
        if (request.clientId() != null && !request.clientId().isBlank()) {
            Client client = clientRepository.findByIdAndDeletedAtIsNull(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente associado não encontrado com id: " + request.clientId()));
            if (clientName == null || clientName.isBlank()) {
                clientName = client.getName();
            }
        }

        Project project = projectMapper.toEntity(request);
        project.setOwnerId(ownerId != null ? ownerId : "system-user");
        project.setClientName(clientName);
        project.setStatus(ProjectStatus.CONCEPTUAL);

        Project savedProject = projectRepository.save(project);

        // Criar colunas padrão de Kanban
        ProjectKanbanColumn firstColumn = createDefaultKanbanColumns(savedProject.getId());
        savedProject.setCurrentColumnId(firstColumn.getId());

        // Criar estágio inicial padrão
        Stage defaultStage = new Stage("Fase 1 - Concepção", 0, savedProject.getId());
        stageRepository.save(defaultStage);

        savedProject = projectRepository.save(savedProject);
        return projectMapper.toResponse(savedProject);
    }

    @Override
    @Transactional
    public ProjectResponse updateProject(String id, UpdateProjectRequest request) {
        Project project = findActiveProjectById(id);
        validateProjectDates(request.startDate(), request.deliveryDate());

        if (request.clientId() != null && !request.clientId().isBlank()) {
            Client client = clientRepository.findByIdAndDeletedAtIsNull(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente associado não encontrado com id: " + request.clientId()));
            project.setClientName(client.getName());
        }

        projectMapper.updateEntityFromRequest(request, project);
        if (request.status() != null) {
            project.setStatus(request.status());
        }

        Project updated = projectRepository.save(project);
        return projectMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public ProjectResponse moveProjectKanban(String projectId, String targetColumnId) {
        Project project = findActiveProjectById(projectId);
        ProjectKanbanColumn column = columnRepository.findById(targetColumnId)
            .orElseThrow(() -> new ResourceNotFoundException("Coluna de Kanban não encontrada com id: " + targetColumnId));

        if (!projectId.equals(column.getProjectId())) {
            throw new BusinessException("A coluna de destino não pertence a este projeto");
        }

        project.setCurrentColumnId(column.getId());
        Project saved = projectRepository.save(project);
        return projectMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteProject(String id) {
        Project project = findActiveProjectById(id);
        project.markAsDeleted();
        projectRepository.save(project);
    }

    @Override
    public List<ProjectKanbanColumnResponse> getProjectKanbanColumns(String projectId) {
        findActiveProjectById(projectId);
        return columnRepository.findByProjectIdOrderByOrderAsc(projectId).stream()
            .map(projectMapper::toColumnResponse)
            .toList();
    }

    @Override
    @Transactional
    public TaskResponse createTask(String projectId, CreateTaskRequest request) {
        findActiveProjectById(projectId);
        Stage stage = stageRepository.findById(request.stageId())
            .orElseThrow(() -> new ResourceNotFoundException("Estágio não encontrado com id: " + request.stageId()));

        if (!projectId.equals(stage.getProjectId())) {
            throw new BusinessException("O estágio informado não pertence a este projeto");
        }

        Task task = new Task(
            request.title(),
            request.description(),
            request.priority(),
            request.dueDate(),
            0,
            "PENDING",
            projectId,
            stage.getId(),
            request.assigneeId()
        );

        Task saved = taskRepository.save(task);
        return projectMapper.toTaskResponse(saved);
    }

    @Override
    public List<TaskResponse> listProjectTasks(String projectId) {
        findActiveProjectById(projectId);
        return taskRepository.findByProjectIdAndDeletedAtIsNullOrderByPositionAsc(projectId).stream()
            .map(projectMapper::toTaskResponse)
            .toList();
    }

    private Project findActiveProjectById(String id) {
        return projectRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com id: " + id));
    }

    private void validateProjectDates(LocalDateTime startDate, LocalDateTime deliveryDate) {
        if (startDate != null && deliveryDate != null && deliveryDate.isBefore(startDate)) {
            throw new BusinessException("A data de entrega não pode ser anterior à data de início do projeto.");
        }
    }

    private ProjectKanbanColumn createDefaultKanbanColumns(String projectId) {
        List<ProjectKanbanColumn> columns = List.of(
            new ProjectKanbanColumn("Briefing & Estudo Preliminar", "#6366F1", 0, projectId),
            new ProjectKanbanColumn("Anteprojeto", "#3B82F6", 1, projectId),
            new ProjectKanbanColumn("Projeto Executivo", "#F59E0B", 2, projectId),
            new ProjectKanbanColumn("Aprovação & Legalização", "#8B5CF6", 3, projectId),
            new ProjectKanbanColumn("Obra / Construção", "#10B981", 4, projectId),
            new ProjectKanbanColumn("Concluído", "#059669", 5, projectId)
        );
        List<ProjectKanbanColumn> saved = columnRepository.saveAll(columns);
        return saved.get(0);
    }
}
