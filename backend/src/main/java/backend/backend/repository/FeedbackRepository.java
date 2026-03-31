package backend.backend.repository;

import backend.backend.entity.Feedback;
import backend.backend.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Page<Feedback> findAllByUser(User user, Pageable pageable);
}
