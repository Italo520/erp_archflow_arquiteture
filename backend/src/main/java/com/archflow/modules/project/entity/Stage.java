package com.archflow.modules.project.entity;

import com.archflow.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "stages")
public class Stage extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "stage_order", nullable = false)
    private Integer order = 0;

    @Column(name = "project_id", nullable = false, length = 36)
    private String projectId;

    public Stage() {
    }

    public Stage(String name, Integer order, String projectId) {
        this.name = name;
        this.order = order;
        this.projectId = projectId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
