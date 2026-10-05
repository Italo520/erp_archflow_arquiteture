package com.archflow.modules.project.controller;

import com.archflow.modules.activity.repository.TimeLogRepository;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.inspection.repository.SiteInspectionRepository;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.repository.ProjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardMetricsController {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final SiteInspectionRepository inspectionRepository;
    private final TimeLogRepository timeLogRepository;

    public DashboardMetricsController(
            ProjectRepository projectRepository,
            ClientRepository clientRepository,
            SiteInspectionRepository inspectionRepository,
            TimeLogRepository timeLogRepository
    ) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.inspectionRepository = inspectionRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        List<Project> allProjects = projectRepository.findAll().stream()
                .filter(p -> p.getDeletedAt() == null)
                .collect(Collectors.toList());

        long clientCount = clientRepository.findAll().stream()
                .filter(c -> c.getDeletedAt() == null)
                .count();

        long inspectionCount = inspectionRepository.findAll().stream()
                .filter(i -> i.getDeletedAt() == null)
                .count();

        long timeLogCount = timeLogRepository.findAll().stream()
                .filter(t -> t.getDeletedAt() == null)
                .count();

        // Calcular volume financeiro total orçado
        BigDecimal totalPlannedCost = allProjects.stream()
                .map(Project::getPlannedCost)
                .filter(cost -> cost != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Agrupamento por status
        Map<String, Long> statusDistribution = allProjects.stream()
                .collect(Collectors.groupingBy(p -> p.getStatus().name(), Collectors.counting()));

        // Projetos recentes
        List<Map<String, Object>> recentProjects = allProjects.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", p.getId());
                    map.put("name", p.getName());
                    map.put("clientName", p.getClientName());
                    map.put("status", p.getStatus().name());
                    map.put("plannedCost", p.getPlannedCost());
                    map.put("actualCost", p.getActualCost());
                    map.put("createdAt", p.getCreatedAt());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("totalProjects", allProjects.size());
        response.put("totalClients", clientCount);
        response.put("totalInspections", inspectionCount);
        response.put("totalTimeLogs", timeLogCount);
        response.put("totalPlannedCost", totalPlannedCost);
        response.put("statusDistribution", statusDistribution);
        response.put("recentProjects", recentProjects);

        return ResponseEntity.ok(response);
    }
}
