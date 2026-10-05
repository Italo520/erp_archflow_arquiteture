package com.archflow.modules.project.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;
import com.archflow.modules.project.domain.TaskPriority;
import com.archflow.modules.project.dto.CreateProjectRequest;
import com.archflow.modules.project.dto.CreateTaskRequest;
import com.archflow.modules.project.dto.MoveKanbanColumnRequest;
import com.archflow.modules.project.dto.ProjectKanbanColumnResponse;
import com.archflow.modules.project.dto.ProjectResponse;
import com.archflow.modules.project.dto.TaskResponse;
import com.archflow.modules.project.dto.UpdateProjectRequest;
import com.archflow.modules.project.service.ProjectService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ProjectController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("ProjectController - Testes da Camada Web")
class ProjectControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProjectService projectService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    private ProjectResponse sampleProjectResponse(String id, String name) {
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
    @DisplayName("Endpoint GET /api/v1/projects")
    class ListProjectsTests {

        @Test
        @DisplayName("Deve retornar 200 OK com página de projetos")
        void shouldReturnPagedProjects() throws Exception {
            ProjectResponse project = sampleProjectResponse("proj-1", "Casa da Serra");
            when(projectService.listProjects(any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(project)));

            mockMvc.perform(get("/api/v1/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("proj-1"))
                .andExpect(jsonPath("$.content[0].name").value("Casa da Serra"));
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/projects")
    class CreateProjectTests {

        @Test
        @WithMockUser(username = "arquiteto@archflow.com")
        @DisplayName("Deve retornar 201 Created quando payload for válido")
        void shouldCreateProjectSuccessfully() throws Exception {
            CreateProjectRequest request = new CreateProjectRequest(
                "Residencial Alphaville", "client-1", "Família Silva", "Rua 1", "Residencial",
                ArchitecturalStyle.MODERNISTA, ConstructionType.ALVENARIA, 320.0,
                2, 4, false, true, 2, 40.0, false,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(6),
                BigDecimal.valueOf(400000), ProjectVisibility.TEAM
            );

            ProjectResponse response = sampleProjectResponse("proj-new", request.name());
            when(projectService.createProject(any(CreateProjectRequest.class), any())).thenReturn(response);

            mockMvc.perform(post("/api/v1/projects")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value("proj-new"))
                .andExpect(jsonPath("$.name").value("Residencial Alphaville"));
        }

        @Test
        @DisplayName("Deve retornar 400 Bad Request RFC 7807 quando nome for em branco")
        void shouldReturn400WhenNameIsBlank() throws Exception {
            CreateProjectRequest invalidRequest = new CreateProjectRequest(
                "", null, null, null, null, null, null,
                null, null, null, null, null, null, null, null,
                null, null, null, null
            );

            mockMvc.perform(post("/api/v1/projects")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation Error"))
                .andExpect(jsonPath("$.invalidParams.name").exists());
        }
    }

    @Nested
    @DisplayName("Endpoint PUT /api/v1/projects/{id}")
    class UpdateProjectTests {

        @Test
        @DisplayName("Deve retornar 200 OK com projeto atualizado")
        void shouldUpdateProjectSuccessfully() throws Exception {
            UpdateProjectRequest request = new UpdateProjectRequest(
                "Projeto Reformulado", "client-1", "Cliente A", "Rua B", "Comercial",
                ProjectStatus.EXECUTIVE, ArchitecturalStyle.INDUSTRIAL, ConstructionType.STEEL_FRAME,
                500.0, 3, 10, true, true, 5, 20.0, true,
                LocalDateTime.now(), LocalDateTime.now().plusMonths(12),
                BigDecimal.valueOf(800000), BigDecimal.valueOf(150000), ProjectVisibility.TEAM
            );

            ProjectResponse response = sampleProjectResponse("proj-1", request.name());
            when(projectService.updateProject(eq("proj-1"), any(UpdateProjectRequest.class))).thenReturn(response);

            mockMvc.perform(put("/api/v1/projects/proj-1")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Projeto Reformulado"));
        }
    }

    @Nested
    @DisplayName("Endpoint PATCH /api/v1/projects/{id}/kanban")
    class MoveKanbanTests {

        @Test
        @DisplayName("Deve retornar 200 OK ao mover coluna")
        void shouldMoveKanbanSuccessfully() throws Exception {
            MoveKanbanColumnRequest request = new MoveKanbanColumnRequest("col-target-2");
            ProjectResponse response = sampleProjectResponse("proj-1", "Projeto");

            when(projectService.moveProjectKanban("proj-1", "col-target-2")).thenReturn(response);

            mockMvc.perform(patch("/api/v1/projects/proj-1/kanban")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("Endpoint GET /api/v1/projects/{id}/kanban-columns")
    class KanbanColumnsTests {

        @Test
        @DisplayName("Deve retornar 200 OK com lista de colunas")
        void shouldReturnKanbanColumns() throws Exception {
            ProjectKanbanColumnResponse col = new ProjectKanbanColumnResponse("col-1", "Briefing", "#6366F1", 0, "proj-1");
            when(projectService.getProjectKanbanColumns("proj-1")).thenReturn(List.of(col));

            mockMvc.perform(get("/api/v1/projects/proj-1/kanban-columns"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Briefing"));
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/projects/{id}/tasks")
    class CreateTaskTests {

        @Test
        @DisplayName("Deve retornar 201 Created ao adicionar tarefa")
        void shouldCreateTaskSuccessfully() throws Exception {
            CreateTaskRequest request = new CreateTaskRequest("Planta Baixa", "Desenhar planta no AutoCAD",
                TaskPriority.HIGH, LocalDateTime.now().plusDays(5), "stage-1", "user-1");

            TaskResponse response = new TaskResponse("task-1", request.title(), request.description(),
                request.priority(), request.dueDate(), 0, "PENDING", "proj-1", "stage-1", "user-1",
                LocalDateTime.now(), LocalDateTime.now());

            when(projectService.createTask(eq("proj-1"), any(CreateTaskRequest.class))).thenReturn(response);

            mockMvc.perform(post("/api/v1/projects/proj-1/tasks")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("task-1"))
                .andExpect(jsonPath("$.title").value("Planta Baixa"));
        }
    }

    @Nested
    @DisplayName("Endpoint DELETE /api/v1/projects/{id}")
    class DeleteProjectTests {

        @Test
        @DisplayName("Deve retornar 204 No Content no soft delete")
        void shouldDeleteProject() throws Exception {
            doNothing().when(projectService).deleteProject("proj-1");

            mockMvc.perform(delete("/api/v1/projects/proj-1"))
                .andExpect(status().isNoContent());
        }
    }
}
