package com.archflow.modules.project.controller;

import com.archflow.modules.project.entity.Budget;
import com.archflow.modules.project.repository.BudgetRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/budget")
public class BudgetController {

    private final BudgetRepository budgetRepository;

    public BudgetController(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    @GetMapping
    public ResponseEntity<Budget> getBudget(@PathVariable String projectId) {
        return budgetRepository.findByProjectId(projectId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    // Return a default initial budget object if none exists yet
                    Budget defaultBudget = new Budget();
                    defaultBudget.setProjectId(projectId);
                    defaultBudget.setTotalBudget(BigDecimal.ZERO);
                    defaultBudget.setSpentAmount(BigDecimal.ZERO);
                    defaultBudget.setRemainingAmount(BigDecimal.ZERO);
                    defaultBudget.setStatus("DRAFT");
                    return ResponseEntity.ok(defaultBudget);
                });
    }

    @PostMapping
    public ResponseEntity<Budget> saveOrUpdateBudget(
            @PathVariable String projectId,
            @RequestBody Budget budget
    ) {
        Budget existing = budgetRepository.findByProjectId(projectId).orElse(new Budget());
        existing.setProjectId(projectId);
        if (budget.getTotalBudget() != null) existing.setTotalBudget(budget.getTotalBudget());
        if (budget.getSpentAmount() != null) existing.setSpentAmount(budget.getSpentAmount());
        if (budget.getRemainingAmount() != null) {
            existing.setRemainingAmount(budget.getRemainingAmount());
        } else if (existing.getTotalBudget() != null && existing.getSpentAmount() != null) {
            existing.setRemainingAmount(existing.getTotalBudget().subtract(existing.getSpentAmount()));
        }
        if (budget.getStatus() != null) existing.setStatus(budget.getStatus());
        if (budget.getBudgetBreakdown() != null) existing.setBudgetBreakdown(budget.getBudgetBreakdown());
        existing.setUpdatedAt(LocalDateTime.now());

        Budget saved = budgetRepository.save(existing);
        return ResponseEntity.ok(saved);
    }
}
