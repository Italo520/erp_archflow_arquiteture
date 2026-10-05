package com.archflow.modules.project.entity;

import com.archflow.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_kanban_columns")
public class ProjectKanbanColumn extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 50)
    private String color;

    @Column(name = "column_order", nullable = false)
    private Integer order = 0;

    @Column(name = "project_id", length = 36)
    private String projectId;

    public ProjectKanbanColumn() {
    }

    public ProjectKanbanColumn(String title, String color, Integer order, String projectId) {
        this.title = title;
        this.color = color;
        this.order = order;
        this.projectId = projectId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getOrder() {
        return order;
    }

    public void setOrder(Integer order) {
        this.order = order;
    }

    public String getProjectId() {
        return projectId;
    }

    public void setProjectId(String projectId) {
        this.projectId = projectId;
    }
}
