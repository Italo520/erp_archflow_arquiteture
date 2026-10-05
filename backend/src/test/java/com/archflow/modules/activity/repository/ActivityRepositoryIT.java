package com.archflow.modules.activity.repository;

import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.domain.TimeLogCategory;
import com.archflow.modules.activity.entity.Activity;
import com.archflow.modules.activity.entity.TimeLog;
import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.repository.ClientRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
@DisplayName("ActivityRepository e TimeLogRepository - Testes de Integração com PostgreSQL")
class ActivityRepositoryIT {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TimeLogRepository timeLogRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ClientRepository clientRepository;

    @Test
    @DisplayName("Deve persistir atividade e consultar com filtros dinâmicos e soft delete")
    void shouldPersistAndSearchActivities() {
        Client client = Client.builder()
            .name("Cliente Atividade IT")
            .email("atividade.it@archflow.com")
            .legalType(ClientLegalType.PF)
            .category(ClientCategory.RESIDENTIAL)
            .build();
        client = clientRepository.save(client);

        Project project = Project.builder()
            .name("Projeto Atividade IT")
            .ownerId("usr-act")
            .clientId(client.getId())
            .build();
        project = projectRepository.save(project);

        Activity activity = new Activity(
            ActivityType.MEETING,
            "Reunião de Apresentação de Conceito",
            "Apresentar volumetria 3D ao cliente",
            120,
            LocalDateTime.now().plusDays(3),
            LocalDateTime.now().plusDays(3).plusHours(2),
            "Escritório Central",
            ActivityStatus.SCHEDULED,
            client.getId(),
            project.getId(),
            null,
            "usr-act"
        );
        Activity saved = activityRepository.save(activity);

        assertThat(saved.getId()).isNotNull();

        // Buscar ativo por ID
        Optional<Activity> found = activityRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Reunião de Apresentação de Conceito");

        // Busca dinâmica por termo
        Page<Activity> searchResult = activityRepository.searchActivities(
            "Conceito", project.getId(), client.getId(), ActivityStatus.SCHEDULED, ActivityType.MEETING, PageRequest.of(0, 10)
        );
        assertThat(searchResult.getContent()).hasSize(1);

        // Soft delete
        saved.markAsDeleted();
        activityRepository.save(saved);

        Optional<Activity> deletedFound = activityRepository.findByIdAndDeletedAtIsNull(saved.getId());
        assertThat(deletedFound).isEmpty();
    }

    @Test
    @DisplayName("Deve persistir apontamentos de horas e consultar por projeto e filtros")
    void shouldPersistAndSearchTimeLogs() {
        Project project = Project.builder()
            .name("Projeto TimeLog IT")
            .ownerId("usr-time")
            .build();
        project = projectRepository.save(project);

        TimeLog log1 = new TimeLog(
            4.0,
            TimeLogCategory.DESIGN,
            "Modelagem 3D do térreo",
            LocalDate.now(),
            null,
            null,
            true,
            BigDecimal.valueOf(180.00),
            "usr-time",
            project.getId(),
            null,
            null
        );

        TimeLog log2 = new TimeLog(
            1.5,
            TimeLogCategory.REVIEW,
            "Revisão de especificações",
            LocalDate.now(),
            null,
            null,
            false,
            null,
            "usr-time",
            project.getId(),
            null,
            null
        );

        timeLogRepository.saveAll(List.of(log1, log2));

        List<TimeLog> projectLogs = timeLogRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
        assertThat(projectLogs).hasSize(2);

        Page<TimeLog> billableLogs = timeLogRepository.searchTimeLogs(
            project.getId(), "usr-time", true, PageRequest.of(0, 10)
        );
        assertThat(billableLogs.getContent()).hasSize(1);
        assertThat(billableLogs.getContent().get(0).getDescription()).isEqualTo("Modelagem 3D do térreo");

        // Soft delete no log1
        log1.markAsDeleted();
        timeLogRepository.save(log1);

        List<TimeLog> remainingLogs = timeLogRepository.findByProjectIdAndDeletedAtIsNull(project.getId());
        assertThat(remainingLogs).hasSize(1);
        assertThat(remainingLogs.get(0).getId()).isEqualTo(log2.getId());
    }
}
