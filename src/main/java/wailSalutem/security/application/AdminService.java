package wailSalutem.security.application;

import jakarta.transaction.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import wailSalutem.security.data.AdminRepository;
import wailSalutem.security.domain.Admin;

@Service
@Transactional
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(AdminRepository adminRepository, PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void registerAdmin(String email, String password, String firstName, String lastName) {
        if (adminRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Admin email bestaat al: " + email);
        }

        String encodedPassword = passwordEncoder.encode(password);
        Admin admin = new Admin();
        admin.setEmail(email);
        admin.setPassword(encodedPassword);
        admin.setFirstName(firstName);
        admin.setLastName(lastName);
        adminRepository.save(admin);
    }
}
