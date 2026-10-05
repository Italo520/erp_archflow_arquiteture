package com.archflow.modules.project.entity;

import com.archflow.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
public class Budget extends BaseEntity {

    @Column(name = "project_id", nullable = false, unique = true, length = 36)
    private String projectId;

    @Column(name = "total_budget", nullable = false)
    private BigDecimal totalBudget = BigDecimal.ZERO;

    @Column(name = "spent_amount", nullable = false)
    private BigDecimal spentAmount = BigDecimal.ZERO;

    @Column(name = "remaining_amount", nullable = false)
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    private String status = "DRAFT";

    @Column(name = "budget_breakdown", columnDefinition = "TEXT")
    private String budgetBreakdown;

    public Budget() {}

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public BigDecimal getTotalBudget() {
        return totalBudget;
    }

    public void setTotalBudget(BigDecimal totalBudget) {
        this.totalBudget = totalBudget;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBudgetBreakdown() {
        return budgetBreakdown;
    }

    public void setBudgetBreakdown(String budgetBreakdown) {
        this.budgetBreakdown = budgetBreakdown;
    }
}
