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
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String type = "Bearer";

    private String username;

    private String rol;

    private String nombre;

    private UsuarioDTO usuario;
}
