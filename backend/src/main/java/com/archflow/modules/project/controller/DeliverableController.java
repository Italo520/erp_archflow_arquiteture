package com.archflow.modules.project.controller;

import com.archflow.modules.project.entity.Deliverable;
import com.archflow.modules.project.repository.DeliverableRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class DeliverableController {

    private final DeliverableRepository deliverableRepository;

    public DeliverableController(DeliverableRepository deliverableRepository) {
        this.deliverableRepository = deliverableRepository;
    }

    @GetMapping("/projects/{projectId}/deliverables")
    public ResponseEntity<List<Deliverable>> getDeliverablesByProject(@PathVariable String projectId) {
        List<Deliverable> deliverables = deliverableRepository.findByProjectIdAndDeletedAtIsNull(projectId);
        return ResponseEntity.ok(deliverables);
    }

    @PostMapping("/projects/{projectId}/deliverables")
    public ResponseEntity<Deliverable> createDeliverable(
            @PathVariable String projectId,
            @RequestBody Deliverable deliverable
    ) {
        deliverable.setProjectId(projectId);
        if (deliverable.getStatus() == null) {
            deliverable.setStatus("DRAFT");
        }
        if (deliverable.getVersion() == null) {
            deliverable.setVersion(1);
        }
        Deliverable saved = deliverableRepository.save(deliverable);
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/deliverables/{id}/status")
    public ResponseEntity<Deliverable> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> payload
    ) {
        return deliverableRepository.findById(id)
                .map(deliv -> {
                    if (payload.containsKey("status")) {
                        deliv.setStatus(payload.get("status"));
                    }
                    if (payload.containsKey("approvedById")) {
                        deliv.setApprovedById(payload.get("approvedById"));
                    }
                    deliv.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(deliverableRepository.save(deliv));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/deliverables/{id}")
    public ResponseEntity<Void> deleteDeliverable(@PathVariable String id) {
        return deliverableRepository.findById(id)
                .map(deliv -> {
                    deliv.setDeletedAt(LocalDateTime.now());
                    deliverableRepository.save(deliv);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
