package com.archflow.modules.inspection.entity;

import com.archflow.core.domain.BaseEntity;
import com.archflow.modules.inspection.domain.InspectionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "site_inspections")
public class SiteInspection extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime date = LocalDateTime.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private InspectionStatus status = InspectionStatus.DRAFT;

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @Column(name = "weather_condition", length = 100)
    private String weatherCondition;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    @Column(name = "inspector_id", nullable = false, length = 36)
    private String inspectorId;

    public SiteInspection() {
    }

    public SiteInspection(String title, LocalDateTime date, InspectionStatus status,
                          String generalNotes, String weatherCondition, String projectId, String inspectorId) {
        this.title = title;
        this.date = date != null ? date : LocalDateTime.now();
        this.status = status != null ? status : InspectionStatus.DRAFT;
        this.generalNotes = generalNotes;
        this.weatherCondition = weatherCondition;
        this.projectId = projectId;
        this.inspectorId = inspectorId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public InspectionStatus getStatus() {
        return status;
    }

    public void setStatus(InspectionStatus status) {
        this.status = status;
    }

    public String getGeneralNotes() {
        return generalNotes;
    }

    public void setGeneralNotes(String generalNotes) {
        this.generalNotes = generalNotes;
    }

    public String getWeatherCondition() {
        return weatherCondition;
    }

    public void setWeatherCondition(String weatherCondition) {
        this.weatherCondition = weatherCondition;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }

    public String getInspectorId() {
        return inspectorId;
    }

    public void setInspectorId(String inspectorId) {
        this.inspectorId = inspectorId;
    }
}
