package wailSalutem.security.domain;

public class UserProfile {
    private final String username;
    private final String email;      // toegevoegd
    private final String firstName;
    private final String lastName;

    public UserProfile(String username, String email, String firstName, String lastName) {
        this.username = username;
        this.email = email;           // initialiseren
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;                 // getter toegevoegd
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }
}
