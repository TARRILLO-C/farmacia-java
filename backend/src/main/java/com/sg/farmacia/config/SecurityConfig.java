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
                        // Preflight CORS para navegadores
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // 1. Recursos Estáticos y Portal de Documentación
                        .requestMatchers("/", "/index.html", "/favicon.ico", "/error", "/css/**", "/js/**", "/images/**").permitAll()

                        // 2. Endpoints Públicos de Autenticación
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // 3. Ventas, Recibos y Clientes (ADMIN, FARMACEUTICO y CAJERO)
                        .requestMatchers("/api/v1/ventas/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers("/api/v1/recibos/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers("/api/v1/clientes/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers("/api/v1/fidelizacion/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")

                        // 4. Catálogos y Lotes: Lectura permitida para CAJERO, FARMACEUTICO y ADMIN
                        .requestMatchers(HttpMethod.GET, "/api/v1/productos/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/laboratorios/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/principios-activos/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/presentaciones/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/metodos-pago/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")
                        .requestMatchers(HttpMethod.GET, "/api/v1/lotes/**").hasAnyRole("ADMIN", "FARMACEUTICO", "CAJERO")

                        // 5. Abastecimiento (Compras), Proveedores y Gestión de Lotes (ADMIN y FARMACEUTICO)
                        .requestMatchers("/api/v1/compras/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/proveedores/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/lotes/**").hasAnyRole("ADMIN", "FARMACEUTICO")

                        // 6. Modificación de Catálogos (ADMIN y FARMACEUTICO)
                        .requestMatchers(HttpMethod.POST, "/api/v1/productos/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/productos/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/productos/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/categorias/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/laboratorios/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/principios-activos/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/presentaciones/**").hasAnyRole("ADMIN", "FARMACEUTICO")
                        .requestMatchers("/api/v1/metodos-pago/**").hasRole("ADMIN")

                        // 7. Gestión de Personal y Seguridad (Exclusivo ADMIN)
                        .requestMatchers("/api/v1/empleados/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/usuarios/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/roles/**").hasRole("ADMIN")

                        // 8. Cualquier otra solicitud requiere autenticación
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
