package com.thewebproject.app.thwebproject.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "demo_reviews", indexes = @Index(name = "idx_demo_review_client", columnList = "client_id"))
public class DemoReview {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "client_id", nullable = false) private Integer clientId;
    @Column(nullable = false) private String reviewerName;
    private String reviewerCity;
    @Column(nullable = false) private Integer stars;
    @Column(nullable = false, length = 3000) private String text;
    @Column(nullable = false) private LocalDateTime submittedAt = LocalDateTime.now();
    @Column(nullable = false) private boolean approved;

    public Long getId() { return id; }
    public Integer getClientId() { return clientId; }
    public void setClientId(Integer clientId) { this.clientId = clientId; }
    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
    public String getReviewerCity() { return reviewerCity; }
    public void setReviewerCity(String reviewerCity) { this.reviewerCity = reviewerCity; }
    public Integer getStars() { return stars; }
    public void setStars(Integer stars) { this.stars = stars; }
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
}
