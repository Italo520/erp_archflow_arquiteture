package com.archflow.modules.activity.service.impl;

import com.archflow.core.exception.BusinessException;
import com.archflow.core.exception.ResourceNotFoundException;
import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
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
import com.archflow.modules.activity.service.ActivityService;
import com.archflow.modules.client.repository.ClientRepository;
import com.archflow.modules.project.repository.ProjectRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final TimeLogRepository timeLogRepository;
    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final ActivityMapper mapper;

    public ActivityServiceImpl(
        ActivityRepository activityRepository,
        TimeLogRepository timeLogRepository,
        ProjectRepository projectRepository,
        ClientRepository clientRepository,
        ActivityMapper mapper
    ) {
        this.activityRepository = activityRepository;
        this.timeLogRepository = timeLogRepository;
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.mapper = mapper;
    }

    @Override
    public Page<ActivityResponse> listActivities(String search, String projectId, String clientId, ActivityStatus status, ActivityType type, Pageable pageable) {
        String trimmedSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        Page<Activity> page = activityRepository.searchActivities(trimmedSearch, projectId, clientId, status, type, pageable);
        return page.map(mapper::toActivityResponse);
    }

    @Override
    public ActivityResponse getActivityById(String id) {
        Activity activity = findActiveActivityById(id);
        return mapper.toActivityResponse(activity);
    }

    @Override
    @Transactional
    public ActivityResponse createActivity(CreateActivityRequest request, String createdById) {
        validateActivityDates(request.startTime(), request.endTime());

        if (request.projectId() != null && !request.projectId().isBlank()) {
            projectRepository.findByIdAndDeletedAtIsNull(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com id: " + request.projectId()));
        }

        if (request.clientId() != null && !request.clientId().isBlank()) {
            clientRepository.findByIdAndDeletedAtIsNull(request.clientId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente não encontrado com id: " + request.clientId()));
        }

        Activity activity = mapper.toActivityEntity(request);
        activity.setCreatedById(createdById != null ? createdById : "system");
        activity.setStatus(ActivityStatus.SCHEDULED);

        Activity saved = activityRepository.save(activity);
        return mapper.toActivityResponse(saved);
    }

    @Override
    @Transactional
    public ActivityResponse updateActivityStatus(String id, ActivityStatus status) {
        if (status == null) {
            throw new BusinessException("O status da atividade não pode ser nulo.");
        }
        Activity activity = findActiveActivityById(id);
        activity.setStatus(status);
        Activity updated = activityRepository.save(activity);
        return mapper.toActivityResponse(updated);
    }

    @Override
    @Transactional
    public void deleteActivity(String id) {
        Activity activity = findActiveActivityById(id);
        activity.markAsDeleted();
        activityRepository.save(activity);
    }

    @Override
    @Transactional
    public TimeLogResponse logTime(CreateTimeLogRequest request, String userId) {
        projectRepository.findByIdAndDeletedAtIsNull(request.projectId())
            .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com id: " + request.projectId()));

        if (request.duration() <= 0) {
            throw new BusinessException("A duração do apontamento de horas deve ser maior que zero.");
        }

        TimeLog timeLog = mapper.toTimeLogEntity(request);
        timeLog.setUserId(userId != null ? userId : "system-user");
        if (request.logDate() != null) {
            timeLog.setLogDate(request.logDate());
        } else {
            timeLog.setLogDate(LocalDate.now());
        }

        boolean isBillable = Boolean.TRUE.equals(request.billable());
        timeLog.setBillable(isBillable);
        if (isBillable && (request.billRate() == null || request.billRate().compareTo(BigDecimal.ZERO) <= 0)) {
            timeLog.setBillRate(BigDecimal.valueOf(150.00));
        }

        TimeLog saved = timeLogRepository.save(timeLog);
        return mapper.toTimeLogResponse(saved);
    }

    @Override
    public Page<TimeLogResponse> listTimeLogs(String projectId, String userId, Boolean billable, Pageable pageable) {
        Page<TimeLog> page = timeLogRepository.searchTimeLogs(projectId, userId, billable, pageable);
        return page.map(mapper::toTimeLogResponse);
    }

    @Override
    public TimeSummaryResponse getProjectTimeSummary(String projectId) {
        projectRepository.findByIdAndDeletedAtIsNull(projectId)
            .orElseThrow(() -> new ResourceNotFoundException("Projeto não encontrado com id: " + projectId));

        List<TimeLog> logs = timeLogRepository.findByProjectIdAndDeletedAtIsNull(projectId);

        double totalHours = 0.0;
        double billableHours = 0.0;
        double nonBillableHours = 0.0;
        BigDecimal totalBillableAmount = BigDecimal.ZERO;

        for (TimeLog log : logs) {
            double duration = log.getDuration() != null ? log.getDuration() : 0.0;
            totalHours += duration;
            if (log.isBillable()) {
                billableHours += duration;
                if (log.getBillRate() != null) {
                    BigDecimal rate = log.getBillRate();
                    BigDecimal amount = rate.multiply(BigDecimal.valueOf(duration));
                    totalBillableAmount = totalBillableAmount.add(amount);
                }
            } else {
                nonBillableHours += duration;
            }
        }

        return new TimeSummaryResponse(totalHours, billableHours, nonBillableHours, totalBillableAmount);
    }

    @Override
    @Transactional
    public void deleteTimeLog(String id) {
        TimeLog timeLog = timeLogRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Apontamento de horas não encontrado com id: " + id));
        timeLog.markAsDeleted();
        timeLogRepository.save(timeLog);
    }

    private Activity findActiveActivityById(String id) {
        return activityRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Atividade não encontrada com id: " + id));
    }

    private void validateActivityDates(LocalDateTime start, LocalDateTime end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new BusinessException("A data/hora de término não pode ser anterior ao início.");
        }
    }
}
