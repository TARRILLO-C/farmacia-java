package com.sg.farmacia.dto.usuario;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.sg.farmacia.model.Role;
import com.sg.farmacia.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long id;
    private String username;
    private String email;
    private String nombre;
    private Long empleadoId;
    private Role rol;
    private Boolean activo;
    private Set<String> modulosPermitidos;
    private LocalDateTime createdAt;

    @JsonGetter("rol")
    public String getRolNombre() {
        return this.rol != null ? this.rol.getNombre() : null;
    }

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        if (usuario == null) return null;
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .email(usuario.getEmail())
                .nombre(usuario.getNombre())
                .empleadoId(usuario.getEmpleado() != null ? usuario.getEmpleado().getId() : null)
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .modulosPermitidos(usuario.getModulosPermitidos())
                .createdAt(usuario.getCreatedAt())
                .build();
    }
}
