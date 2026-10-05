package com.archflow.modules.inspection.service;

import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.ResolvePunchListItemRequest;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InspectionService {

    Page<SiteInspectionResponse> listInspections(String search, String projectId, InspectionStatus status, Pageable pageable);

    SiteInspectionResponse getInspectionById(String id);

    SiteInspectionResponse createInspection(CreateSiteInspectionRequest request, String inspectorId);

    SiteInspectionResponse updateInspectionStatus(String id, InspectionStatus status);

    PunchListItemResponse addPunchListItem(String inspectionId, CreatePunchListItemRequest request);

    PunchListItemResponse resolvePunchListItem(String itemId, ResolvePunchListItemRequest request);

    List<PunchListItemResponse> getInspectionItems(String inspectionId);

    void deleteInspection(String id);
}
