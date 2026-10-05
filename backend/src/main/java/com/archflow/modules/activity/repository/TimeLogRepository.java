package com.archflow.modules.activity.repository;

import com.archflow.modules.activity.entity.TimeLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeLogRepository extends JpaRepository<TimeLog, String> {

    Optional<TimeLog> findByIdAndDeletedAtIsNull(String id);

    List<TimeLog> findByProjectIdAndDeletedAtIsNull(String projectId);

    List<TimeLog> findByUserIdAndDeletedAtIsNull(String userId);

    @Query("SELECT t FROM TimeLog t WHERE t.deletedAt IS NULL AND " +
           "(:projectId IS NULL OR t.projectId = :projectId) AND " +
           "(:userId IS NULL OR t.userId = :userId) AND " +
           "(:billable IS NULL OR t.billable = :billable)")
    Page<TimeLog> searchTimeLogs(
        @Param("projectId") String projectId,
        @Param("userId") String userId,
        @Param("billable") Boolean billable,
        Pageable pageable
    );
}
