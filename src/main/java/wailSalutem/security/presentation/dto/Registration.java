package wailSalutem.security.presentation.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

    public class Registration {
        @NotBlank
        public String email;

        @Size(min = 6)
        public String password;

        @NotBlank
        public String firstName;

        @NotBlank
        public String lastName;
    }