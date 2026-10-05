package com.archflow.modules.inspection.controller;

import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.ResolvePunchListItemRequest;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import com.archflow.modules.inspection.service.InspectionService;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/inspections")
@Tag(name = "Vistorias Técnicas & Punch List", description = "Endpoints para gerenciamento de vistorias de obra e controle de pendências")
@SecurityRequirement(name = "Bearer Authentication")
public class InspectionController {

    private final InspectionService inspectionService;

    public InspectionController(InspectionService inspectionService) {
        this.inspectionService = inspectionService;
    }

    @GetMapping
    @Operation(summary = "Listar vistorias técnicas com filtros")
    public ResponseEntity<Page<SiteInspectionResponse>> listInspections(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String projectId,
        @RequestParam(required = false) InspectionStatus status,
        @PageableDefault(size = 20, sort = "date", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<SiteInspectionResponse> page = inspectionService.listInspections(search, projectId, status, pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obter detalhes de uma vistoria por ID")
    public ResponseEntity<SiteInspectionResponse> getInspectionById(@PathVariable String id) {
        SiteInspectionResponse response = inspectionService.getInspectionById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Registrar nova vistoria técnica de obra")
    public ResponseEntity<SiteInspectionResponse> createInspection(
        @Valid @RequestBody CreateSiteInspectionRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        String inspectorId = (userDetails != null) ? userDetails.getUsername() : "inspector";
        SiteInspectionResponse created = inspectionService.createInspection(request, inspectorId);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(created.id())
            .toUri();
        return ResponseEntity.created(location).body(created);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Atualizar status da vistoria")
    public ResponseEntity<SiteInspectionResponse> updateInspectionStatus(
        @PathVariable String id,
        @RequestParam InspectionStatus status
    ) {
        SiteInspectionResponse updated = inspectionService.updateInspectionStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/items")
    @Operation(summary = "Adicionar item de pendência (Punch List) à vistoria")
    public ResponseEntity<PunchListItemResponse> addPunchListItem(
        @PathVariable String id,
        @Valid @RequestBody CreatePunchListItemRequest request
    ) {
        PunchListItemResponse created = inspectionService.addPunchListItem(id, request);
        return ResponseEntity.status(201).body(created);
    }

    @GetMapping("/{id}/items")
    @Operation(summary = "Listar pendências da vistoria")
    public ResponseEntity<List<PunchListItemResponse>> getInspectionItems(@PathVariable String id) {
        List<PunchListItemResponse> items = inspectionService.getInspectionItems(id);
        return ResponseEntity.ok(items);
    }

    @PatchMapping("/items/{itemId}/resolve")
    @Operation(summary = "Marcar item de pendência como resolvido")
    public ResponseEntity<PunchListItemResponse> resolvePunchListItem(
        @PathVariable String itemId,
        @Valid @RequestBody ResolvePunchListItemRequest request
    ) {
        PunchListItemResponse resolved = inspectionService.resolvePunchListItem(itemId, request);
        return ResponseEntity.ok(resolved);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir vistoria logicamente")
    public ResponseEntity<Void> deleteInspection(@PathVariable String id) {
        inspectionService.deleteInspection(id);
        return ResponseEntity.noContent().build();
    }
}
