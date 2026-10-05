package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.Stage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StageRepository extends JpaRepository<Stage, String> {

    List<Stage> findByProjectIdOrderByOrderAsc(String projectId);
}
