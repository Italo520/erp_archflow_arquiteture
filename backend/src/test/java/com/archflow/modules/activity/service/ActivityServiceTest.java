package com.archflow.modules.activity.service;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.domain.TimeLogCategory;
import com.archflow.modules.activity.dto.ActivityResponse;
import com.archflow.modules.activity.dto.CreateActivityRequest;
import com.archflow.modules.activity.dto.CreateTimeLogRequest;
import com.archflow.modules.activity.dto.TimeLogResponse;
import com.archflow.modules.activity.dto.TimeSummaryResponse;
import com.archflow.modules.activity.entity.Activity;
import com.archflow.modules.activity.entity.TimeLog;
import com.archflow.modules.activity.mapper.ActivityMapper;
import com.archflow.modules.activity.repository.ActivityRepository;
import com.archflow.modules.activity.repository.TimeLogRepository;
import com.archflow.modules.activity.service.impl.ActivityServiceImpl;
import com.archflow.modules.client.entity.Client;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.project.entity.Project;
import com.archflow.modules.project.repository.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ActivityService - Suíte de Testes Formais de QA")
class ActivityServiceTest {

    @Mock
    private ActivityRepository activityRepository;

    @Mock
    private TimeLogRepository timeLogRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ActivityMapper mapper;

    private ActivityServiceImpl activityService;

    @BeforeEach
    void setUp() {
        activityService = new ActivityServiceImpl(
            activityRepository,
            timeLogRepository,
            projectRepository,
            clientRepository,
            mapper
        );
    }

    @Nested
    @DisplayName("Testes de Criação de Atividades (ECP & BVA de Datas e Relacionamentos)")
    class CreateActivityTests {

        @Test
        @DisplayName("ECP Válida: Deve criar atividade com todos os relacionamentos e datas válidas")
        void shouldCreateActivityWithValidData() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            LocalDateTime end = start.plusHours(2);
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.MEETING,
                "Reunião de Alinhamento",
                "Revisão do projeto",
                120,
                start,
                end,
                "Escritório Central",
                "client-456",
                "proj-123",
                "task-789"
            );

            Project project = new Project();
            project.setId("proj-123");
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-123")).thenReturn(Optional.of(project));

            Client client = new Client();
            client.setId("client-456");
            when(clientRepository.findByIdAndDeletedAtIsNull("client-456")).thenReturn(Optional.of(client));

            Activity entity = new Activity();
            when(mapper.toActivityEntity(request)).thenReturn(entity);
            when(activityRepository.save(entity)).thenReturn(entity);

            ActivityResponse expectedResponse = new ActivityResponse(
                "act-1", ActivityType.MEETING, "Reunião de Alinhamento", "Revisão do projeto",
                120, start, end, "Escritório Central", ActivityStatus.SCHEDULED,
                "client-456", "proj-123", "task-789", "admin", LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toActivityResponse(entity)).thenReturn(expectedResponse);

            ActivityResponse result = activityService.createActivity(request, "admin");

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("act-1");
            assertThat(entity.getCreatedById()).isEqualTo("admin");
            assertThat(entity.getStatus()).isEqualTo(ActivityStatus.SCHEDULED);
        }

        @Test
        @DisplayName("ECP: Deve assumir 'system' como createdById quando nulo")
        void shouldDefaultToSystemCreatedByIdWhenNull() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.SITE_VISIT, "Visita Técnica", null, null, start, null, null, null, null, null
            );

            Activity entity = new Activity();
            when(mapper.toActivityEntity(request)).thenReturn(entity);
            when(activityRepository.save(entity)).thenReturn(entity);
            when(mapper.toActivityResponse(entity)).thenReturn(new ActivityResponse(
                "act-2", ActivityType.SITE_VISIT, "Visita Técnica", null, null,
                start, null, null, ActivityStatus.SCHEDULED, null, null, null, "system", LocalDateTime.now(), LocalDateTime.now()
            ));

            ActivityResponse result = activityService.createActivity(request, null);

            assertThat(result).isNotNull();
            assertThat(entity.getCreatedById()).isEqualTo("system");
        }

        @Test
        @DisplayName("BVA Inválido: Deve lançar BusinessException quando término for anterior ao início")
        void shouldThrowExceptionWhenEndTimeBeforeStartTime() {
            LocalDateTime start = LocalDateTime.now().plusDays(2);
            LocalDateTime end = start.minusHours(1);
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.DESIGN, "Desenho Inválido", null, null, start, end, null, null, null, null
            );

            assertThatThrownBy(() -> activityService.createActivity(request, "user"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A data/hora de término não pode ser anterior ao início");
        }

        @Test
        @DisplayName("ECP Inválida: Deve lançar ResourceNotFoundException quando projeto não existir")
        void shouldThrowExceptionWhenProjectDoesNotExist() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.REVISION, "Revisão", null, null, start, null, null, null, "proj-not-found", null
            );

            when(projectRepository.findByIdAndDeletedAtIsNull("proj-not-found")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.createActivity(request, "user"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Projeto não encontrado");
        }

        @Test
        @DisplayName("ECP Inválida: Deve lançar ResourceNotFoundException quando cliente não existir")
        void shouldThrowExceptionWhenClientDoesNotExist() {
            LocalDateTime start = LocalDateTime.now().plusDays(1);
            CreateActivityRequest request = new CreateActivityRequest(
                ActivityType.CALL, "Telefonema", null, null, start, null, null, "client-not-found", null, null
            );

            when(clientRepository.findByIdAndDeletedAtIsNull("client-not-found")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.createActivity(request, "user"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Cliente não encontrado");
        }
    }

    @Nested
    @DisplayName("Testes de Consulta e Atualização de Status de Atividades")
    class ActivityQueryAndUpdateTests {

        @Test
        @DisplayName("ECP: Deve listar atividades com filtro de busca normalizado")
        void shouldListActivitiesWithTrimmedSearch() {
            Pageable pageable = PageRequest.of(0, 10);
            Activity activity = new Activity();
            Page<Activity> page = new PageImpl<>(List.of(activity));

            when(activityRepository.searchActivities(
                eq("Reunião"), eq("proj-1"), eq("cli-1"), eq(ActivityStatus.SCHEDULED), eq(ActivityType.MEETING), eq(pageable)
            )).thenReturn(page);

            ActivityResponse response = new ActivityResponse(
                "act-1", ActivityType.MEETING, "Reunião", null, null,
                null, null, null, ActivityStatus.SCHEDULED, "cli-1", "proj-1", null, "admin", LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toActivityResponse(activity)).thenReturn(response);

            Page<ActivityResponse> result = activityService.listActivities(
                "  Reunião  ", "proj-1", "cli-1", ActivityStatus.SCHEDULED, ActivityType.MEETING, pageable
            );

            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).title()).isEqualTo("Reunião");
        }

        @Test
        @DisplayName("ECP: Deve listar atividades com search nulo ou em branco passando null ao repositório")
        void shouldListActivitiesWithNullOrBlankSearch() {
            Pageable pageable = PageRequest.of(0, 10);
            Page<Activity> emptyPage = new PageImpl<>(Collections.emptyList());

            when(activityRepository.searchActivities(null, null, null, null, null, pageable))
                .thenReturn(emptyPage);

            Page<ActivityResponse> result = activityService.listActivities("   ", null, null, null, null, pageable);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("ECP: Deve buscar atividade existente por ID")
        void shouldGetActivityById() {
            Activity activity = new Activity();
            activity.setId("act-10");
            when(activityRepository.findByIdAndDeletedAtIsNull("act-10")).thenReturn(Optional.of(activity));

            ActivityResponse response = new ActivityResponse(
                "act-10", ActivityType.DESIGN, "Atividade 10", null, null,
                null, null, null, ActivityStatus.SCHEDULED, null, null, null, "admin", LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toActivityResponse(activity)).thenReturn(response);

            ActivityResponse result = activityService.getActivityById("act-10");

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo("act-10");
        }

        @Test
        @DisplayName("ECP: Deve lançar ResourceNotFoundException quando atividade não for encontrada")
        void shouldThrowExceptionWhenActivityNotFound() {
            when(activityRepository.findByIdAndDeletedAtIsNull("invalid-id")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.getActivityById("invalid-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Atividade não encontrada");
        }

        @Test
        @DisplayName("ECP: Deve atualizar status da atividade com sucesso")
        void shouldUpdateActivityStatus() {
            Activity activity = new Activity();
            activity.setId("act-1");
            activity.setStatus(ActivityStatus.SCHEDULED);

            when(activityRepository.findByIdAndDeletedAtIsNull("act-1")).thenReturn(Optional.of(activity));
            when(activityRepository.save(activity)).thenReturn(activity);

            ActivityResponse response = new ActivityResponse(
                "act-1", ActivityType.DESIGN, "Atividade", null, null,
                null, null, null, ActivityStatus.COMPLETED, null, null, null, "admin", LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toActivityResponse(activity)).thenReturn(response);

            ActivityResponse result = activityService.updateActivityStatus("act-1", ActivityStatus.COMPLETED);

            assertThat(result.status()).isEqualTo(ActivityStatus.COMPLETED);
            assertThat(activity.getStatus()).isEqualTo(ActivityStatus.COMPLETED);
        }

        @Test
        @DisplayName("ECP Inválida: Deve lançar BusinessException quando status for nulo")
        void shouldThrowExceptionWhenStatusIsNull() {
            assertThatThrownBy(() -> activityService.updateActivityStatus("act-1", null))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("O status da atividade não pode ser nulo");
        }

        @Test
        @DisplayName("ECP: Deve realizar soft delete da atividade")
        void shouldSoftDeleteActivity() {
            Activity activity = new Activity();
            activity.setId("act-1");
            when(activityRepository.findByIdAndDeletedAtIsNull("act-1")).thenReturn(Optional.of(activity));

            activityService.deleteActivity("act-1");

            assertThat(activity.getDeletedAt()).isNotNull();
            verify(activityRepository).save(activity);
        }
    }

    @Nested
    @DisplayName("Testes de Time Tracking (Tabela de Decisão para Faturamento e Horas)")
    class TimeLogTests {

        @Test
        @DisplayName("ECP Inválida: Deve lançar ResourceNotFoundException quando projeto não existir no logTime")
        void shouldThrowExceptionWhenProjectNotFoundForTimeLog() {
            CreateTimeLogRequest request = new CreateTimeLogRequest(
                2.0, TimeLogCategory.DESIGN, "Desenho", LocalDate.now(), null, null, true, BigDecimal.valueOf(180.00), "proj-999", null, null
            );

            when(projectRepository.findByIdAndDeletedAtIsNull("proj-999")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.logTime(request, "user-1"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Projeto não encontrado");
        }

        @Test
        @DisplayName("BVA Inválido: Deve lançar BusinessException quando duration for <= 0")
        void shouldThrowExceptionWhenDurationIsZeroOrNegative() {
            CreateTimeLogRequest requestZero = new CreateTimeLogRequest(
                0.0, TimeLogCategory.DESIGN, "Descrição", LocalDate.now(), null, null, true, BigDecimal.valueOf(100.00), "proj-1", null, null
            );

            Project project = new Project();
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));

            assertThatThrownBy(() -> activityService.logTime(requestZero, "user-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A duração do apontamento de horas deve ser maior que zero");

            CreateTimeLogRequest requestNegative = new CreateTimeLogRequest(
                -1.5, TimeLogCategory.DESIGN, "Descrição", LocalDate.now(), null, null, true, BigDecimal.valueOf(100.00), "proj-1", null, null
            );

            assertThatThrownBy(() -> activityService.logTime(requestNegative, "user-1"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("A duração do apontamento de horas deve ser maior que zero");
        }

        @Test
        @DisplayName("Tabela de Decisão Regra 1: Faturável sem billRate definido deve assumir default R$ 150.00")
        void shouldApplyDefaultBillRateWhenBillableAndRateNullOrZero() {
            CreateTimeLogRequest request = new CreateTimeLogRequest(
                3.0, TimeLogCategory.DESIGN, "Detalhamento", null, null, null, true, null, "proj-1", null, null
            );

            Project project = new Project();
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));

            TimeLog timeLog = new TimeLog();
            when(mapper.toTimeLogEntity(request)).thenReturn(timeLog);
            when(timeLogRepository.save(timeLog)).thenReturn(timeLog);

            TimeLogResponse response = new TimeLogResponse(
                "tl-1", 3.0, TimeLogCategory.DESIGN, "Detalhamento", LocalDate.now(), null, null,
                true, BigDecimal.valueOf(150.00), "system-user", "proj-1", null, null,
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toTimeLogResponse(timeLog)).thenReturn(response);

            TimeLogResponse result = activityService.logTime(request, null);

            assertThat(result).isNotNull();
            assertThat(timeLog.getUserId()).isEqualTo("system-user");
            assertThat(timeLog.getLogDate()).isEqualTo(LocalDate.now());
            assertThat(timeLog.isBillable()).isTrue();
            assertThat(timeLog.getBillRate()).isEqualTo(BigDecimal.valueOf(150.00));
        }

        @Test
        @DisplayName("Tabela de Decisão Regra 2: Faturável com billRate <= 0 deve assumir default R$ 150.00")
        void shouldApplyDefaultBillRateWhenBillableAndRateIsZero() {
            CreateTimeLogRequest request = new CreateTimeLogRequest(
                2.0, TimeLogCategory.DESIGN, "Detalhamento", LocalDate.of(2026, 10, 1), null, null,
                true, BigDecimal.ZERO, "proj-1", null, null
            );

            Project project = new Project();
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));

            TimeLog timeLog = new TimeLog();
            when(mapper.toTimeLogEntity(request)).thenReturn(timeLog);
            when(timeLogRepository.save(timeLog)).thenReturn(timeLog);

            TimeLogResponse response = new TimeLogResponse(
                "tl-2", 2.0, TimeLogCategory.DESIGN, "Detalhamento", LocalDate.of(2026, 10, 1), null, null,
                true, BigDecimal.valueOf(150.00), "user-1", "proj-1", null, null,
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toTimeLogResponse(timeLog)).thenReturn(response);

            TimeLogResponse result = activityService.logTime(request, "user-1");

            assertThat(result).isNotNull();
            assertThat(timeLog.getBillRate()).isEqualTo(BigDecimal.valueOf(150.00));
        }

        @Test
        @DisplayName("Tabela de Decisão Regra 3: Faturável com rate customizado > 0 deve preservar o valor informado")
        void shouldPreserveCustomBillRateWhenGreaterThanZero() {
            CreateTimeLogRequest request = new CreateTimeLogRequest(
                4.0, TimeLogCategory.DESIGN, "Renderização", LocalDate.of(2026, 10, 2), null, null,
                true, BigDecimal.valueOf(220.00), "proj-1", null, null
            );

            Project project = new Project();
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));

            TimeLog timeLog = new TimeLog();
            when(mapper.toTimeLogEntity(request)).thenReturn(timeLog);
            when(timeLogRepository.save(timeLog)).thenReturn(timeLog);

            TimeLogResponse response = new TimeLogResponse(
                "tl-3", 4.0, TimeLogCategory.DESIGN, "Renderização", LocalDate.of(2026, 10, 2), null, null,
                true, BigDecimal.valueOf(220.00), "arch-1", "proj-1", null, null,
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toTimeLogResponse(timeLog)).thenReturn(response);

            TimeLogResponse result = activityService.logTime(request, "arch-1");

            assertThat(result).isNotNull();
            assertThat(timeLog.isBillable()).isTrue();
        }

        @Test
        @DisplayName("Tabela de Decisão Regra 4: Não faturável não deve definir default billRate")
        void shouldHandleNonBillableTimeLog() {
            CreateTimeLogRequest request = new CreateTimeLogRequest(
                1.5, TimeLogCategory.ADMIN, "Organização de pastas", LocalDate.now(), null, null,
                false, null, "proj-1", null, null
            );

            Project project = new Project();
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(project));

            TimeLog timeLog = new TimeLog();
            when(mapper.toTimeLogEntity(request)).thenReturn(timeLog);
            when(timeLogRepository.save(timeLog)).thenReturn(timeLog);

            TimeLogResponse response = new TimeLogResponse(
                "tl-4", 1.5, TimeLogCategory.ADMIN, "Organização de pastas", LocalDate.now(), null, null,
                false, null, "arch-1", "proj-1", null, null,
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toTimeLogResponse(timeLog)).thenReturn(response);

            TimeLogResponse result = activityService.logTime(request, "arch-1");

            assertThat(result).isNotNull();
            assertThat(timeLog.isBillable()).isFalse();
        }

        @Test
        @DisplayName("ECP: Deve listar apontamentos de horas paginados")
        void shouldListTimeLogs() {
            Pageable pageable = PageRequest.of(0, 10);
            TimeLog log = new TimeLog();
            Page<TimeLog> page = new PageImpl<>(List.of(log));

            when(timeLogRepository.searchTimeLogs("proj-1", "user-1", true, pageable)).thenReturn(page);

            TimeLogResponse response = new TimeLogResponse(
                "tl-1", 2.0, TimeLogCategory.DESIGN, "Tarefa", LocalDate.now(), null, null,
                true, BigDecimal.valueOf(150.00), "user-1", "proj-1", null, null,
                LocalDateTime.now(), LocalDateTime.now()
            );
            when(mapper.toTimeLogResponse(log)).thenReturn(response);

            Page<TimeLogResponse> result = activityService.listTimeLogs("proj-1", "user-1", true, pageable);

            assertThat(result.getContent()).hasSize(1);
        }

        @Test
        @DisplayName("Agregação Financeira: Deve calcular resumo de horas e faturamento total do projeto")
        void shouldCalculateProjectTimeSummaryCorrectly() {
            when(projectRepository.findByIdAndDeletedAtIsNull("proj-1")).thenReturn(Optional.of(new Project()));

            TimeLog log1 = new TimeLog();
            log1.setDuration(4.0);
            log1.setBillable(true);
            log1.setBillRate(BigDecimal.valueOf(150.00)); // 4 * 150 = 600

            TimeLog log2 = new TimeLog();
            log2.setDuration(2.5);
            log2.setBillable(true);
            log2.setBillRate(BigDecimal.valueOf(200.00)); // 2.5 * 200 = 500

            TimeLog log3 = new TimeLog();
            log3.setDuration(1.5);
            log3.setBillable(false);
            log3.setBillRate(null); // não faturável

            TimeLog logNullRate = new TimeLog();
            logNullRate.setDuration(1.0);
            logNullRate.setBillable(true);
            logNullRate.setBillRate(null);

            TimeLog logNullDuration = new TimeLog();
            logNullDuration.setDuration(null);
            logNullDuration.setBillable(false);

            when(timeLogRepository.findByProjectIdAndDeletedAtIsNull("proj-1"))
                .thenReturn(List.of(log1, log2, log3, logNullRate, logNullDuration));

            TimeSummaryResponse summary = activityService.getProjectTimeSummary("proj-1");

            assertThat(summary).isNotNull();
            assertThat(summary.totalHours()).isEqualTo(9.0); // 4 + 2.5 + 1.5 + 1.0 + 0.0
            assertThat(summary.billableHours()).isEqualTo(7.5); // 4 + 2.5 + 1.0
            assertThat(summary.nonBillableHours()).isEqualTo(1.5); // 1.5 + 0.0
            assertThat(summary.totalBillableAmount()).isEqualByComparingTo(BigDecimal.valueOf(1100.00)); // 600 + 500
        }

        @Test
        @DisplayName("ECP Inválida: getProjectTimeSummary deve lançar exceção se projeto não existir")
        void shouldThrowExceptionWhenProjectNotFoundForSummary() {
            when(projectRepository.findByIdAndDeletedAtIsNull("invalid-proj")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.getProjectTimeSummary("invalid-proj"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Projeto não encontrado");
        }

        @Test
        @DisplayName("ECP: Deve realizar soft delete de TimeLog existente")
        void shouldSoftDeleteTimeLog() {
            TimeLog timeLog = new TimeLog();
            timeLog.setId("tl-100");
            when(timeLogRepository.findByIdAndDeletedAtIsNull("tl-100")).thenReturn(Optional.of(timeLog));

            activityService.deleteTimeLog("tl-100");

            assertThat(timeLog.getDeletedAt()).isNotNull();
            verify(timeLogRepository).save(timeLog);
        }

        @Test
        @DisplayName("ECP Inválida: Deve lançar exceção ao tentar excluir TimeLog inexistente")
        void shouldThrowExceptionWhenDeletingNonExistentTimeLog() {
            when(timeLogRepository.findByIdAndDeletedAtIsNull("invalid-tl")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> activityService.deleteTimeLog("invalid-tl"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Apontamento de horas não encontrado");
        }
    }
}
