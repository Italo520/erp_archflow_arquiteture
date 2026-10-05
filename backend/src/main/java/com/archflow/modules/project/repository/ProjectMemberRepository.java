package com.archflow.modules.project.repository;

import com.archflow.modules.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, String> {
    List<ProjectMember> findByProjectId(String projectId);
    Optional<ProjectMember> findByProjectIdAndUserId(String projectId, String userId);
}
