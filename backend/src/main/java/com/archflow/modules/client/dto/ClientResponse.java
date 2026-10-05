package com.archflow.modules.client.dto;

import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ClientResponse(
    String id,
    String name,
    String email,
    String phone,
    String website,
    ClientLegalType legalType,
    String document,
    String razaoSocial,
    String inscricaoEstadual,
    String address,
    ClientCategory category,
    ClientStatus status,
    Double rating,
    BigDecimal totalSpent,
    String avatar,
    String notes,
    ContactPreference contactPreference,
    String userId,
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    LocalDateTime lastInteractionAt
) {}
