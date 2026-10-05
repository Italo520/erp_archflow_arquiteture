package com.archflow.modules.project.controller;

import com.archflow.modules.project.entity.ProjectMember;
import com.archflow.modules.project.repository.ProjectMemberRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberRepository projectMemberRepository;

    public ProjectMemberController(ProjectMemberRepository projectMemberRepository) {
        this.projectMemberRepository = projectMemberRepository;
    }

    @GetMapping
    public ResponseEntity<List<ProjectMember>> getMembers(@PathVariable String projectId) {
        return ResponseEntity.ok(projectMemberRepository.findByProjectId(projectId));
    }

    @PostMapping
    public ResponseEntity<ProjectMember> addMember(
            @PathVariable String projectId,
            @RequestBody ProjectMember member
    ) {
        member.setProjectId(projectId);
        member.setJoinedAt(LocalDateTime.now());
        ProjectMember saved = projectMemberRepository.save(member);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable String projectId,
            @PathVariable String memberId
    ) {
        return projectMemberRepository.findById(memberId)
                .map(m -> {
                    projectMemberRepository.delete(m);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
