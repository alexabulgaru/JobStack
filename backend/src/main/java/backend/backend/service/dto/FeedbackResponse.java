package backend.backend.service.dto;

import java.time.LocalDateTime;

public class FeedbackResponse {
    private Long id;
    private String category;
    private Integer rating;
    private Boolean contactConsent;
    private String comments;
    private String userEmail;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Boolean getContactConsent() {
        return contactConsent;
    }

    public void setContactConsent(Boolean contactConsent) {
        this.contactConsent = contactConsent;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(String comments) {
        this.comments = comments;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
