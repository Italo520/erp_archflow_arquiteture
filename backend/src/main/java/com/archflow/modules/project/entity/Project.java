package com.archflow.modules.project.entity;

import com.archflow.core.domain.BaseEntity;
import com.archflow.modules.project.domain.ArchitecturalStyle;
import com.archflow.modules.project.domain.ConstructionType;
import com.archflow.modules.project.domain.ProjectStatus;
import com.archflow.modules.project.domain.ProjectVisibility;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
public class Project extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "current_column_id", length = 36)
    private String currentColumnId;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    private String address;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "delivery_date")
    private LocalDateTime deliveryDate;

    @Column(name = "total_area")
    private Double totalArea;

    @Column(name = "project_type", length = 100)
    private String projectType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProjectStatus status = ProjectStatus.CONCEPTUAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "architectural_style", length = 50)
    private ArchitecturalStyle architecturalStyle;

    @Enumerated(EnumType.STRING)
    @Column(name = "construction_type", length = 50)
    private ConstructionType constructionType;

    @Column(name = "number_of_floors")
    private Integer numberOfFloors;

    @Column(name = "number_of_rooms")
    private Integer numberOfRooms;

    @Column(name = "has_basement", nullable = false)
    private boolean hasBasement = false;

    @Column(name = "has_garage", nullable = false)
    private boolean hasGarage = false;

    @Column(name = "parking_spots")
    private Integer parkingSpots;

    @Column(name = "landscaping_area")
    private Double landscapingArea;

    @Column(name = "environmental_license_required", nullable = false)
    private boolean environmentalLicenseRequired = false;

    @Column(name = "estimated_end_date")
    private LocalDateTime estimatedEndDate;

    @Column(name = "actual_end_date")
    private LocalDateTime actualEndDate;

    @Column(name = "planned_cost", precision = 12, scale = 2)
    private BigDecimal plannedCost = BigDecimal.ZERO;

    @Column(name = "actual_cost", precision = 12, scale = 2)
    private BigDecimal actualCost = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ProjectVisibility visibility = ProjectVisibility.TEAM;

    @Column(name = "owner_id", nullable = false, length = 36)
    private String ownerId;

    @Column(name = "client_id", length = 36)
    private String clientId;

    public Project() {
    }

    public Project(Builder builder) {
        if (builder.id != null) {
            this.setId(builder.id);
        }
        this.name = builder.name;
        this.clientName = builder.clientName;
        this.currentColumnId = builder.currentColumnId;
        this.imageUrl = builder.imageUrl;
        this.address = builder.address;
        this.startDate = builder.startDate;
        this.deliveryDate = builder.deliveryDate;
        this.totalArea = builder.totalArea;
        this.projectType = builder.projectType;
        this.status = builder.status != null ? builder.status : ProjectStatus.CONCEPTUAL;
        this.architecturalStyle = builder.architecturalStyle;
        this.constructionType = builder.constructionType;
        this.numberOfFloors = builder.numberOfFloors;
        this.numberOfRooms = builder.numberOfRooms;
        this.hasBasement = builder.hasBasement;
        this.hasGarage = builder.hasGarage;
        this.parkingSpots = builder.parkingSpots;
        this.landscapingArea = builder.landscapingArea;
        this.environmentalLicenseRequired = builder.environmentalLicenseRequired;
        this.estimatedEndDate = builder.estimatedEndDate;
        this.actualEndDate = builder.actualEndDate;
        this.plannedCost = builder.plannedCost != null ? builder.plannedCost : BigDecimal.ZERO;
        this.actualCost = builder.actualCost != null ? builder.actualCost : BigDecimal.ZERO;
        this.visibility = builder.visibility != null ? builder.visibility : ProjectVisibility.TEAM;
        this.ownerId = builder.ownerId;
        this.clientId = builder.clientId;
    }

    public static Builder builder() {
        return new Builder();
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getCurrentColumnId() {
        return currentColumnId;
    }

    public void setCurrentColumnId(String currentColumnId) {
        this.currentColumnId = currentColumnId;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDateTime deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public Double getTotalArea() {
        return totalArea;
    }

    public void setTotalArea(Double totalArea) {
        this.totalArea = totalArea;
    }

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public void setStatus(ProjectStatus status) {
        this.status = status;
    }

    public ArchitecturalStyle getArchitecturalStyle() {
        return architecturalStyle;
    }

    public void setArchitecturalStyle(ArchitecturalStyle architecturalStyle) {
        this.architecturalStyle = architecturalStyle;
    }

    public ConstructionType getConstructionType() {
        return constructionType;
    }

    public void setConstructionType(ConstructionType constructionType) {
        this.constructionType = constructionType;
    }

    public Integer getNumberOfFloors() {
        return numberOfFloors;
    }

    public void setNumberOfFloors(Integer numberOfFloors) {
        this.numberOfFloors = numberOfFloors;
    }

    public Integer getNumberOfRooms() {
        return numberOfRooms;
    }

    public void setNumberOfRooms(Integer numberOfRooms) {
        this.numberOfRooms = numberOfRooms;
    }

    public boolean isHasBasement() {
        return hasBasement;
    }

    public void setHasBasement(boolean hasBasement) {
        this.hasBasement = hasBasement;
    }

    public boolean isHasGarage() {
        return hasGarage;
    }

    public void setHasGarage(boolean hasGarage) {
        this.hasGarage = hasGarage;
    }

    public Integer getParkingSpots() {
        return parkingSpots;
    }

    public void setParkingSpots(Integer parkingSpots) {
        this.parkingSpots = parkingSpots;
    }

    public Double getLandscapingArea() {
        return landscapingArea;
    }

    public void setLandscapingArea(Double landscapingArea) {
        this.landscapingArea = landscapingArea;
    }

    public boolean isEnvironmentalLicenseRequired() {
        return environmentalLicenseRequired;
    }

    public void setEnvironmentalLicenseRequired(boolean environmentalLicenseRequired) {
        this.environmentalLicenseRequired = environmentalLicenseRequired;
    }

    public LocalDateTime getEstimatedEndDate() {
        return estimatedEndDate;
    }

    public void setEstimatedEndDate(LocalDateTime estimatedEndDate) {
        this.estimatedEndDate = estimatedEndDate;
    }

    public LocalDateTime getActualEndDate() {
        return actualEndDate;
    }

    public void setActualEndDate(LocalDateTime actualEndDate) {
        this.actualEndDate = actualEndDate;
    }

    public BigDecimal getPlannedCost() {
        return plannedCost;
    }

    public void setPlannedCost(BigDecimal plannedCost) {
        this.plannedCost = plannedCost;
    }

    public BigDecimal getActualCost() {
        return actualCost;
    }

    public void setActualCost(BigDecimal actualCost) {
        this.actualCost = actualCost;
    }

    public ProjectVisibility getVisibility() {
        return visibility;
    }

    public void setVisibility(ProjectVisibility visibility) {
        this.visibility = visibility;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(String ownerId) {
        this.ownerId = ownerId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public static class Builder {
        private String id;
        private String name;
        private String clientName;
        private String currentColumnId;
        private String imageUrl;
        private String address;
        private LocalDateTime startDate;
        private LocalDateTime deliveryDate;
        private Double totalArea;
        private String projectType;
        private ProjectStatus status = ProjectStatus.CONCEPTUAL;
        private ArchitecturalStyle architecturalStyle;
        private ConstructionType constructionType;
        private Integer numberOfFloors;
        private Integer numberOfRooms;
        private boolean hasBasement = false;
        private boolean hasGarage = false;
        private Integer parkingSpots;
        private Double landscapingArea;
        private boolean environmentalLicenseRequired = false;
        private LocalDateTime estimatedEndDate;
        private LocalDateTime actualEndDate;
        private BigDecimal plannedCost = BigDecimal.ZERO;
        private BigDecimal actualCost = BigDecimal.ZERO;
        private ProjectVisibility visibility = ProjectVisibility.TEAM;
        private String ownerId;
        private String clientId;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder clientName(String clientName) {
            this.clientName = clientName;
            return this;
        }

        public Builder currentColumnId(String currentColumnId) {
            this.currentColumnId = currentColumnId;
            return this;
        }

        public Builder imageUrl(String imageUrl) {
            this.imageUrl = imageUrl;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder startDate(LocalDateTime startDate) {
            this.startDate = startDate;
            return this;
        }

        public Builder deliveryDate(LocalDateTime deliveryDate) {
            this.deliveryDate = deliveryDate;
            return this;
        }

        public Builder totalArea(Double totalArea) {
            this.totalArea = totalArea;
            return this;
        }

        public Builder projectType(String projectType) {
            this.projectType = projectType;
            return this;
        }

        public Builder status(ProjectStatus status) {
            this.status = status;
            return this;
        }

        public Builder architecturalStyle(ArchitecturalStyle architecturalStyle) {
            this.architecturalStyle = architecturalStyle;
            return this;
        }

        public Builder constructionType(ConstructionType constructionType) {
            this.constructionType = constructionType;
            return this;
        }

        public Builder numberOfFloors(Integer numberOfFloors) {
            this.numberOfFloors = numberOfFloors;
            return this;
        }

        public Builder numberOfRooms(Integer numberOfRooms) {
            this.numberOfRooms = numberOfRooms;
            return this;
        }

        public Builder hasBasement(boolean hasBasement) {
            this.hasBasement = hasBasement;
            return this;
        }

        public Builder hasGarage(boolean hasGarage) {
            this.hasGarage = hasGarage;
            return this;
        }

        public Builder parkingSpots(Integer parkingSpots) {
            this.parkingSpots = parkingSpots;
            return this;
        }

        public Builder landscapingArea(Double landscapingArea) {
            this.landscapingArea = landscapingArea;
            return this;
        }

        public Builder environmentalLicenseRequired(boolean environmentalLicenseRequired) {
            this.environmentalLicenseRequired = environmentalLicenseRequired;
            return this;
        }

        public Builder estimatedEndDate(LocalDateTime estimatedEndDate) {
            this.estimatedEndDate = estimatedEndDate;
            return this;
        }

        public Builder actualEndDate(LocalDateTime actualEndDate) {
            this.actualEndDate = actualEndDate;
            return this;
        }

        public Builder plannedCost(BigDecimal plannedCost) {
            this.plannedCost = plannedCost;
            return this;
        }

        public Builder actualCost(BigDecimal actualCost) {
            this.actualCost = actualCost;
            return this;
        }

        public Builder visibility(ProjectVisibility visibility) {
            this.visibility = visibility;
            return this;
        }

        public Builder ownerId(String ownerId) {
            this.ownerId = ownerId;
            return this;
        }

        public Builder clientId(String clientId) {
            this.clientId = clientId;
            return this;
        }

        public Project build() {
            return new Project(this);
        }
    }
}
