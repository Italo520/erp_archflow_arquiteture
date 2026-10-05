package com.archflow.modules.activity.entity;

import com.archflow.core.domain.BaseEntity;
import com.archflow.modules.activity.domain.TimeLogCategory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "time_logs")
public class TimeLog extends BaseEntity {

    @Column(nullable = false)
    private Double duration; // em horas (ex: 1.5)

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private TimeLogCategory category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(nullable = false)
    private boolean billable = false;

    @Column(name = "bill_rate", precision = 10, scale = 2)
    private BigDecimal billRate;

    @Column(name = "user_id", nullable = false, length = 36)
    private String userId;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "task_id", length = 36)
    private String taskId;

    @Column(name = "client_id", length = 36)
    private String clientId;

    public TimeLog() {
    }

    public TimeLog(Double duration, TimeLogCategory category, String description, LocalDate logDate,
                   LocalTime startTime, LocalTime endTime, boolean billable, BigDecimal billRate,
                   String userId, String projectId, String taskId, String clientId) {
        this.duration = duration;
        this.category = category;
        this.description = description;
        this.logDate = logDate != null ? logDate : LocalDate.now();
        this.startTime = startTime;
        this.endTime = endTime;
        this.billable = billable;
        this.billRate = billRate;
        this.userId = userId;
        this.projectId = projectId;
        this.taskId = taskId;
        this.clientId = clientId;
    }

    public Double getDuration() {
        return duration;
    }

    public void setDuration(Double duration) {
        this.duration = duration;
    }

    public TimeLogCategory getCategory() {
        return category;
    }

    public void setCategory(TimeLogCategory category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getLogDate() {
        return logDate;
    }

    public void setLogDate(LocalDate logDate) {
        this.logDate = logDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isBillable() {
        return billable;
    }

    public void setBillable(boolean billable) {
        this.billable = billable;
    }

    public BigDecimal getBillRate() {
        return billRate;
    }

    public void setBillRate(BigDecimal billRate) {
        this.billRate = billRate;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }
}
