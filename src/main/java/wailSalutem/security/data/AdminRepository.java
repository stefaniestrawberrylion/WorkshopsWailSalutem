package wailSalutem.security.data;

import org.springframework.data.jpa.repository.JpaRepository;
import wailSalutem.security.domain.Admin;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByEmail(String email);
}
