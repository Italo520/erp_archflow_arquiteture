package com.archflow.modules.project.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.activity.entity.TimeLog;
import com.archflow.modules.activity.repository.TimeLogRepository;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.inspection.entity.SiteInspection;
import com.archflow.modules.inspection.repository.SiteInspectionRepository;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.repository.ProjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = DashboardMetricsController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("DashboardMetricsController - Testes da Camada Web e Agregação")
class DashboardMetricsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProjectRepository projectRepository;

    @MockitoBean
    private ClientRepository clientRepository;

    @MockitoBean
    private SiteInspectionRepository inspectionRepository;

    @MockitoBean
    private TimeLogRepository timeLogRepository;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    private Project buildProject(String id, String name, ProjectStatus status, BigDecimal plannedCost, LocalDateTime createdAt, LocalDateTime deletedAt) {
        Project project = Project.builder()
                .id(id)
                .name(name)
                .clientName("Cliente " + name)
                .status(status)
                .plannedCost(plannedCost)
                .actualCost(BigDecimal.valueOf(1000.0))
                .build();
        project.setCreatedAt(createdAt);
        project.setDeletedAt(deletedAt);
        return project;
    }

    @Nested
    @DisplayName("GET /api/v1/dashboard/metrics")
    class GetMetricsTests {

        @Test
        @DisplayName("TC-DSH-01: Deve retornar métricas agregadas com sucesso (ECP Válido)")
        void shouldReturnAggregatedMetricsSuccessfully() throws Exception {
            LocalDateTime now = LocalDateTime.now();

            Project p1 = buildProject("p1", "Residência Alpha", ProjectStatus.EXECUTIVE, new BigDecimal("85000.00"), now.minusDays(2), null);
            Project p2 = buildProject("p2", "Edifício Beta", ProjectStatus.CONSTRUCTION, new BigDecimal("120000.00"), now.minusDays(1), null);

            Client c1 = new Client();
            c1.setId("c1");
            Client c2 = new Client();
            c2.setId("c2");

            SiteInspection i1 = new SiteInspection();
            i1.setId("i1");

            TimeLog t1 = new TimeLog();
            t1.setId("t1");
            TimeLog t2 = new TimeLog();
            t2.setId("t2");
            TimeLog t3 = new TimeLog();
            t3.setId("t3");

            when(projectRepository.findAll()).thenReturn(List.of(p1, p2));
            when(clientRepository.findAll()).thenReturn(List.of(c1, c2));
            when(inspectionRepository.findAll()).thenReturn(List.of(i1));
            when(timeLogRepository.findAll()).thenReturn(List.of(t1, t2, t3));

            mockMvc.perform(get("/api/v1/dashboard/metrics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalProjects", is(2)))
                    .andExpect(jsonPath("$.totalClients", is(2)))
                    .andExpect(jsonPath("$.totalInspections", is(1)))
                    .andExpect(jsonPath("$.totalTimeLogs", is(3)))
                    .andExpect(jsonPath("$.totalPlannedCost", is(205000.00)))
                    .andExpect(jsonPath("$.statusDistribution.EXECUTIVE", is(1)))
                    .andExpect(jsonPath("$.statusDistribution.CONSTRUCTION", is(1)))
                    .andExpect(jsonPath("$.recentProjects", hasSize(2)));
        }

        @Test
        @DisplayName("TC-DSH-02: Deve filtrar entidades deletadas logicamente (Soft Delete)")
        void shouldFilterDeletedEntities() throws Exception {
            LocalDateTime now = LocalDateTime.now();

            Project activeProject = buildProject("p1", "Ativo", ProjectStatus.CONCEPTUAL, new BigDecimal("50000.00"), now, null);
            Project deletedProject = buildProject("p2", "Deletado", ProjectStatus.CONCEPTUAL, new BigDecimal("70000.00"), now, now);

            Client activeClient = new Client();
            activeClient.setId("c1");
            Client deletedClient = new Client();
            deletedClient.setId("c2");
            deletedClient.setDeletedAt(now);

            SiteInspection activeInspection = new SiteInspection();
            activeInspection.setId("i1");
            SiteInspection deletedInspection = new SiteInspection();
            deletedInspection.setId("i2");
            deletedInspection.setDeletedAt(now);

            TimeLog activeLog = new TimeLog();
            activeLog.setId("t1");
            TimeLog deletedLog = new TimeLog();
            deletedLog.setId("t2");
            deletedLog.setDeletedAt(now);

            when(projectRepository.findAll()).thenReturn(List.of(activeProject, deletedProject));
            when(clientRepository.findAll()).thenReturn(List.of(activeClient, deletedClient));
            when(inspectionRepository.findAll()).thenReturn(List.of(activeInspection, deletedInspection));
            when(timeLogRepository.findAll()).thenReturn(List.of(activeLog, deletedLog));

            mockMvc.perform(get("/api/v1/dashboard/metrics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalProjects", is(1)))
                    .andExpect(jsonPath("$.totalClients", is(1)))
                    .andExpect(jsonPath("$.totalInspections", is(1)))
                    .andExpect(jsonPath("$.totalTimeLogs", is(1)))
                    .andExpect(jsonPath("$.totalPlannedCost", is(50000.00)))
                    .andExpect(jsonPath("$.recentProjects", hasSize(1)))
                    .andExpect(jsonPath("$.recentProjects[0].name", is("Ativo")));
        }

        @Test
        @DisplayName("TC-DSH-03: Deve lidar com banco vazio e custos nulos (Boundary)")
        void shouldHandleEmptyDatabaseAndNullCosts() throws Exception {
            LocalDateTime now = LocalDateTime.now();
            Project projectWithoutCost = buildProject("p1", "Sem Custo", ProjectStatus.CONCEPTUAL, null, now, null);

            when(projectRepository.findAll()).thenReturn(List.of(projectWithoutCost));
            when(clientRepository.findAll()).thenReturn(List.of());
            when(inspectionRepository.findAll()).thenReturn(List.of());
            when(timeLogRepository.findAll()).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/dashboard/metrics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalProjects", is(1)))
                    .andExpect(jsonPath("$.totalClients", is(0)))
                    .andExpect(jsonPath("$.totalInspections", is(0)))
                    .andExpect(jsonPath("$.totalTimeLogs", is(0)))
                    .andExpect(jsonPath("$.totalPlannedCost", is(0)));
        }

        @Test
        @DisplayName("TC-DSH-04: Deve limitar aos 5 projetos mais recentes e ordenar por createdAt desc")
        void shouldLimitToFiveMostRecentProjectsAndSortDescending() throws Exception {
            LocalDateTime base = LocalDateTime.of(2026, 1, 1, 10, 0);
            List<Project> list = new ArrayList<>();

            for (int i = 1; i <= 8; i++) {
                list.add(buildProject("p" + i, "Projeto " + i, ProjectStatus.CONCEPTUAL,
                        BigDecimal.valueOf(1000 * i), base.plusDays(i), null));
            }

            when(projectRepository.findAll()).thenReturn(list);
            when(clientRepository.findAll()).thenReturn(List.of());
            when(inspectionRepository.findAll()).thenReturn(List.of());
            when(timeLogRepository.findAll()).thenReturn(List.of());

            mockMvc.perform(get("/api/v1/dashboard/metrics")
                            .contentType(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalProjects", is(8)))
                    .andExpect(jsonPath("$.recentProjects", hasSize(5)))
                    .andExpect(jsonPath("$.recentProjects[0].name", is("Projeto 8")))
                    .andExpect(jsonPath("$.recentProjects[1].name", is("Projeto 7")))
                    .andExpect(jsonPath("$.recentProjects[2].name", is("Projeto 6")))
                    .andExpect(jsonPath("$.recentProjects[3].name", is("Projeto 5")))
                    .andExpect(jsonPath("$.recentProjects[4].name", is("Projeto 4")));
        }
    }
}
