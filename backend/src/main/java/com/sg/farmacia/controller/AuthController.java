package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.auth.AuthResponseDTO;
import com.sg.farmacia.dto.auth.LoginRequestDTO;
import com.sg.farmacia.dto.auth.UsuarioDTO;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Usuario;
import com.sg.farmacia.repository.UsuarioRepository;
import com.sg.farmacia.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO dto) {
        log.info("Intento de inicio de sesión para el usuario: {}", dto.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getUsername(), dto.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = usuarioRepository.findByUsername(dto.getUsername())
                .or(() -> usuarioRepository.findByEmail(dto.getUsername()))
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + dto.getUsername()));

        String rolNombre = (usuario.getRol() != null) ? usuario.getRol().getNombre() : "CAJERO";

        String token = jwtTokenProvider.generarToken(
                usuario.getUsername(),
                rolNombre,
                usuario.getId(),
                usuario.getNombre()
        );

        UsuarioDTO usuarioDTO = UsuarioDTO.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .modulosPermitidos(usuario.getModulosPermitidos())
                .build();

        AuthResponseDTO responseDTO = AuthResponseDTO.builder()
                .token(token)
                .type("Bearer")
                .username(usuario.getUsername())
                .rol(rolNombre)
                .nombre(usuario.getNombre())
                .usuario(usuarioDTO)
                .build();

        log.info("Usuario '{}' autenticado exitosamente con rol: {}", usuario.getUsername(), rolNombre);

        return ResponseEntity.ok(ApiResponse.success(responseDTO, "Inicio de sesión exitoso"));
    }
}
