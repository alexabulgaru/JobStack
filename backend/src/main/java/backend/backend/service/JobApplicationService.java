package backend.backend.service;

import backend.backend.entity.*;
import backend.backend.repository.*;
import backend.backend.service.dto.JobApplicationRequest;
import backend.backend.service.dto.JobApplicationResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

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

        boolean alreadyExists = jobApplicationRepository.existsByUserAndCompanyNameIgnoreCaseAndJobTitleIgnoreCase(
                currentUser, request.getCompanyName(), request.getJobTitle()
        );

        if (alreadyExists) {
            throw new RuntimeException("You have already applied for the " + request.getJobTitle() + " role at " + request.getCompanyName());
        }

        LocalDate finalAppliedDate = request.getAppliedDate() != null ? request.getAppliedDate() : LocalDate.now();

        JobApplication application = new JobApplication()
                .setCompanyName(request.getCompanyName())
                .setJobTitle(request.getJobTitle())
                .setAppliedDate(finalAppliedDate)
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

        if (request.getCompanyName() != null) {
            app.setCompanyName(request.getCompanyName());
        }

        if (request.getJobTitle() != null) {
            app.setJobTitle(request.getJobTitle());
        }

        if (request.getAppliedDate() != null) {
            app.setAppliedDate(request.getAppliedDate());
        }

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
            if (request.getDescription() != null) {
                details.setDescription(request.getDescription());
            }

            if (request.getHrContactEmail() != null) {
                details.setHrContactEmail(request.getHrContactEmail());
            }
        }

        if (request.getTagIds() != null) {
            List<Tag> tags = tagRepository.findAllById(request.getTagIds());
            app.getTags().clear();
            app.getTags().addAll(tags);
        }

        JobApplication saved = jobApplicationRepository.save(app);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<JobApplicationResponse> getMyApplications(int page, int size) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        
        Pageable pageable = PageRequest.of(page, size);
        
        return jobApplicationRepository.findAllByUser(currentUser, pageable)
                .map(this::mapToResponse);
    }

    private JobApplicationResponse mapToResponse(JobApplication app) {
        JobApplicationResponse dto = new JobApplicationResponse();
        dto.setId(app.getId());
        dto.setCompanyName(app.getCompanyName());
        dto.setJobTitle(app.getJobTitle());
        dto.setAppliedDate(app.getAppliedDate());
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

    public Map<String, Long> getStatsByStatus() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        
        return jobApplicationRepository.findAllByUser(currentUser).stream()
            .collect(Collectors.groupingBy(
                app -> app.getStatus().getName(),
                Collectors.counting()
            ));
    }

    public Map<String, Long> getMonthlyEvolutionStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(email).orElseThrow();
        
        return jobApplicationRepository.findAllByUser(currentUser).stream()
            .filter(app -> app.getAppliedDate() != null)
            .collect(Collectors.groupingBy(
                app -> app.getAppliedDate().getYear() + "-" + String.format("%02d", app.getAppliedDate().getMonthValue()),
                Collectors.counting()
            ));
    }
}
