package wailSalutem.security.application;

import jakarta.transaction.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import wailSalutem.security.data.UserRepository;
import wailSalutem.security.domain.Enum.Role;
import wailSalutem.security.domain.Enum.Status;
import wailSalutem.security.domain.User;

import java.util.List;

@Service
@Transactional
public class UserService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registreert een nieuwe gebruiker met een opgegeven rol.
     * Gooit een exception als het e-mailadres al bestaat.
     */
    public void register(String email, String password, String firstName, String lastName, Role role) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email bestaat al: " + email);
        }

        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(email, encodedPassword, firstName, lastName, role);
        userRepository.save(user);
    }

    public void registerRequest(String email, String password, String firstName, String lastName, String school, String phone) {
        if(userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("Email bestaat al: " + email);
        }

        String encodedPassword = passwordEncoder.encode(password);
        User user = new User(email, encodedPassword, firstName, lastName, Role.USER); // gebruik enum
        user.setStatus(Status.PENDING); // gebruik enum
        user.setSchool(school);
        user.setPhone(phone);
        userRepository.save(user);
    }

    @Transactional
    public void updateStatus(Long userId, Status status) { // gebruik enum in parameter
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Gebruiker niet gevonden met id: " + userId));

        user.setStatus(status); // enum gebruiken
    }

    public List<User> getPendingUsers() {
        return userRepository.findByStatus(Status.PENDING);
    }
    public List<User> getUsersByStatus(Status status) {
        return userRepository.findByStatus(status); // JPA repository methode
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }


    /**
     * Vind een gebruiker op e-mailadres. Retourneert null als niet gevonden.
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    /**
     * Wordt gebruikt door Spring Security tijdens authenticatie.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Gebruiker niet gevonden: " + email));
    }
    /**
     * Controleert of het ingevoerde wachtwoord overeenkomt met het gehashte wachtwoord van de gebruiker.
     */
    public boolean checkPassword(User user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPassword());
    }

}
