package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.usuario.UsuarioRequestDTO;
import com.sg.farmacia.dto.usuario.UsuarioResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Usuario;
import com.sg.farmacia.repository.UsuarioRepository;
import com.sg.farmacia.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(UsuarioResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + id));
        return UsuarioResponseDTO.fromEntity(usuario);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO crear(UsuarioRequestDTO dto) {
        String username = dto.getUsername().trim().toLowerCase();

        if (usuarioRepository.existsByUsername(username)) {
            throw new BadRequestException("El nombre de usuario '" + username + "' ya se encuentra en uso.");
        }

        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new BadRequestException("La contraseña es obligatoria para nuevos usuarios.");
        }

        java.util.Set<String> modulos = dto.getModulosPermitidos();
        if (modulos == null || modulos.isEmpty()) {
            if (dto.getRol() == com.sg.farmacia.model.Role.ADMIN) {
                modulos = new java.util.HashSet<>(java.util.Arrays.asList(
                        "dashboard", "pos", "inventario", "categorias", "clientes", "ventas", "reportes", "usuarios"
                ));
            } else {
                modulos = new java.util.HashSet<>(java.util.Arrays.asList(
                        "dashboard", "pos", "clientes", "ventas"
                ));
            }
        }

        Usuario nuevoUsuario = Usuario.builder()
                .username(username)
                .password(passwordEncoder.encode(dto.getPassword().trim()))
                .nombre(dto.getNombre().trim())
                .rol(dto.getRol())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .modulosPermitidos(modulos)
                .build();

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        log.info("Usuario creado exitosamente: ID {}, Username {}, Rol {}", guardado.getId(), guardado.getUsername(), guardado.getRol());
        return UsuarioResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + id));

        String nuevoUsername = dto.getUsername().trim().toLowerCase();
        if (!usuario.getUsername().equalsIgnoreCase(nuevoUsername) && usuarioRepository.existsByUsername(nuevoUsername)) {
            throw new BadRequestException("El nombre de usuario '" + nuevoUsername + "' ya está registrado.");
        }

        usuario.setUsername(nuevoUsername);
        usuario.setNombre(dto.getNombre().trim());
        usuario.setRol(dto.getRol());

        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        if (dto.getModulosPermitidos() != null) {
            usuario.setModulosPermitidos(new java.util.HashSet<>(dto.getModulosPermitidos()));
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
            log.info("Contraseña actualizada para el usuario ID {}", id);
        }

        Usuario actualizado = usuarioRepository.save(usuario);
        log.info("Usuario actualizado exitosamente: ID {}, Username {}", actualizado.getId(), actualizado.getUsername());
        return UsuarioResponseDTO.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public UsuarioResponseDTO toggleActivo(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + id));

        // Proteger usuario admin principal contra auto-bloqueo accidental
        if ("admin".equalsIgnoreCase(usuario.getUsername()) && Boolean.TRUE.equals(usuario.getActivo())) {
            throw new BadRequestException("No se puede deshabilitar la cuenta principal de Administrador.");
        }

        usuario.setActivo(!Boolean.TRUE.equals(usuario.getActivo()));
        Usuario actualizado = usuarioRepository.save(usuario);
        log.info("Estado de usuario ID {} actualizado a activo={}", id, actualizado.getActivo());
        return UsuarioResponseDTO.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el usuario con ID: " + id));

        if ("admin".equalsIgnoreCase(usuario.getUsername())) {
            throw new BadRequestException("No está permitido eliminar al Administrador principal del sistema.");
        }

        usuarioRepository.delete(usuario);
        log.info("Usuario ID {} ('{}') eliminado correctamente.", id, usuario.getUsername());
    }
}
