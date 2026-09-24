package com.sg.farmacia.dto.auth;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.sg.farmacia.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {

    private Long id;
    private String username;
    private String email;
    private String nombre;
    private Role rol;
    private Boolean activo;
    private Set<String> modulosPermitidos;

    @JsonGetter("rol")
    public String getRolNombre() {
        return this.rol != null ? this.rol.getNombre() : null;
    }
}
