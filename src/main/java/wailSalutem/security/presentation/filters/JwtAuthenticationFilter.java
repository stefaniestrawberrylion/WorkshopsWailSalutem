package wailSalutem.security.presentation.filters;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.Jwts;


import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.AbstractAuthenticationProcessingFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import wailSalutem.security.domain.User;
import wailSalutem.security.presentation.dto.Login;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.Date;
import java.util.List;


public class JwtAuthenticationFilter extends AbstractAuthenticationProcessingFilter {
    private final SecretKey signingKey;
    private final Integer expirationInMs;

    private final AuthenticationManager authenticationManager;

    public JwtAuthenticationFilter(
            String path,
            SecretKey signingKey,
            Integer expirationInMs,
            AuthenticationManager authenticationManager
    ) {
        super(new AntPathRequestMatcher(path));

        this.signingKey = signingKey;
        this.expirationInMs = expirationInMs;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response)
            throws AuthenticationException, IOException {
        Login login = new ObjectMapper()
                .readValue(request.getInputStream(), Login.class);

        return authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(login.email, login.password)
        );
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain filterChain, Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        List<String> roles = user.getAuthorities().stream()
                .map(a -> {
                    String r = a.getAuthority();
                    if(!r.startsWith("ROLE_")) return "ROLE_" + r;
                    return r;
                })
                .toList();


        String token = Jwts.builder()
                .header().add("typ", "JWT").and()
                .issuer("wailsalutem-workshops")
                .audience().add("wailsalutem").and()
                .subject(user.getUsername())
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60))
                .claim("rol", roles)
                .claim("email", user.getEmail())
                .claim("firstName", user.getFirstName())
                .claim("lastName", user.getLastName())
                .signWith(signingKey)
                .compact();

        response.addHeader("Authorization", "Bearer " + token);
        response.addHeader("Access-Control-Expose-Headers", "Authorization");
    }
}