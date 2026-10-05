package com.archflow.modules.auth.mapper;

import com.archflow.modules.auth.dto.UserResponse;
import com.archflow.modules.auth.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    UserResponse toResponse(User user);
}
