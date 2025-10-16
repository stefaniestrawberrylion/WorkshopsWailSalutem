package wailSalutem.security.presentation.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import wailSalutem.security.application.UserService;
import wailSalutem.security.domain.Enum.Status;

import java.util.Map;

@RestController
@RequestMapping("/register")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final UserService userService;

    public RegistrationController(UserService userService) {
        this.userService = userService;
    }

    // ================== REGISTRATIE ==================

    @PostMapping
    public ResponseEntity<?> registerUser(@RequestBody Map<String, String> body) {
        try {
            userService.register(
                    body.get("email"),
                    body.get("password"),
                    body.get("firstName"),
                    body.get("lastName"),
                    wailSalutem.security.domain.Enum.Role.USER
            );
            return ResponseEntity.ok(Map.of("message", "Gebruiker geregistreerd"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/admin")
    public ResponseEntity<?> registerAdmin(@RequestBody Map<String, String> body) {
        try {
            userService.register(
                    body.get("email"),
                    body.get("password"),
                    body.get("firstName"),
                    body.get("lastName"),
                    wailSalutem.security.domain.Enum.Role.ADMIN
            );
            return ResponseEntity.ok(Map.of("message", "Admin geregistreerd"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> registerRequest(@RequestBody Map<String, String> body) {
        try {
            userService.registerRequest(
                    body.get("email"),
                    body.get("password"),
                    body.get("firstName"),
                    body.get("lastName"),
                    body.get("school"),
                    body.get("phone")
            );
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ================== PENDING USERS ==================

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PatchMapping("/approve/{id}")
    public ResponseEntity<?> approveUser(@PathVariable Long id) {
        try {
            userService.updateStatus(id, Status.APPROVED);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PatchMapping("/deny/{id}")
    public ResponseEntity<?> denyUser(@PathVariable Long id) {
        try {
            userService.updateStatus(id, Status.DENIED);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ================== LOGIN ==================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String password = body.get("password");

        var user = userService.findByEmail(email);

        if (user == null || !userService.checkPassword(user, password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Ongeldige e-mail of wachtwoord"));
        }

        if (user.getStatus() != Status.APPROVED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account nog niet goedgekeurd door admin"));
        }

        // ===== LOGGING =====
        System.out.println("Login succesvol voor gebruiker: " + user.getEmail());
        System.out.println("Rol van gebruiker: " + user.getRole());

        // JWT wordt door filter toegevoegd; hier alleen succesbericht
        HttpHeaders headers = new HttpHeaders();
        return ResponseEntity.ok().headers(headers).body(Map.of("message", "Login succesvol"));
    }

}
