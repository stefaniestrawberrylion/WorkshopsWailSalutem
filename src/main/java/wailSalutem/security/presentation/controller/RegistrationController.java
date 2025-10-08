package wailSalutem.security.presentation.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wailSalutem.security.application.UserService;

import java.util.Map;

@RestController
@RequestMapping("/register")
@CrossOrigin(origins = "*") // handig voor frontend requests
public class RegistrationController {

    private final UserService userService;

    public RegistrationController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Registreer een gewone gebruiker (rol: USER)
     */
    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        userService.register(email, password, firstName, lastName, "ROLE_USER");
        return ResponseEntity.ok(Map.of("message", "Gebruiker geregistreerd"));
    }

    /**
     * Registreer een admin (rol: ADMIN)
     * Alleen bedoeld voor initial setup of dev-doeleinden.
     */
    @PostMapping("/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");
        String firstName = body.get("firstName");
        String lastName = body.get("lastName");

        userService.register(email, password, firstName, lastName, "ROLE_ADMIN");
        return ResponseEntity.ok(Map.of("message", "Admin geregistreerd"));
    }
}
