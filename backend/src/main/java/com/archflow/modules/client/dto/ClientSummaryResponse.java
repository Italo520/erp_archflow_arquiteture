package com.archflow.modules.client.dto;

import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;

import java.math.BigDecimal;

public record ClientSummaryResponse(
    String id,
    String name,
    String email,
    String phone,
    ClientLegalType legalType,
    String document,
    ClientCategory category,
    ClientStatus status,
    Double rating,
    BigDecimal totalSpent
) {}
