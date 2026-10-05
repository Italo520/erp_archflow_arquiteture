package com.archflow.modules.client.entity;

import com.archflow.core.domain.BaseEntity;
import com.archflow.modules.client.domain.ClientCategory;
import com.archflow.modules.client.domain.ClientLegalType;
import com.archflow.modules.client.domain.ClientStatus;
import com.archflow.modules.client.domain.ContactPreference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "clients")
public class Client extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(length = 50)
    private String phone;

    private String website;

    @Enumerated(EnumType.STRING)
    @Column(name = "legal_type", nullable = false, length = 20)
    private ClientLegalType legalType = ClientLegalType.PF;

    @Column(length = 50)
    private String document;

    @Column(name = "razao_social")
    private String razaoSocial;

    @Column(name = "inscricao_estadual", length = 50)
    private String inscricaoEstadual;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClientCategory category = ClientCategory.RESIDENTIAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ClientStatus status = ClientStatus.PROSPECT;

    private Double rating = 5.0;

    @Column(name = "total_spent", precision = 12, scale = 2)
    private BigDecimal totalSpent = BigDecimal.ZERO;

    @Column(length = 500)
    private String avatar;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_preference", length = 50)
    private ContactPreference contactPreference = ContactPreference.WHATSAPP;

    @Column(name = "user_id", length = 36)
    private String userId;

    @Column(name = "last_interaction_at")
    private LocalDateTime lastInteractionAt;

    public Client() {
    }

    public Client(Builder builder) {
        if (builder.id != null) {
            this.setId(builder.id);
        }
        this.name = builder.name;
        this.email = builder.email;
        this.phone = builder.phone;
        this.website = builder.website;
        this.legalType = builder.legalType != null ? builder.legalType : ClientLegalType.PF;
        this.document = builder.document;
        this.razaoSocial = builder.razaoSocial;
        this.inscricaoEstadual = builder.inscricaoEstadual;
        this.address = builder.address;
        this.category = builder.category != null ? builder.category : ClientCategory.RESIDENTIAL;
        this.status = builder.status != null ? builder.status : ClientStatus.PROSPECT;
        this.rating = builder.rating != null ? builder.rating : 5.0;
        this.totalSpent = builder.totalSpent != null ? builder.totalSpent : BigDecimal.ZERO;
        this.avatar = builder.avatar;
        this.notes = builder.notes;
        this.contactPreference = builder.contactPreference != null ? builder.contactPreference : ContactPreference.WHATSAPP;
        this.userId = builder.userId;
        this.lastInteractionAt = builder.lastInteractionAt;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public ClientLegalType getLegalType() {
        return legalType;
    }

    public void setLegalType(ClientLegalType legalType) {
        this.legalType = legalType;
    }

    public String getDocument() {
        return document;
    }

    public void setDocument(String document) {
        this.document = document;
    }

    public String getRazaoSocial() {
        return razaoSocial;
    }

    public void setRazaoSocial(String razaoSocial) {
        this.razaoSocial = razaoSocial;
    }

    public String getInscricaoEstadual() {
        return inscricaoEstadual;
    }

    public void setInscricaoEstadual(String inscricaoEstadual) {
        this.inscricaoEstadual = inscricaoEstadual;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public ClientCategory getCategory() {
        return category;
    }

    public void setCategory(ClientCategory category) {
        this.category = category;
    }

    public ClientStatus getStatus() {
        return status;
    }

    public void setStatus(ClientStatus status) {
        this.status = status;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public ContactPreference getContactPreference() {
        return contactPreference;
    }

    public void setContactPreference(ContactPreference contactPreference) {
        this.contactPreference = contactPreference;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getLastInteractionAt() {
        return lastInteractionAt;
    }

    public void setLastInteractionAt(LocalDateTime lastInteractionAt) {
        this.lastInteractionAt = lastInteractionAt;
    }

    public static class Builder {
        private String id;
        private String name;
        private String email;
        private String phone;
        private String website;
        private ClientLegalType legalType = ClientLegalType.PF;
        private String document;
        private String razaoSocial;
        private String inscricaoEstadual;
        private String address;
        private ClientCategory category = ClientCategory.RESIDENTIAL;
        private ClientStatus status = ClientStatus.PROSPECT;
        private Double rating = 5.0;
        private BigDecimal totalSpent = BigDecimal.ZERO;
        private String avatar;
        private String notes;
        private ContactPreference contactPreference = ContactPreference.WHATSAPP;
        private String userId;
        private LocalDateTime lastInteractionAt;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder website(String website) {
            this.website = website;
            return this;
        }

        public Builder legalType(ClientLegalType legalType) {
            this.legalType = legalType;
            return this;
        }

        public Builder document(String document) {
            this.document = document;
            return this;
        }

        public Builder razaoSocial(String razaoSocial) {
            this.razaoSocial = razaoSocial;
            return this;
        }

        public Builder inscricaoEstadual(String inscricaoEstadual) {
            this.inscricaoEstadual = inscricaoEstadual;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder category(ClientCategory category) {
            this.category = category;
            return this;
        }

        public Builder status(ClientStatus status) {
            this.status = status;
            return this;
        }

        public Builder rating(Double rating) {
            this.rating = rating;
            return this;
        }

        public Builder totalSpent(BigDecimal totalSpent) {
            this.totalSpent = totalSpent;
            return this;
        }

        public Builder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }

        public Builder notes(String notes) {
            this.notes = notes;
            return this;
        }

        public Builder contactPreference(ContactPreference contactPreference) {
            this.contactPreference = contactPreference;
            return this;
        }

        public Builder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public Builder lastInteractionAt(LocalDateTime lastInteractionAt) {
            this.lastInteractionAt = lastInteractionAt;
            return this;
        }

        public Client build() {
            return new Client(this);
        }
    }
}
