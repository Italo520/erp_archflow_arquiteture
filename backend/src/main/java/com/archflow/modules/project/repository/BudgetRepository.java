package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    Optional<Budget> findByProjectId(String projectId);
}
