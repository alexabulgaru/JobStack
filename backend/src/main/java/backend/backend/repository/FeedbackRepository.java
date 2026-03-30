package backend.backend.repository;

import backend.backend.entity.Feedback;
import backend.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findAllByUser(User user);
}
