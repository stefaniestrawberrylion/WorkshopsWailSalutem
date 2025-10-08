package wailSalutem.security.presentation.filters;

import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import wailSalutem.security.domain.UserProfile;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.util.List;


public class JwtAuthorizationFilter extends BasicAuthenticationFilter {
    private final SecretKey signingKey;
    private final Logger logger = LoggerFactory.getLogger(JwtAuthorizationFilter.class);

    public JwtAuthorizationFilter(
            SecretKey secret,
            AuthenticationManager authenticationManager
    ) {
        super(authenticationManager);

        this.signingKey = secret;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws IOException, ServletException {
        Authentication authentication = this.getAuthentication(request);
        if (authentication != null) {
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }

        filterChain.doFilter(request, response);
    }

    private Authentication getAuthentication(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token == null || !token.startsWith("Bearer ")) return null;

        try {
            JwtParser jwtParser = Jwts.parser()
                    .verifyWith(this.signingKey)
                    .build();

            Jws<Claims> parsedToken = jwtParser.parseSignedClaims(token.replace("Bearer ", ""));
            String username = parsedToken.getPayload().getSubject();
            List<SimpleGrantedAuthority> authorities = ((List<?>) parsedToken.getPayload().get("rol"))
                    .stream()
                    .map(a -> new SimpleGrantedAuthority((String) a))
                    .toList();

            if (username == null || username.isEmpty()) return null;

            UserProfile principal = new UserProfile(
                    username,
                    (String) parsedToken.getPayload().get("email"),
                    (String) parsedToken.getPayload().get("lastName")
            );

            return new UsernamePasswordAuthenticationToken(principal, null, authorities);

        } catch (JwtException e) {
            return null;
        }
    }

}