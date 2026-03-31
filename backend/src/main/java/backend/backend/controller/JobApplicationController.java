package backend.backend.controller;

import backend.backend.service.dto.JobApplicationResponse;
import backend.backend.service.JobApplicationService;
import backend.backend.service.dto.JobApplicationRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;


@RestController
@RequestMapping("/api/applications")
@PreAuthorize("isAuthenticated()")
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    public JobApplicationController(JobApplicationService jobApplicationService) {
        this.jobApplicationService = jobApplicationService;
    }


    @PostMapping("/create")
    public ResponseEntity<JobApplicationResponse> create(@RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.createApplication(request));
    }


    @GetMapping("/get-my-list")
    public ResponseEntity<Page<JobApplicationResponse>> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(jobApplicationService.getMyApplications(page, size));
    }


    @PatchMapping("/patch/{id}")
    public ResponseEntity<JobApplicationResponse> patch(@PathVariable Long id, @RequestBody JobApplicationRequest request) {
        return ResponseEntity.ok(jobApplicationService.patchApplication(id, request));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        jobApplicationService.deleteApplication(id);
        return ResponseEntity.ok("Application deleted successfully");
    }

    @GetMapping("/stats/status")
    public ResponseEntity<java.util.Map<String, Long>> getStatsByStatus() {
        return ResponseEntity.ok(jobApplicationService.getStatsByStatus());
    }

    @GetMapping("/stats/monthly")
    public ResponseEntity<java.util.Map<String, Long>> getMonthlyEvolutionStats() {
        return ResponseEntity.ok(jobApplicationService.getMonthlyEvolutionStats());
    }
}
