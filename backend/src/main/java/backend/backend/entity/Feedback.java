package backend.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedbacks")
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private Integer rating;

    @Column(name = "contact_consent", nullable = false)
    private Boolean contactConsent;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String comments;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "created_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public Feedback setId(Long id) {
        this.id = id; 
        return this;
    }
        
    public String getCategory() {
        return category;
    }

    public Feedback setCategory(String category) {
        this.category = category;
        return this;
    }

    public Integer getRating() {
        return rating;
    }

    public Feedback setRating(Integer rating) {
        this.rating = rating;
        return this;
    }

    public Boolean getContactConsent() {
        return contactConsent;
    }

    public Feedback setContactConsent(Boolean contactConsent) {
        this.contactConsent = contactConsent;
        return this;
    }

    public String getComments() {
        return comments;
    }

    public Feedback setComments(String comments) { 
        this.comments = comments; 
        return this; 
    }

    public User getUser() {
        return user;
    }

    public Feedback setUser(User user) {
        this.user = user;
        return this;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Feedback setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt; 
        return this;
    }
}
