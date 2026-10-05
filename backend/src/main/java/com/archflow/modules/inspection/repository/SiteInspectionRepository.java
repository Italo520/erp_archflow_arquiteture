package com.archflow.modules.inspection.repository;

import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.entity.SiteInspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SiteInspectionRepository extends JpaRepository<SiteInspection, String> {

    Optional<SiteInspection> findByIdAndDeletedAtIsNull(String id);

    List<SiteInspection> findByProjectIdAndDeletedAtIsNullOrderByDateDesc(String projectId);

    Page<SiteInspection> findByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT s FROM SiteInspection s WHERE s.deletedAt IS NULL AND " +
           "(:projectId IS NULL OR s.projectId = :projectId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:search IS NULL OR LOWER(s.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<SiteInspection> searchInspections(
        @Param("search") String search,
        @Param("projectId") String projectId,
        @Param("status") InspectionStatus status,
        Pageable pageable
    );
}
