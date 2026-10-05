package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.Deliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, String> {
    List<Deliverable> findByProjectId(String projectId);
    List<Deliverable> findByProjectIdAndDeletedAtIsNull(String projectId);
}
