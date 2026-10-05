package com.archflow.modules.activity.dto;

import java.math.BigDecimal;

public record TimeSummaryResponse(
    Double totalHours,
    Double billableHours,
    Double nonBillableHours,
    BigDecimal totalBillableAmount
) {}
