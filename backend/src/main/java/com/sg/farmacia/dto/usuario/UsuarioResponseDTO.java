package com.sg.farmacia.dto.usuario;

import com.sg.farmacia.model.Role;
import com.sg.farmacia.model.Usuario;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponseDTO {

    private Long id;
    private String username;
    private String nombre;
    private Role rol;
    private Boolean activo;
    private java.util.Set<String> modulosPermitidos;
    private LocalDateTime createdAt;

    public static UsuarioResponseDTO fromEntity(Usuario usuario) {
        if (usuario == null) return null;
        return UsuarioResponseDTO.builder()
                .id(usuario.getId())
                .username(usuario.getUsername())
                .nombre(usuario.getNombre())
                .rol(usuario.getRol())
                .activo(usuario.getActivo())
                .modulosPermitidos(usuario.getModulosPermitidos())
                .createdAt(usuario.getCreatedAt())
                .build();
    }
}
