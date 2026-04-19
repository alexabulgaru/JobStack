package backend.backend.service.dto;

public class FeedbackRequest {
    private String category;
    private Integer rating;
    private Boolean contactConsent;
    private String comments;
    private String userEmail;

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
}
