package com.archflow.modules.inspection.service.impl;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.domain.PunchListStatus;
import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.ResolvePunchListItemRequest;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import com.archflow.modules.inspection.entity.PunchListItem;
import com.archflow.modules.inspection.entity.SiteInspection;
import com.archflow.modules.inspection.mapper.InspectionMapper;
import com.archflow.modules.inspection.repository.PunchListItemRepository;
import com.archflow.modules.inspection.repository.SiteInspectionRepository;
import com.archflow.modules.inspection.service.InspectionService;
import com.archflow.modules.project.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class InspectionServiceImpl implements InspectionService {

    private final SiteInspectionRepository inspectionRepository;
    private final PunchListItemRepository itemRepository;
    private final ProjectRepository projectRepository;
    private final InspectionMapper mapper;

    public InspectionServiceImpl(
        SiteInspectionRepository inspectionRepository,
        PunchListItemRepository itemRepository,
        ProjectRepository projectRepository,
        InspectionMapper mapper
    ) {
        this.inspectionRepository = inspectionRepository;
        this.itemRepository = itemRepository;
        this.projectRepository = projectRepository;
        this.mapper = mapper;
    }

    @Override
    public Page<SiteInspectionResponse> listInspections(String search, String projectId, InspectionStatus status, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<SiteInspection> page = inspectionRepository.searchInspections(trimmedSearch, projectId, status, pageable);
        return page.map(mapper::toInspectionResponse);
    }

    @Override
    public SiteInspectionResponse getInspectionById(String id) {
        SiteInspection inspection = findActiveInspectionById(id);
        return mapper.toInspectionResponse(inspection);
    }

    @Override
    @Transactional
    public SiteInspectionResponse createInspection(CreateSiteInspectionRequest request, String inspectorId) {
        projectRepository.findByIdAndDeletedAtIsNull(request.projectId())
            .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com id: " + request.projectId()));

        SiteInspection inspection = mapper.toInspectionEntity(request);
        inspection.setInspectorId(inspectorId != null ? inspectorId : "inspector-user");
        if (request.date() != null) {
            inspection.setDate(request.date());
        } else {
            inspection.setDate(LocalDateTime.now());
        }
        inspection.setStatus(InspectionStatus.DRAFT);

        SiteInspection saved = inspectionRepository.save(inspection);
        return mapper.toInspectionResponse(saved);
    }

    @Override
    @Transactional
    public SiteInspectionResponse updateInspectionStatus(String id, InspectionStatus status) {
        if (status == null) {
            throw new BusinessException("O status da vistoria não pode ser nulo.");
        }
        SiteInspection inspection = findActiveInspectionById(id);
        inspection.setStatus(status);
        SiteInspection updated = inspectionRepository.save(inspection);
        return mapper.toInspectionResponse(updated);
    }

    @Override
    @Transactional
    public PunchListItemResponse addPunchListItem(String inspectionId, CreatePunchListItemRequest request) {
        SiteInspection inspection = findActiveInspectionById(inspectionId);

        PunchListItem item = mapper.toPunchListEntity(request);
        item.setInspectionId(inspection.getId());
        item.setProjectId(inspection.getProjectId());
        item.setStatus(PunchListStatus.PENDING);

        PunchListItem saved = itemRepository.save(item);
        return mapper.toPunchListResponse(saved);
    }

    @Override
    @Transactional
    public PunchListItemResponse resolvePunchListItem(String itemId, ResolvePunchListItemRequest request) {
        PunchListItem item = itemRepository.findByIdAndDeletedAtIsNull(itemId)
            .orElseThrow(() -> new ResourceNotFoundException("Item de pendência não encontrado com id: " + itemId));

        if (item.getStatus() == PunchListStatus.RESOLVED) {
            throw new BusinessException("Este item de pendência já foi resolvido anteriormente.");
        }

        item.setStatus(PunchListStatus.RESOLVED);
        item.setResolutionNotes(request.resolutionNotes());
        if (request.afterPhotoUrl() != null && !request.afterPhotoUrl().isBlank()) {
            item.setAfterPhotoUrl(request.afterPhotoUrl());
        }
        item.setResolvedAt(LocalDateTime.now());

        PunchListItem updated = itemRepository.save(item);
        return mapper.toPunchListResponse(updated);
    }

    @Override
    public List<PunchListItemResponse> getInspectionItems(String inspectionId) {
        findActiveInspectionById(inspectionId);
        return itemRepository.findByInspectionIdAndDeletedAtIsNullOrderByCreatedAtDesc(inspectionId).stream()
            .map(mapper::toPunchListResponse)
            .toList();
    }

    @Override
    @Transactional
    public void deleteInspection(String id) {
        SiteInspection inspection = findActiveInspectionById(id);
        inspection.markAsDeleted();
        inspectionRepository.save(inspection);
    }

    private SiteInspection findActiveInspectionById(String id) {
        return inspectionRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vistoria técnica não encontrada com id: " + id));
    }
}
