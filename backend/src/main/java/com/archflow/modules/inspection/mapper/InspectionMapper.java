package com.archflow.modules.inspection.mapper;

import com.archflow.modules.inspection.dto.CreatePunchListItemRequest;
import com.archflow.modules.inspection.dto.CreateSiteInspectionRequest;
import com.archflow.modules.inspection.dto.PunchListItemResponse;
import com.archflow.modules.inspection.dto.SiteInspectionResponse;
import com.archflow.modules.inspection.entity.PunchListItem;
import com.archflow.modules.inspection.entity.SiteInspection;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    builder = @Builder(disableBuilder = true),
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface InspectionMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "DRAFT")
    @Mapping(target = "inspectorId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    SiteInspection toInspectionEntity(CreateSiteInspectionRequest request);

    SiteInspectionResponse toInspectionResponse(SiteInspection inspection);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "afterPhotoUrl", ignore = true)
    @Mapping(target = "resolutionNotes", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "inspectionId", ignore = true)
    @Mapping(target = "projectId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    PunchListItem toPunchListEntity(CreatePunchListItemRequest request);

    PunchListItemResponse toPunchListResponse(PunchListItem item);
}
