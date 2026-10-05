package com.archflow.modules.activity.repository;

import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {

    Optional<Activity> findByIdAndDeletedAtIsNull(String id);

    Page<Activity> findByDeletedAtIsNull(Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE a.deletedAt IS NULL AND " +
           "(:projectId IS NULL OR a.projectId = :projectId) AND " +
           "(:clientId IS NULL OR a.clientId = :clientId) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:type IS NULL OR a.type = :type) AND " +
           "(:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))")
    Page<Activity> searchActivities(
        @Param("search") String search,
        @Param("projectId") String projectId,
        @Param("clientId") String clientId,
        @Param("status") ActivityStatus status,
        @Param("type") ActivityType type,
        Pageable pageable
    );
}
