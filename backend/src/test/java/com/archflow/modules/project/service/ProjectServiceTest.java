package com.archflow.modules.project.service;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;
import com.archflow.modules.project.domain.TaskPriority;
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
import com.archflow.modules.project.service.impl.ProjectServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ProjectService - Suíte de Testes Formais de QA")
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ProjectKanbanColumnRepository columnRepository;

    @Mock
    private StageRepository stageRepository;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ProjectMapper projectMapper;

    private ProjectServiceImpl projectService;

    @BeforeEach
    void setUp() {
        projectService = new ProjectServiceImpl(
            projectRepository,
            columnRepository,
            stageRepository,
            taskRepository,
            clientRepository,
            projectMapper
        );
    }

    private Project createMockProject(String id, String name, String clientId) {
        return Project.builder()
            .id(id)
            .name(name)
            .clientId(clientId)
            .clientName("Cliente Exemplo")
            .status(ProjectStatus.CONCEPTUAL)
            .currentColumnId("col-1")
            .ownerId("user-1")
            .totalArea(250.0)
            .plannedCost(BigDecimal.valueOf(150000))
            .build();
    }

    private ProjectResponse createMockProjectResponse(String id, String name) {
        return new ProjectResponse(
            id, name, "Cliente Exemplo", "col-1", null, "Av. Paulista, 1000",
            LocalDateTime.now(), LocalDateTime.now().plusMonths(6), 250.0, "Residencial",
            ProjectStatus.CONCEPTUAL, ArchitecturalStyle.CONTEMPORANEO, ConstructionType.CONCRETO_ARMADO,
            2, 4, false, true, 2, 50.0, false, null, null,
            BigDecimal.valueOf(150000), BigDecimal.ZERO, ProjectVisibility.TEAM,
            "user-1", "client-1", LocalDateTime.now(), LocalDateTime.now()
        );
    }

    @Nested
    @DisplayName("ECP e BVA - Criação de Projeto e Validação de Prazos")
    class CreateProjectTests {

        @Test
        @DisplayName("ECP Válido: Criar projeto com datas válidas e cliente vinculado")
        void shouldCreateProjectWithValidDatesAndClient() {
            LocalDateTime start = LocalDateTime.now();
            LocalDateTime delivery = start.plusDays(90);

            CreateProjectRequest request = new CreateProjectRequest(
                "Residência Villa Bella", "client-1", null, "Rua A", "Residencial",
                ArchitecturalStyle.MODERNISTA, ConstructionType.ALVENARIA, 350.0,
                2, 5, true, true, 3, 80.0, false, start, delivery,
                BigDecimal.valueOf(500000), ProjectVisibility.TEAM
            );

            Client client = Client.builder().id("client-1").name("Família Silva").email("silva@arq.com").build();
            Project unmapped = createMockProject(null, request.name(), "client-1");
            Project saved = createMockProject("proj-1", request.name(), "client-1");
            ProjectKanbanColumn firstCol = new ProjectKanbanColumn("Briefing & Estudo Preliminar", "#6366F1", 0, "proj-1");
            firstCol.setId("col-first");
            ProjectResponse response = createMockProjectResponse("proj-1", request.name());

            when(clientRepository.findByIdAndDeletedAtIsNull("client-1")).thenReturn(Optional.of(client));
            when(projectMapper.toEntity(request)).thenReturn(unmapped);
            when(projectRepository.save(any(Project.class))).thenReturn(saved);
            when(columnRepository.saveAll(anyList())).thenReturn(List.of(firstCol));
            when(projectMapper.toResponse(saved)).thenReturn(response);

            ProjectResponse result = projectService.createProject(request, "user-owner-1");

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("proj-1");
            verify(stageRepository).save(any(Stage.class));
            verify(columnRepository).saveAll(anyList());
        }

        @Test
        @DisplayName("Deve criar projeto com clientName já informado e ownerId nulo")
        void shouldCreateProjectWithProvidedClientNameAndNullOwner() {
            LocalDateTime start = LocalDateTime.now();
            CreateProjectRequest request = new CreateProjectRequest(
                "Edifício Horizonte", "client-1", "Nome Customizado", "Rua B", "Comercial",
                null, null, 200.0, null, null, false, false, null, null, false,
                start, null, null, null
            );

            Client client = Client.builder().id("client-1").name("Família Silva").build();
            Project unmapped = createMockProject(null, request.name(), "client-1");
            Project saved = createMockProject("proj-2", request.name(), "client-1");
            ProjectKanbanColumn firstCol = new ProjectKanbanColumn("Briefing", "#6366F1", 0, "proj-2");
            firstCol.setId("col-first-2");
            ProjectResponse response = createMockProjectResponse("proj-2", request.name());

            when(clientRepository.findByIdAndDeletedAtIsNull("client-1")).thenReturn(Optional.of(client));
            when(projectMapper.toEntity(request)).thenReturn(unmapped);
            when(projectRepository.save(any(Project.class))).thenReturn(saved);
            when(columnRepository.saveAll(anyList())).thenReturn(List.of(firstCol));
            when(projectMapper.toResponse(saved)).thenReturn(response);

            ProjectResponse result = projectService.createProject(request, null);

            assertThat(result).isNotNull();
            assertThat(unmapped.getOwnerId()).isEqualTo("system-user");
            assertThat(unmapped.getClientName()).isEqualTo("Nome Customizado");
        }

        @Test
        @DisplayName("Deve criar projeto com clientId em branco e apenas data de entrega")
        void shouldCreateProjectWithBlankClientIdAndOnlyDeliveryDate() {
            LocalDateTime delivery = LocalDateTime.now().plusDays(30);
            CreateProjectRequest request = new CreateProjectRequest(
                "Projeto Rápido", "   ", null, null, null,
                null, null, 150.0, null, null, false, false, null, null, false,
                null, delivery, null, null
            );

            Project unmapped = createMockProject(null, request.name(), null);
            Project saved = createMockProject("proj-3", request.name(), null);
            ProjectKanbanColumn firstCol = new ProjectKanbanColumn("Briefing", "#6366F1", 0, "proj-3");
            firstCol.setId("col-first-3");
            ProjectResponse response = createMockProjectResponse("proj-3", request.name());

            when(projectMapper.toEntity(request)).thenReturn(unmapped);
            when(projectRepository.save(any(Project.class))).thenReturn(saved);
            when(columnRepository.saveAll(anyList())).thenReturn(List.of(firstCol));
            when(projectMapper.toResponse(saved)).thenReturn(response);

            ProjectResponse result = projectService.createProject(request, "owner-valid");

            assertThat(result).isNotNull();
            assertThat(unmapped.getOwnerId()).isEqualTo("owner-valid");
        }

        @Test
        @DisplayName("ECP Inválido: Rejeitar projeto quando deliveryDate for anterior a startDate")
        void shouldRejectProjectWithDeliveryBeforeStart() {
            LocalDateTime start = LocalDateTime.now();
            LocalDateTime invalidDelivery = start.minusDays(5);

            CreateProjectRequest request = new CreateProjectRequest(
                "Projeto Data Inválida", null, null, null, null, null, null,
                100.0, null, null, false, false, null, null, false,
                start, invalidDelivery, null, null
            );

            assertThatThrownBy(() -> projectService.createProject(request, "user-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A data de entrega não pode ser anterior à data de início do projeto.");
        }

        @Test
        @DisplayName("BVA Limite Válido: Aceitar projeto com deliveryDate no mesmo instante de startDate")
        void shouldAcceptProjectWithSameStartAndDeliveryDate() {
            LocalDateTime now = LocalDateTime.now();
            CreateProjectRequest request = new CreateProjectRequest(
                "Projeto Mesmo Dia", null, null, null, null, null, null,
                100.0, null, null, false, false, null, null, false,
                now, now, null, null
            );

            Project unmapped = createMockProject(null, request.name(), null);
            Project saved = createMockProject("proj-same-day", request.name(), null);
            ProjectKanbanColumn firstCol = new ProjectKanbanColumn("Briefing", "#6366F1", 0, "proj-same-day");
            firstCol.setId("col-1");
            ProjectResponse response = createMockProjectResponse("proj-same-day", request.name());

            when(projectMapper.toEntity(request)).thenReturn(unmapped);
            when(projectRepository.save(any(Project.class))).thenReturn(saved);
            when(columnRepository.saveAll(anyList())).thenReturn(List.of(firstCol));
            when(projectMapper.toResponse(saved)).thenReturn(response);

            ProjectResponse result = projectService.createProject(request, "user-1");
            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("ECP Inválido: Rejeitar criação com clientId inexistente")
        void shouldRejectWhenClientNotFound() {
            CreateProjectRequest request = new CreateProjectRequest(
                "Projeto com Cliente Inexistente", "client-invalido", null, null, null, null, null,
                100.0, null, null, false, false, null, null, false,
                null, null, null, null
            );

            when(clientRepository.findByIdAndDeletedAtIsNull("client-invalido")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> projectService.createProject(request, "user-1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente associado não encontrado com id: client-invalido");
        }
    }

    @Nested
    @DisplayName("Tabela de Decisão - Movimentação no Kanban e Tarefas")
    class KanbanAndTaskTests {

        @Test
        @DisplayName("Decisão Válida: Mover projeto para coluna pertencente ao projeto")
        void shouldMoveProjectToValidColumn() {
            String projectId = "proj-10";
            Project project = createMockProject(projectId, "Projeto Kanban", null);
            ProjectKanbanColumn targetColumn = new ProjectKanbanColumn("Anteprojeto", "#3B82F6", 1, projectId);
            targetColumn.setId("col-anteprojeto");

            ProjectResponse response = createMockProjectResponse(projectId, "Projeto Kanban");

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(columnRepository.findById("col-anteprojeto")).thenReturn(Optional.of(targetColumn));
            when(projectRepository.save(project)).thenReturn(project);
            when(projectMapper.toResponse(project)).thenReturn(response);

            ProjectResponse result = projectService.moveProjectKanban(projectId, "col-anteprojeto");

            assertThat(result).isNotNull();
            assertThat(project.getCurrentColumnId()).isEqualTo("col-anteprojeto");
        }

        @Test
        @DisplayName("Decisão Inválida: Rejeitar movimentação se coluna pertencer a outro projeto")
        void shouldRejectMoveToColumnOfAnotherProject() {
            String projectId = "proj-10";
            Project project = createMockProject(projectId, "Projeto Kanban", null);
            ProjectKanbanColumn alienColumn = new ProjectKanbanColumn("Outro Projeto Coluna", "#3B82F6", 1, "outro-proj-99");
            alienColumn.setId("col-alien");

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(columnRepository.findById("col-alien")).thenReturn(Optional.of(alienColumn));

            assertThatThrownBy(() -> projectService.moveProjectKanban(projectId, "col-alien"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A coluna de destino não pertence a este projeto");
        }

        @Test
        @DisplayName("Deve criar tarefa associada ao estágio do projeto com sucesso")
        void shouldCreateTaskForProjectStage() {
            String projectId = "proj-task-1";
            Project project = createMockProject(projectId, "Projeto Tarefas", null);
            Stage stage = new Stage("Fase 1", 0, projectId);
            stage.setId("stage-1");

            CreateTaskRequest request = new CreateTaskRequest(
                "Modelagem 3D Fachada", "Fazer modelo no Revit", TaskPriority.HIGH,
                LocalDateTime.now().plusDays(7), "stage-1", "user-assignee-1"
            );

            Task savedTask = new Task(request.title(), request.description(), request.priority(),
                request.dueDate(), 0, "PENDING", projectId, "stage-1", request.assigneeId());
            savedTask.setId("task-new-1");

            TaskResponse taskResponse = new TaskResponse("task-new-1", request.title(), request.description(),
                request.priority(), request.dueDate(), 0, "PENDING", projectId, "stage-1", request.assigneeId(),
                LocalDateTime.now(), LocalDateTime.now());

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(stageRepository.findById("stage-1")).thenReturn(Optional.of(stage));
            when(taskRepository.save(any(Task.class))).thenReturn(savedTask);
            when(projectMapper.toTaskResponse(savedTask)).thenReturn(taskResponse);

            TaskResponse result = projectService.createTask(projectId, request);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("task-new-1");
            assertThat(result.title()).isEqualTo("Modelagem 3D Fachada");
        }

        @Test
        @DisplayName("Rejeitar tarefa se estágio pertencer a outro projeto")
        void shouldRejectTaskIfStageBelongsToAnotherProject() {
            String projectId = "proj-task-1";
            Project project = createMockProject(projectId, "Projeto Tarefas", null);
            Stage alienStage = new Stage("Estágio Alien", 0, "outro-projeto");
            alienStage.setId("stage-alien");

            CreateTaskRequest request = new CreateTaskRequest("Tarefa", null, TaskPriority.LOW, null, "stage-alien", null);

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(stageRepository.findById("stage-alien")).thenReturn(Optional.of(alienStage));

            assertThatThrownBy(() -> projectService.createTask(projectId, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O estágio informado não pertence a este projeto");
        }

        @Test
        @DisplayName("Deve atualizar projeto existente com sucesso e vincular novo cliente")
        void shouldUpdateProjectSuccessfully() {
            String projectId = "proj-up-1";
            Project project = createMockProject(projectId, "Projeto Antigo", "client-1");
            Client client = Client.builder().id("client-2").name("Cliente Novo").build();

            UpdateProjectRequest request = new UpdateProjectRequest(
                "Projeto Reformulado", "client-2", null, "Av. B", "Comercial",
                ProjectStatus.EXECUTIVE, ArchitecturalStyle.INDUSTRIAL, ConstructionType.STEEL_FRAME,
                500.0, 3, 8, true, true, 4, 30.0, true,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(8),
                BigDecimal.valueOf(300000), BigDecimal.valueOf(50000), ProjectVisibility.PUBLIC
            );

            ProjectResponse response = createMockProjectResponse(projectId, request.name());

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(clientRepository.findByIdAndDeletedAtIsNull("client-2")).thenReturn(Optional.of(client));
            when(projectRepository.save(project)).thenReturn(project);
            when(projectMapper.toResponse(project)).thenReturn(response);

            ProjectResponse result = projectService.updateProject(projectId, request);

            assertThat(result).isNotNull();
            assertThat(project.getClientName()).isEqualTo("Cliente Novo");
            assertThat(project.getStatus()).isEqualTo(ProjectStatus.EXECUTIVE);
            verify(projectMapper).updateEntityFromRequest(request, project);
        }

        @Test
        @DisplayName("Deve atualizar projeto sem alterar cliente quando clientId for nulo")
        void shouldUpdateProjectWithoutClientChange() {
            String projectId = "proj-up-2";
            Project project = createMockProject(projectId, "Projeto", null);

            UpdateProjectRequest request = new UpdateProjectRequest(
                "Projeto Sem Cliente", null, null, null, null,
                null, null, null, null, null, null,
                false, false, null, null, false,
                null, null, null, null, null
            );

            ProjectResponse response = createMockProjectResponse(projectId, request.name());

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(projectRepository.save(project)).thenReturn(project);
            when(projectMapper.toResponse(project)).thenReturn(response);

            ProjectResponse result = projectService.updateProject(projectId, request);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("Buscar projeto por ID existente")
        void shouldGetProjectById() {
            String projectId = "proj-find-1";
            Project project = createMockProject(projectId, "Encontrado", null);
            ProjectResponse response = createMockProjectResponse(projectId, "Encontrado");

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(projectMapper.toResponse(project)).thenReturn(response);

            ProjectResponse result = projectService.getProjectById(projectId);

            assertThat(result.id()).isEqualTo(projectId);
        }

        @Test
        @DisplayName("Listar colunas do Kanban do projeto")
        void shouldGetProjectKanbanColumns() {
            String projectId = "proj-col-1";
            Project project = createMockProject(projectId, "Projeto", null);
            ProjectKanbanColumn col = new ProjectKanbanColumn("Briefing", "#6366F1", 0, projectId);
            ProjectKanbanColumnResponse colResp = new ProjectKanbanColumnResponse("col-1", "Briefing", "#6366F1", 0, projectId);

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(columnRepository.findByProjectIdOrderByOrderAsc(projectId)).thenReturn(List.of(col));
            when(projectMapper.toColumnResponse(col)).thenReturn(colResp);

            List<ProjectKanbanColumnResponse> result = projectService.getProjectKanbanColumns(projectId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Briefing");
        }

        @Test
        @DisplayName("Listar tarefas do projeto")
        void shouldListProjectTasks() {
            String projectId = "proj-tasks-list";
            Project project = createMockProject(projectId, "Projeto", null);
            Task task = new Task("Tarefa 1", null, TaskPriority.LOW, null, 0, "PENDING", projectId, "s-1", null);
            TaskResponse taskResp = new TaskResponse("t-1", "Tarefa 1", null, TaskPriority.LOW, null, 0, "PENDING", projectId, "s-1", null, null, null);

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));
            when(taskRepository.findByProjectIdAndDeletedAtIsNullOrderByPositionAsc(projectId)).thenReturn(List.of(task));
            when(projectMapper.toTaskResponse(task)).thenReturn(taskResp);

            List<TaskResponse> result = projectService.listProjectTasks(projectId);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).title()).isEqualTo("Tarefa 1");
        }

        @Test
        @DisplayName("Soft Delete de Projeto")
        void shouldSoftDeleteProject() {
            String projectId = "proj-del-1";
            Project project = createMockProject(projectId, "Para Deletar", null);

            when(projectRepository.findByIdAndDeletedAtIsNull(projectId)).thenReturn(Optional.of(project));

            projectService.deleteProject(projectId);

            assertThat(project.getDeletedAt()).isNotNull();
            assertThat(project.isDeleted()).isTrue();
            verify(projectRepository).save(project);
        }

        @Test
        @DisplayName("Listagem paginada de projetos com filtros nulos ou em branco")
        void shouldListProjectsWithNullSearch() {
            Pageable pageable = PageRequest.of(0, 10);
            Project project = createMockProject("proj-list-1", "Edifício Horizonte", null);
            ProjectResponse response = createMockProjectResponse("proj-list-1", "Edifício Horizonte");

            when(projectRepository.searchProjects(eq(null), eq(null), eq(null), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(project), pageable, 1));
            when(projectMapper.toResponse(project)).thenReturn(response);

            Page<ProjectResponse> result = projectService.listProjects("   ", null, null, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
        }

        @Test
        @DisplayName("Listagem paginada de projetos com filtros")
        void shouldListProjectsWithFilters() {
            Pageable pageable = PageRequest.of(0, 10);
            Project project = createMockProject("proj-list-1", "Edifício Horizonte", "client-1");
            ProjectResponse response = createMockProjectResponse("proj-list-1", "Edifício Horizonte");

            when(projectRepository.searchProjects(eq("horizonte"), eq("client-1"), eq(ProjectStatus.CONCEPTUAL), eq(pageable)))
                .thenReturn(new PageImpl<>(List.of(project), pageable, 1));
            when(projectMapper.toResponse(project)).thenReturn(response);

            Page<ProjectResponse> result = projectService.listProjects(" horizonte ", "client-1", ProjectStatus.CONCEPTUAL, pageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).name()).isEqualTo("Edifício Horizonte");
        }
    }
}
