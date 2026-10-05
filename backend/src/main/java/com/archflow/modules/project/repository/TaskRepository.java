package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, String> {

    Optional<Task> findByIdAndDeletedAtIsNull(String id);

    List<Task> findByProjectIdAndDeletedAtIsNullOrderByPositionAsc(String projectId);

    List<Task> findByStageIdAndDeletedAtIsNullOrderByPositionAsc(String stageId);
}
