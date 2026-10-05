package com.archflow.modules.inspection.repository;

import com.archflow.modules.inspection.domain.InspectionStatus;
import com.archflow.modules.inspection.domain.PunchListSeverity;
import com.archflow.modules.inspection.domain.PunchListStatus;
import com.archflow.modules.inspection.entity.PunchListItem;
import com.archflow.modules.inspection.entity.SiteInspection;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.repository.ProjectRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("SiteInspectionRepository - Testes de Integração com PostgreSQL")
class SiteInspectionRepositoryIT {

    @Autowired
    private SiteInspectionRepository inspectionRepository;

    @Autowired
    private PunchListItemRepository itemRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Test
    @DisplayName("Deve persistir vistoria com itens de punch list e recuperar por ID")
    void shouldPersistInspectionAndPunchListItem() {
        Project project = Project.builder()
            .name("Projeto Vistoria IT")
            .ownerId("usr-it")
            .build();
        project = projectRepository.save(project);

        SiteInspection inspection = new SiteInspection(
            "Vistoria Alvenaria 2º Pavimento",
            LocalDateTime.now(),
            InspectionStatus.DRAFT,
            "Alvenaria concluída conforme projeto estrutural",
            "Céu claro",
            project.getId(),
            "usr-it"
        );
        SiteInspection savedInspection = inspectionRepository.save(inspection);
        assertThat(savedInspection.getId()).isNotNull();

        PunchListItem item = new PunchListItem(
            "Hall de Entrada", "Alvenaria", "Empreiteiro Silva",
            "Ajustar vão da porta pivotante", PunchListSeverity.MEDIUM,
            PunchListStatus.PENDING, LocalDateTime.now().plusDays(5),
            "foto-antes.jpg", savedInspection.getId(), project.getId()
        );
        PunchListItem savedItem = itemRepository.save(item);
        assertThat(savedItem.getId()).isNotNull();

        List<PunchListItem> items = itemRepository.findByInspectionIdAndDeletedAtIsNullOrderByCreatedAtDesc(savedInspection.getId());
        assertThat(items).hasSize(1);
        assertThat(items.get(0).getEnvironment()).isEqualTo("Hall de Entrada");

        // Soft delete vistoria
        savedInspection.markAsDeleted();
        inspectionRepository.save(savedInspection);

        Optional<SiteInspection> afterDelete = inspectionRepository.findByIdAndDeletedAtIsNull(savedInspection.getId());
        assertThat(afterDelete).isEmpty();
    }

    @Test
    @DisplayName("Deve buscar vistorias por termo de busca e status")
    void shouldSearchInspectionsByTerm() {
        Project project = Project.builder().name("Projeto Busca").ownerId("usr-it").build();
        project = projectRepository.save(project);

        String uniqueSuffix = System.currentTimeMillis() + "";
        SiteInspection insp1 = new SiteInspection(
            "Vistoria Estrutura " + uniqueSuffix, LocalDateTime.now(),
            InspectionStatus.DRAFT, null, null, project.getId(), "usr-it"
        );
        SiteInspection insp2 = new SiteInspection(
            "Vistoria Fachada " + uniqueSuffix, LocalDateTime.now(),
            InspectionStatus.COMPLETED, null, null, project.getId(), "usr-it"
        );

        inspectionRepository.save(insp1);
        inspectionRepository.save(insp2);

        Page<SiteInspection> result = inspectionRepository.searchInspections(
            "Estrutura", project.getId(), InspectionStatus.DRAFT, PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).anyMatch(i -> i.getTitle().contains("Estrutura"));
    }
}
