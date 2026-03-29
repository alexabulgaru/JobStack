package backend.backend.repository;

import backend.backend.entity.JobApplication;
import backend.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findAllByUser(User user);
}
