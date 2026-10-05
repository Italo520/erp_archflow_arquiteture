package com.archflow.modules.inspection.repository;

import com.archflow.modules.inspection.domain.PunchListStatus;
import com.archflow.modules.inspection.entity.PunchListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PunchListItemRepository extends JpaRepository<PunchListItem, String> {

    Optional<PunchListItem> findByIdAndDeletedAtIsNull(String id);

    List<PunchListItem> findByInspectionIdAndDeletedAtIsNullOrderByCreatedAtDesc(String inspectionId);

    List<PunchListItem> findByProjectIdAndDeletedAtIsNullOrderByCreatedAtDesc(String projectId);

    List<PunchListItem> findByProjectIdAndStatusAndDeletedAtIsNull(String projectId, PunchListStatus status);
}
