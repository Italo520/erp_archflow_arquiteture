package com.archflow.modules.client.mapper;

import com.archflow.modules.client.dto.ClientResponse;
import com.archflow.modules.client.dto.ClientSummaryResponse;
import com.archflow.modules.client.dto.CreateClientRequest;
import com.archflow.modules.client.dto.UpdateClientRequest;
import com.archflow.modules.client.entity.Client;
import org.mapstruct.Builder;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    builder = @Builder(disableBuilder = true),
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ClientMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PROSPECT")
    @Mapping(target = "rating", constant = "5.0")
    @Mapping(target = "totalSpent", expression = "java(java.math.BigDecimal.ZERO)")
    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "lastInteractionAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Client toEntity(CreateClientRequest request);

    ClientResponse toResponse(Client client);

    ClientSummaryResponse toSummaryResponse(Client client);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "totalSpent", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "lastInteractionAt", ignore = true)
    void updateEntityFromRequest(UpdateClientRequest request, @MappingTarget Client client);
}
