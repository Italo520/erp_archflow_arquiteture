package com.archflow.modules.project.repository;

import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, String> {

    Optional<Project> findByIdAndDeletedAtIsNull(String id);

    List<Project> findByClientIdAndDeletedAtIsNull(String clientId);

    Page<Project> findByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT p FROM Project p WHERE p.deletedAt IS NULL AND " +
           "(:clientId IS NULL OR p.clientId = :clientId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')) OR LOWER(p.clientName) LIKE LOWER(CONCAT('%', CAST(:searchTerm AS string), '%')))")
    Page<Project> searchProjects(
        @Param("searchTerm") String searchTerm,
        @Param("clientId") String clientId,
        @Param("status") ProjectStatus status,
        Pageable pageable
    );
}
