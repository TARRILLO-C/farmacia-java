package com.sg.farmacia.config;

import com.sg.farmacia.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Endpoints Públicos de Autenticación
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 2. Endpoints de Ventas, Recibos y Clientes (ADMIN y CAJERO)
                        .requestMatchers("/api/v1/ventas/**").hasAnyRole("ADMIN", "CAJERO")
                        .requestMatchers("/api/v1/recibos/**").hasAnyRole("ADMIN", "CAJERO")
                        .requestMatchers("/api/v1/clientes/**").hasAnyRole("ADMIN", "CAJERO")

                        // 3. Catálogo y Familias: Lectura permitida para CAJERO y ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**").hasAnyRole("ADMIN", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").hasAnyRole("ADMIN", "CAJERO")

                        // 4. Gestión de Catálogo: Creación, Modificación y Baja exclusiva de ADMIN
                        .requestMatchers(HttpMethod.POST, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/categorias/**").hasRole("ADMIN")

                        // 5. Cualquier otra solicitud requiere autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
