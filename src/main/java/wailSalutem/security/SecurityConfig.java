package wailSalutem.security;

import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import wailSalutem.security.presentation.filters.JwtAuthenticationFilter;
import wailSalutem.security.presentation.filters.JwtAuthorizationFilter;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.springframework.http.HttpMethod.POST;
import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;
import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;


@Configuration
@EnableWebSecurity
@EnableMethodSecurity(securedEnabled = true)
public class SecurityConfig implements WebMvcConfigurer {
    private static final String LOGIN_PATH = "/login";
    private static final String REGISTER_PATH = "/register";
    @Value("${wailSalutem.security.jwt.expiration-in-ms}")
    private Integer jwtExpirationInMs;
    @Value("${wailSalutem.security.jwt.secret}")
    private String jwtSecret;

    @Bean
    protected AuthenticationManager authenticationManager(final PasswordEncoder passwordEncoder, final UserDetailsService userDetailsService) {
        final DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new ProviderManager(provider);
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> resolvers) {
        resolvers.add(new UserProfileResolver());
    }

    @Bean
    protected SecurityFilterChain filterChain(final HttpSecurity http, final AuthenticationManager authenticationManager) throws Exception {
        SecretKey signingKey = Keys.hmacShaKeyFor(this.jwtSecret.getBytes());

        http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(r -> r
                        .requestMatchers(antMatcher(POST, REGISTER_PATH)).permitAll()
                        .requestMatchers(antMatcher(POST, LOGIN_PATH)).permitAll()

                        // statische bestanden
                        .requestMatchers("/", "/index.html", "/inlog", "/html/**", "/css/**", "/js/**", "/image/**").permitAll()
                        .requestMatchers("/login").permitAll() // login endpoint open
                        .requestMatchers("/register/**").permitAll() // registraties
                        .requestMatchers("/admin/**").hasRole("ADMIN") // admin pagina's
                        .requestMatchers("/register").permitAll()
                        .requestMatchers("/uploads/**").permitAll()
                        .requestMatchers("/register/request").permitAll()
                        .requestMatchers("/error").anonymous()
                        .anyRequest().authenticated()
                )

                .addFilterBefore(new JwtAuthenticationFilter(
                        LOGIN_PATH,
                        signingKey,
                        jwtExpirationInMs,
                        authenticationManager
                ), UsernamePasswordAuthenticationFilter.class)
                .addFilter(new JwtAuthorizationFilter(signingKey, authenticationManager))
                .sessionManagement(s -> s.sessionCreationPolicy(STATELESS));

        return http.build();
    }

    @Bean
    public SecretKey jwtSigningKey(@Value("${wailSalutem.security.jwt.secret}") String secret) {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    @Bean
    protected PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


}