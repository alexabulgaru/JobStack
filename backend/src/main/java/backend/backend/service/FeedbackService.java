package backend.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import backend.backend.entity.Feedback;
import backend.backend.entity.User;
import backend.backend.repository.FeedbackRepository;
import backend.backend.repository.UserRepository;
import backend.backend.service.dto.FeedbackRequest;
import backend.backend.service.dto.FeedbackResponse;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FeedbackResponse createFeedback(FeedbackRequest request) {
        User targetUser = resolveTargetUser(request.getUserEmail());

        Feedback feedback = new Feedback()
                .setCategory(request.getCategory())
                .setRating(request.getRating())
                .setContactConsent(request.getContactConsent())
                .setComments(request.getComments())
            .setUser(targetUser);

        Feedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getMyFeedbacks(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        
        Pageable pageable = PageRequest.of(page, size);
        
        return feedbackRepository.findAllByUser(currentUser, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<FeedbackResponse> getAllFeedbacks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        
        return feedbackRepository.findAll(pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public FeedbackResponse updateFeedbackByAdmin(Long id, FeedbackRequest request) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));

        feedback.setCategory(request.getCategory());
        feedback.setRating(request.getRating());
        feedback.setContactConsent(request.getContactConsent());
        feedback.setComments(request.getComments());

        if (request.getUserEmail() != null && !request.getUserEmail().trim().isEmpty()) {
            User user = userRepository.findByEmail(request.getUserEmail().trim().toLowerCase())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            feedback.setUser(user);
        }

        return mapToResponse(feedbackRepository.save(feedback));
    }

    @Transactional
    public void deleteFeedbackByAdmin(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new RuntimeException("Feedback not found");
        }

        feedbackRepository.deleteById(id);
    }

    private User resolveTargetUser(String requestedUserEmail) {
        User currentUser = getCurrentUser();

        if (requestedUserEmail == null || requestedUserEmail.trim().isEmpty() || !isCurrentUserAdmin()) {
            return currentUser;
        }

        return userRepository.findByEmail(requestedUserEmail.trim().toLowerCase())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setCategory(feedback.getCategory());
        response.setRating(feedback.getRating());
        response.setContactConsent(feedback.getContactConsent());
        response.setComments(feedback.getComments());
        response.setCreatedAt(feedback.getCreatedAt());
        if (feedback.getUser() != null) {
            response.setUserEmail(feedback.getUser().getEmail());
        }
        return response;
    }
}
