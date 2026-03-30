package backend.backend.service;

import backend.backend.entity.Feedback;
import backend.backend.entity.User;
import backend.backend.repository.FeedbackRepository;
import backend.backend.repository.UserRepository;
import backend.backend.service.dto.FeedbackRequest;
import backend.backend.service.dto.FeedbackResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Feedback feedback = new Feedback()
                .setCategory(request.getCategory())
                .setRating(request.getRating())
                .setContactConsent(request.getContactConsent())
                .setComments(request.getComments())
                .setUser(currentUser);

        Feedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    public List<FeedbackResponse> getMyFeedbacks() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        
        return feedbackRepository.findAllByUser(currentUser).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FeedbackResponse> getAllFeedbacks() {
        return feedbackRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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
