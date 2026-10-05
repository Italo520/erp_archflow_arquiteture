package com.archflow.modules.inspection.entity;

import com.archflow.core.domain.BaseEntity;
import com.archflow.modules.inspection.domain.PunchListSeverity;
import com.archflow.modules.inspection.domain.PunchListStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "punch_list_items")
public class PunchListItem extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String environment;

    @Column(name = "contractor_trade", nullable = false, length = 100)
    private String contractorTrade;

    @Column(name = "contractor_name")
    private String contractorName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PunchListSeverity severity = PunchListSeverity.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PunchListStatus status = PunchListStatus.PENDING;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "before_photo_url", length = 500)
    private String beforePhotoUrl;

    @Column(name = "after_photo_url", length = 500)
    private String afterPhotoUrl;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "inspection_id", nullable = false, length = 36)
    private String inspectionId;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    public PunchListItem() {
    }

    public PunchListItem(String environment, String contractorTrade, String contractorName,
                         String description, PunchListSeverity severity, PunchListStatus status,
                         LocalDateTime dueDate, String beforePhotoUrl, String inspectionId, String projectId) {
        this.environment = environment;
        this.contractorTrade = contractorTrade;
        this.contractorName = contractorName;
        this.description = description;
        this.severity = severity != null ? severity : PunchListSeverity.MEDIUM;
        this.status = status != null ? status : PunchListStatus.PENDING;
        this.dueDate = dueDate;
        this.beforePhotoUrl = beforePhotoUrl;
        this.inspectionId = inspectionId;
        this.projectId = projectId;
    }

    public String getEnvironment() {
        return environment;
    }

    public void setEnvironment(String environment) {
        this.environment = environment;
    }

    public String getContractorTrade() {
        return contractorTrade;
    }

    public void setContractorTrade(String contractorTrade) {
        this.contractorTrade = contractorTrade;
    }

    public String getContractorName() {
        return contractorName;
    }

    public void setContractorName(String contractorName) {
        this.contractorName = contractorName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public PunchListSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(PunchListSeverity severity) {
        this.severity = severity;
    }

    public PunchListStatus getStatus() {
        return status;
    }

    public void setStatus(PunchListStatus status) {
        this.status = status;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }

    public String getBeforePhotoUrl() {
        return beforePhotoUrl;
    }

    public void setBeforePhotoUrl(String beforePhotoUrl) {
        this.beforePhotoUrl = beforePhotoUrl;
    }

    public String getAfterPhotoUrl() {
        return afterPhotoUrl;
    }

    public void setAfterPhotoUrl(String afterPhotoUrl) {
        this.afterPhotoUrl = afterPhotoUrl;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public String getInspectionId() {
        return inspectionId;
    }

    public void setInspectionId(String inspectionId) {
        this.inspectionId = inspectionId;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
