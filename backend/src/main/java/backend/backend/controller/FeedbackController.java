package backend.backend.controller;

import backend.backend.service.FeedbackService;
import backend.backend.service.dto.FeedbackRequest;
import backend.backend.service.dto.FeedbackResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@PreAuthorize("isAuthenticated()")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/create")
    public ResponseEntity<FeedbackResponse> create(@RequestBody FeedbackRequest request) {
        return ResponseEntity.ok(feedbackService.createFeedback(request));
    }

    @GetMapping("/my-list")
    public ResponseEntity<List<FeedbackResponse>> getMyList() {
        return ResponseEntity.ok(feedbackService.getMyFeedbacks());
    }

    @GetMapping("/get-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FeedbackResponse>> getAll() {
        return ResponseEntity.ok(feedbackService.getAllFeedbacks());
    }
}
