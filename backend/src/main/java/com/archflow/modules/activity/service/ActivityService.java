package com.archflow.modules.activity.service;

import com.archflow.modules.activity.domain.ActivityStatus;
import com.archflow.modules.activity.domain.ActivityType;
import com.archflow.modules.activity.dto.ActivityResponse;
import com.archflow.modules.activity.dto.CreateActivityRequest;
import com.archflow.modules.activity.dto.CreateTimeLogRequest;
import com.archflow.modules.activity.dto.TimeLogResponse;
import com.archflow.modules.activity.dto.TimeSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ActivityService {

    Page<ActivityResponse> listActivities(String search, String projectId, String clientId, ActivityStatus status, ActivityType type, Pageable pageable);

    ActivityResponse getActivityById(String id);

    ActivityResponse createActivity(CreateActivityRequest request, String createdById);

    ActivityResponse updateActivityStatus(String id, ActivityStatus status);

    void deleteActivity(String id);

    TimeLogResponse logTime(CreateTimeLogRequest request, String userId);

    Page<TimeLogResponse> listTimeLogs(String projectId, String userId, Boolean billable, Pageable pageable);

    TimeSummaryResponse getProjectTimeSummary(String projectId);

    void deleteTimeLog(String id);
}
