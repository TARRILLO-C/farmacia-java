package com.sg.farmacia.dto.auth;

import com.sg.farmacia.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    private Long id;
    private String username;
    private String nombre;
    private Role rol;
    private Boolean activo;
    private java.util.Set<String> modulosPermitidos;
}
