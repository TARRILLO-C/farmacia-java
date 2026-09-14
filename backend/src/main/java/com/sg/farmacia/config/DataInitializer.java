package com.sg.farmacia.config;

import com.sg.farmacia.model.Role;
import com.sg.farmacia.model.Usuario;
import com.sg.farmacia.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Inicializar usuario Administrador si no existe
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombre("Administrador Principal")
                    .rol(Role.ADMIN)
                    .activo(true)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario 'admin' creado exitosamente con rol ADMIN (pass: admin123)");
        }

        // Inicializar usuario Cajero si no existe
        if (!usuarioRepository.existsByUsername("cajero")) {
            Usuario cajero = Usuario.builder()
                    .username("cajero")
                    .password(passwordEncoder.encode("cajero123"))
                    .nombre("Cajero de Turno")
                    .rol(Role.CAJERO)
                    .activo(true)
                    .build();
            usuarioRepository.save(cajero);
            log.info("Usuario 'cajero' creado exitosamente con rol CAJERO (pass: cajero123)");
        }
    }
}
