package com.archflow.modules.project.repository;

import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;
import com.archflow.modules.project.entity.Project;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("ProjectRepository - Testes de Integração com PostgreSQL")
class ProjectRepositoryIT {

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    @DisplayName("Deve persistir projeto e recuperar por ID se não deletado")
    void shouldPersistAndFindById() {
        Project project = Project.builder()
            .name("Casa Bauhaus Integrada")
            .clientName("Cliente Teste IT")
            .ownerId("usr-it-1")
            .totalArea(420.5)
            .status(ProjectStatus.CONCEPTUAL)
            .architecturalStyle(ArchitecturalStyle.MODERNISTA)
            .constructionType(ConstructionType.CONCRETO_ARMADO)
            .numberOfFloors(2)
            .numberOfRooms(6)
            .hasBasement(false)
            .hasGarage(true)
            .parkingSpots(3)
            .landscapingArea(120.0)
            .environmentalLicenseRequired(false)
            .plannedCost(BigDecimal.valueOf(650000.00))
            .visibility(ProjectVisibility.TEAM)
            .build();

        Project saved = projectRepository.save(project);
        assertThat(saved.getId()).isNotNull();

        Optional<Project> found = projectRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Casa Bauhaus Integrada");
        assertThat(found.get().getArchitecturalStyle()).isEqualTo(ArchitecturalStyle.MODERNISTA);

        // Soft delete
        found.get().markAsDeleted();
        projectRepository.save(found.get());

        Optional<Project> afterDelete = projectRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(afterDelete).isEmpty();
    }

    @Test
    @DisplayName("Deve filtrar projetos por termo de busca no searchProjects")
    void shouldSearchProjectsByTerm() {
        String uniqueSuffix = System.currentTimeMillis() + "";
        Project p1 = Project.builder()
            .name("Residencial Vila Real " + uniqueSuffix)
            .ownerId("usr-1")
            .status(ProjectStatus.CONCEPTUAL)
            .build();

        Project p2 = Project.builder()
            .name("Complexo Comercial Torre " + uniqueSuffix)
            .ownerId("usr-1")
            .status(ProjectStatus.EXECUTIVE)
            .build();

        projectRepository.save(p1);
        projectRepository.save(p2);

        Page<Project> result = projectRepository.searchProjects(
            "Vila Real", null, ProjectStatus.CONCEPTUAL, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).anyMatch(p -> p.getName().contains("Vila Real"));
    }
}
