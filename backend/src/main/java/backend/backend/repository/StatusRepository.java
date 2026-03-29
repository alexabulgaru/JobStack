package backend.backend.repository;

import backend.backend.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface StatusRepository extends JpaRepository<Status, Long> {
    Optional<Status> findByName(String name);
}
