package backend.backend.service;

import backend.backend.entity.*;
import backend.backend.repository.*;
import backend.backend.service.dto.JobApplicationRequest;
import backend.backend.service.dto.JobApplicationResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;

@Service
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final StatusRepository statusRepository;
    private final TagRepository tagRepository;

    public JobApplicationService(JobApplicationRepository jobApplicationRepository, 
                                 UserRepository userRepository,
                                 StatusRepository statusRepository, 
                                 TagRepository tagRepository) {
        this.jobApplicationRepository = jobApplicationRepository;
        this.userRepository = userRepository;
        this.statusRepository = statusRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional
    public JobApplicationResponse createApplication(JobApplicationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Status status = statusRepository.findById(request.getStatusId())
                .orElseThrow(() -> new RuntimeException("Status not found"));

        JobApplication application = new JobApplication()
                .setCompanyName(request.getCompanyName())
                .setJobTitle(request.getJobTitle())
                .setUser(currentUser)
                .setStatus(status);

        ApplicationDetails details = new ApplicationDetails()
                .setDescription(request.getDescription())
                .setHrContactEmail(request.getHrContactEmail())
                .setJobApplication(application);
        
        application.setApplicationDetails(details);

        if (request.getTagIds() != null && !request.getTagIds().isEmpty()) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            application.setTags(new HashSet<>(tags));
        }

        JobApplication saved = jobApplicationRepository.save(application);
        return mapToResponse(saved);
    }

    @Transactional
    public JobApplicationResponse patchApplication(Long id, JobApplicationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied: This is not your application");
        }

        if (request.getCompanyName() != null) app.setCompanyName(request.getCompanyName());
        if (request.getJobTitle() != null) app.setJobTitle(request.getJobTitle());
        
        if (request.getStatusId() != null) {
            Status status = statusRepository.findById(request.getStatusId())
                    .orElseThrow(() -> new RuntimeException("Status not found"));
            app.setStatus(status);
        }

        if (request.getDescription() != null || request.getHrContactEmail() != null) {
            ApplicationDetails details = app.getApplicationDetails();
            if (details == null) {
                details = new ApplicationDetails();
                details.setJobApplication(app);
                app.setApplicationDetails(details);
            }
            if (request.getDescription() != null) details.setDescription(request.getDescription());
            if (request.getHrContactEmail() != null) details.setHrContactEmail(request.getHrContactEmail());
        }

        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            app.getTags().clear();
            app.getTags().addAll(tags);
        }

        JobApplication saved = jobApplicationRepository.save(app);
        return mapToResponse(saved);
    }

    public List<JobApplicationResponse> getMyApplications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        List<JobApplication> apps = jobApplicationRepository.findAllByUser(currentUser);
        return apps.stream().map(this::mapToResponse).toList();

    }

    private JobApplicationResponse mapToResponse(JobApplication app) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.setId(app.getId());
        dto.setCompanyName(app.getCompanyName());
        dto.setJobTitle(app.getJobTitle());
        dto.setStatus(app.getStatus() != null ? app.getStatus().getName() : null);
        dto.setTags(app.getTags() != null ? app.getTags().stream().map(Tag::getName).collect(java.util.stream.Collectors.toSet()) : null);
        String userEmail = null;
        if (app.getUser() != null) {
            try {
                userEmail = app.getUser().getEmail();
            } catch (Exception e) {
                userEmail = null;
            }
        }
        dto.setUserEmail(userEmail);
        if (app.getApplicationDetails() != null) {
            dto.setDescription(app.getApplicationDetails().getDescription());
            dto.setHrContactEmail(app.getApplicationDetails().getHrContactEmail());
        }
        return dto;
    }

    @Transactional
    public void deleteApplication(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        JobApplication app = jobApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        if (!app.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }
        jobApplicationRepository.delete(app);
    }
}
