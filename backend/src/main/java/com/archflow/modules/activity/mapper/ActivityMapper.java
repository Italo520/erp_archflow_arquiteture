package com.archflow.modules.activity.mapper;

import com.archflow.modules.activity.dto.ActivityResponse;
import com.archflow.modules.activity.dto.CreateActivityRequest;
import com.archflow.modules.activity.dto.CreateTimeLogRequest;
import com.archflow.modules.activity.dto.TimeLogResponse;
import com.archflow.modules.activity.entity.Activity;
import com.archflow.modules.activity.entity.TimeLog;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    builder = @Builder(disableBuilder = true),
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ActivityMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "SCHEDULED")
    @Mapping(target = "createdById", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Activity toActivityEntity(CreateActivityRequest request);

    ActivityResponse toActivityResponse(Activity activity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "billable", defaultValue = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    TimeLog toTimeLogEntity(CreateTimeLogRequest request);

    TimeLogResponse toTimeLogResponse(TimeLog timeLog);
}
