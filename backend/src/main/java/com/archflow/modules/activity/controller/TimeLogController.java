package com.archflow.modules.activity.controller;

import com.archflow.modules.activity.dto.CreateTimeLogRequest;
import com.archflow.modules.activity.dto.TimeLogResponse;
import com.archflow.modules.activity.dto.TimeSummaryResponse;
import com.archflow.modules.activity.service.ActivityService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/time-logs")
@Tag(name = "Time Tracking", description = "Endpoints para apontamento de horas, controle faturável e métricas de produtividade")
@SecurityRequirement(name = "Bearer Authentication")
public class TimeLogController {

    private final ActivityService activityService;

    public TimeLogController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @PostMapping
    @Operation(summary = "Registrar novo apontamento de horas")
    public ResponseEntity<TimeLogResponse> logTime(
        @Valid @RequestBody CreateTimeLogRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String userId = (userDetails != null) ? userDetails.getUsername() : "system-user";
        TimeLogResponse response = activityService.logTime(request, userId);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(response.id())
            .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar apontamentos de horas com paginação e filtros")
    public ResponseEntity<Page<TimeLogResponse>> listTimeLogs(
        @RequestParam(required = false) String projectId,
        @RequestParam(required = false) String userId,
        @RequestParam(required = false) Boolean billable,
        @PageableDefault(size = 20, sort = "logDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<TimeLogResponse> page = activityService.listTimeLogs(projectId, userId, billable, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/summary/{projectId}")
    @Operation(summary = "Obter resumo consolidado de horas e faturamento do projeto")
    public ResponseEntity<TimeSummaryResponse> getProjectTimeSummary(@PathVariable String projectId) {
        TimeSummaryResponse summary = activityService.getProjectTimeSummary(projectId);
        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir apontamento de horas (soft delete)")
    public ResponseEntity<Void> deleteTimeLog(@PathVariable String id) {
        activityService.deleteTimeLog(id);
        return ResponseEntity.noContent().build();
    }
}
