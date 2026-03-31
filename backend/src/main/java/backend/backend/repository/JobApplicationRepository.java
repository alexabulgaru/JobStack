package backend.backend.repository;

import backend.backend.entity.JobApplication;
import backend.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByUser(User user);
    Page<JobApplication> findAllByUser(User user, Pageable pageable);

    boolean existsByUserAndCompanyNameIgnoreCaseAndJobTitleIgnoreCase(User user, String companyName, String jobTitle);
}
