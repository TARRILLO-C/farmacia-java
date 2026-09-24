package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.usuario.UsuarioRequestDTO;
import com.sg.farmacia.dto.usuario.UsuarioResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Empleado;
import com.sg.farmacia.model.Role;
import com.sg.farmacia.model.Usuario;
import com.sg.farmacia.repository.EmpleadoRepository;
import com.sg.farmacia.repository.RoleRepository;
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
    private final EmpleadoRepository empleadoRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAllWithRelations()
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

        String email = (dto.getEmail() != null && !dto.getEmail().isBlank())
                ? dto.getEmail().trim().toLowerCase()
                : username + "@farmacia.pe";

        if (usuarioRepository.existsByEmail(email)) {
            throw new BadRequestException("El email '" + email + "' ya se encuentra registrado.");
        }

        Role rol = resolverRol(dto.getRolId(), dto.getRol());
        Empleado empleado = resolverOAsignarEmpleado(dto.getEmpleadoId(), dto.getNombre(), username);

        Usuario nuevoUsuario = Usuario.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(dto.getPassword().trim()))
                .empleado(empleado)
                .rol(rol)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        Usuario guardado = usuarioRepository.save(nuevoUsuario);
        log.info("Usuario creado exitosamente: ID {}, Username {}, Rol {}", guardado.getId(), guardado.getUsername(), guardado.getRol().getNombre());
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

        if (dto.getEmail() != null && !dto.getEmail().isBlank()) {
            String nuevoEmail = dto.getEmail().trim().toLowerCase();
            if (!nuevoEmail.equalsIgnoreCase(usuario.getEmail()) && usuarioRepository.existsByEmail(nuevoEmail)) {
                throw new BadRequestException("El email '" + nuevoEmail + "' ya está registrado.");
            }
            usuario.setEmail(nuevoEmail);
        }

        usuario.setUsername(nuevoUsername);

        if (dto.getRolId() != null || (dto.getRol() != null && !dto.getRol().isBlank())) {
            usuario.setRol(resolverRol(dto.getRolId(), dto.getRol()));
        }

        if (dto.getEmpleadoId() != null) {
            Empleado emp = empleadoRepository.findById(dto.getEmpleadoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + dto.getEmpleadoId()));
            usuario.setEmpleado(emp);
        } else if (dto.getNombre() != null && !dto.getNombre().isBlank() && usuario.getEmpleado() != null) {
            String[] partes = dto.getNombre().trim().split("\\s+", 2);
            usuario.getEmpleado().setNombres(partes[0]);
            if (partes.length > 1) {
                usuario.getEmpleado().setApellidos(partes[1]);
            }
            empleadoRepository.save(usuario.getEmpleado());
        }

        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            usuario.setPasswordHash(passwordEncoder.encode(dto.getPassword().trim()));
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

    private Role resolverRol(Long rolId, String rolNombre) {
        if (rolId != null) {
            return roleRepository.findById(rolId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + rolId));
        }
        if (rolNombre != null && !rolNombre.isBlank()) {
            return roleRepository.findByNombre(rolNombre.trim().toUpperCase())
                    .orElseGet(() -> roleRepository.save(Role.builder().nombre(rolNombre.trim().toUpperCase()).build()));
        }
        return roleRepository.findByNombre("CAJERO")
                .orElseGet(() -> roleRepository.save(Role.builder().nombre("CAJERO").build()));
    }

    private Empleado resolverOAsignarEmpleado(Long empleadoId, String nombre, String username) {
        if (empleadoId != null) {
            return empleadoRepository.findById(empleadoId)
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + empleadoId));
        }

        String n = (nombre != null && !nombre.isBlank()) ? nombre.trim() : username;
        String[] partes = n.split("\\s+", 2);
        String nombres = partes[0];
        String apellidos = partes.length > 1 ? partes[1] : "Sistema";

        String dniGenerado = String.format("%08d", Math.abs((username + System.currentTimeMillis()).hashCode()) % 100000000);
        while (empleadoRepository.existsByDni(dniGenerado)) {
            dniGenerado = String.format("%08d", (Long.parseLong(dniGenerado) + 1) % 100000000);
        }

        Empleado emp = Empleado.builder()
                .dni(dniGenerado)
                .nombres(nombres)
                .apellidos(apellidos)
                .activo(true)
                .build();

        return empleadoRepository.save(emp);
    }
}
