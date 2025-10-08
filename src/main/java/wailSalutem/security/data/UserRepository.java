package wailSalutem.security.data;


import org.springframework.data.jpa.repository.JpaRepository;
import wailSalutem.security.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
