package com.archflow.modules.activity.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.dto.ActivityResponse;
import com.archflow.modules.activity.dto.CreateActivityRequest;
import com.archflow.modules.activity.dto.UpdateActivityStatusRequest;
import com.archflow.modules.activity.service.ActivityService;
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
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = ActivityController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("ActivityController - Testes da Camada Web")
class ActivityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private com.archflow.modules.activity.service.ActivityService activityService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    @Nested
    @DisplayName("Endpoint GET /api/v1/activities")
    class ListActivitiesEndpointTests {

        @Test
        @DisplayName("Deve retornar página de atividades")
        void shouldReturnPageOfActivities() throws Exception {
            ActivityResponse response = new ActivityResponse(
                "act-1", ActivityType.SITE_VISIT, "Visita à Obra", "Vistoria inicial",
                120, LocalDateTime.now(), LocalDateTime.now().plusHours(2), "Canteiro Central",
                ActivityStatus.SCHEDULED, "cli-1", "proj-1", "task-1", "admin",
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(activityService.listActivities(any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(response)));

            mockMvc.perform(get("/api/v1/activities"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value("act-1"))
                .andExpect(jsonPath("$.content[0].title").value("Visita à Obra"));
        }

        @Test
        @DisplayName("Deve retornar atividade por ID")
        void shouldReturnActivityById() throws Exception {
            ActivityResponse response = new ActivityResponse(
                "act-1", ActivityType.MEETING, "Reunião Cliente", null,
                60, LocalDateTime.now(), LocalDateTime.now().plusHours(1), "Sala de Reuniões",
                ActivityStatus.SCHEDULED, "cli-1", "proj-1", null, "admin",
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(activityService.getActivityById("act-1")).thenReturn(response);

            mockMvc.perform(get("/api/v1/activities/act-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("act-1"))
                .andExpect(jsonPath("$.type").value("MEETING"));
        }
    }

    @Nested
    @DisplayName("Endpoint POST /api/v1/activities")
    class CreateActivityEndpointTests {

        @Test
        @DisplayName("Deve criar atividade e retornar 201 Created")
        void shouldCreateActivity() throws Exception {
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.DESIGN, "Desenho Executivo", "Entrega da maquete",
                180, LocalDateTime.now().plusDays(2), LocalDateTime.now().plusDays(2).plusHours(3),
                "Studio", "cli-1", "proj-1", "task-1"
            );
            ActivityResponse response = new ActivityResponse(
                "act-99", ActivityType.DESIGN, "Desenho Executivo", "Entrega da maquete",
                180, request.startTime(), request.endTime(), "Studio",
                ActivityStatus.SCHEDULED, "cli-1", "proj-1", "task-1", "system",
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(activityService.createActivity(any(CreateActivityRequest.class), any())).thenReturn(response);

            mockMvc.perform(post("/api/v1/activities")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value("act-99"));
        }
    }

    @Nested
    @DisplayName("Endpoint PATCH e DELETE /api/v1/activities/{id}")
    class LifecycleEndpointTests {

        @Test
        @DisplayName("Deve atualizar status")
        void shouldUpdateActivityStatus() throws Exception {
            UpdateActivityStatusRequest request = new UpdateActivityStatusRequest(ActivityStatus.COMPLETED);
            ActivityResponse response = new ActivityResponse(
                "act-1", ActivityType.MEETING, "Reunião", null,
                null, null, null, null,
                ActivityStatus.COMPLETED, null, null, null, "admin",
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(activityService.updateActivityStatus(eq("act-1"), eq(ActivityStatus.COMPLETED))).thenReturn(response);

            mockMvc.perform(patch("/api/v1/activities/act-1/status")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("COMPLETED"));
        }

        @Test
        @DisplayName("Deve remover atividade e retornar 204")
        void shouldDeleteActivity() throws Exception {
            doNothing().when(activityService).deleteActivity("act-1");

            mockMvc.perform(delete("/api/v1/activities/act-1"))
                .andExpect(status().isNoContent());
        }
    }
}
