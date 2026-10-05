package com.archflow.modules.activity.controller;

import com.archflow.core.exception.GlobalExceptionHandler;
import com.archflow.modules.activity.domain.TimeLogCategory;
import com.archflow.modules.activity.dto.CreateTimeLogRequest;
import com.archflow.modules.activity.dto.TimeLogResponse;
import com.archflow.modules.activity.dto.TimeSummaryResponse;
import com.archflow.modules.activity.service.ActivityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TimeLogController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
@DisplayName("TimeLogController - Testes da Camada Web")
class TimeLogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ActivityService activityService;

    @MockitoBean
    private com.archflow.core.security.JwtService jwtService;

    @MockitoBean
    private com.archflow.modules.auth.repository.UserRepository userRepository;

    @Test
    @DisplayName("POST /api/v1/time-logs - Deve registrar horas e retornar 201 Created")
    void shouldLogTime() throws Exception {
        CreateTimeLogRequest request = new CreateTimeLogRequest(
            3.5,
            TimeLogCategory.DESIGN,
            "Detalhamento de marcenaria",
            LocalDate.now(),
            LocalTime.of(9, 0),
            LocalTime.of(12, 30),
            true,
            BigDecimal.valueOf(160.00),
            "proj-1",
            "task-1",
            "cli-1"
        );
        TimeLogResponse response = new TimeLogResponse(
            "tl-1",
            3.5,
            TimeLogCategory.DESIGN,
            "Detalhamento de marcenaria",
            LocalDate.now(),
            LocalTime.of(9, 0),
            LocalTime.of(12, 30),
            true,
            BigDecimal.valueOf(160.00),
            "arch-1",
            "proj-1",
            "task-1",
            "cli-1",
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        when(activityService.logTime(any(CreateTimeLogRequest.class), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/time-logs")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(header().exists("Location"))
            .andExpect(jsonPath("$.id").value("tl-1"))
            .andExpect(jsonPath("$.duration").value(3.5));
    }

    @Test
    @DisplayName("GET /api/v1/time-logs - Deve listar apontamentos de horas paginados")
    void shouldListTimeLogs() throws Exception {
        TimeLogResponse response = new TimeLogResponse(
            "tl-1",
            2.0,
            TimeLogCategory.DESIGN,
            "Renderização",
            LocalDate.now(),
            null,
            null,
            false,
            null,
            "arch-1",
            "proj-1",
            null,
            null,
            LocalDateTime.now(),
            LocalDateTime.now()
        );
        when(activityService.listTimeLogs(any(), any(), any(), any(Pageable.class)))
            .thenReturn(new PageImpl<>(List.of(response)));

        mockMvc.perform(get("/api/v1/time-logs"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.content[0].id").value("tl-1"));
    }

    @Test
    @DisplayName("GET /api/v1/time-logs/summary/{projectId} - Deve retornar resumo financeiro e horas do projeto")
    void shouldReturnProjectTimeSummary() throws Exception {
        TimeSummaryResponse summary = new TimeSummaryResponse(10.0, 8.0, 2.0, BigDecimal.valueOf(1200.00));
        when(activityService.getProjectTimeSummary("proj-1")).thenReturn(summary);

        mockMvc.perform(get("/api/v1/time-logs/summary/proj-1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalHours").value(10.0))
            .andExpect(jsonPath("$.billableHours").value(8.0))
            .andExpect(jsonPath("$.nonBillableHours").value(2.0))
            .andExpect(jsonPath("$.totalBillableAmount").value(1200.00));
    }

    @Test
    @DisplayName("DELETE /api/v1/time-logs/{id} - Deve excluir apontamento e retornar 204")
    void shouldDeleteTimeLog() throws Exception {
        doNothing().when(activityService).deleteTimeLog("tl-1");

        mockMvc.perform(delete("/api/v1/time-logs/tl-1"))
            .andExpect(status().isNoContent());
    }
}
