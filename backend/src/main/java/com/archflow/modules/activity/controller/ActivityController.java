package com.archflow.modules.activity.controller;

import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.dto.ActivityResponse;
import com.archflow.modules.activity.dto.CreateActivityRequest;
import com.archflow.modules.activity.dto.UpdateActivityStatusRequest;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/activities")
@Tag(name = "Atividades", description = "Endpoints para agendamento de reuniões, visitas técnicas e prazos")
@SecurityRequirement(name = "Bearer Authentication")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    @Operation(summary = "Listar atividades com filtros e paginação")
    public ResponseEntity<Page<ActivityResponse>> listActivities(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String projectId,
        @RequestParam(required = false) String clientId,
        @RequestParam(required = false) ActivityStatus status,
        @RequestParam(required = false) ActivityType type,
        @PageableDefault(size = 20, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ActivityResponse> page = activityService.listActivities(search, projectId, clientId, status, type, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar atividade por ID")
    public ResponseEntity<ActivityResponse> getActivityById(@PathVariable String id) {
        ActivityResponse response = activityService.getActivityById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Criar nova atividade")
    public ResponseEntity<ActivityResponse> createActivity(
        @Valid @RequestBody CreateActivityRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String createdById = (userDetails != null) ? userDetails.getUsername() : "system";
        ActivityResponse response = activityService.createActivity(request, createdById);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(response.id())
            .toUri();
        return ResponseEntity.created(location).body(response);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da atividade")
    public ResponseEntity<ActivityResponse> updateActivityStatus(
        @PathVariable String id,
        @Valid @RequestBody UpdateActivityStatusRequest request
    ) {
        ActivityResponse response = activityService.updateActivityStatus(id, request.status());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir atividade (soft delete)")
    public ResponseEntity<Void> deleteActivity(@PathVariable String id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
