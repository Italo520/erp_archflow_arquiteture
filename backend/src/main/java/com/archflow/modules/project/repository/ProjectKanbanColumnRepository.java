package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.ProjectKanbanColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectKanbanColumnRepository extends JpaRepository<ProjectKanbanColumn, String> {

    List<ProjectKanbanColumn> findByProjectIdOrderByOrderAsc(String projectId);
}
