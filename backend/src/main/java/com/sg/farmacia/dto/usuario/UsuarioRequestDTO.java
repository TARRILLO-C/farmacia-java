package com.sg.farmacia.dto.usuario;

import com.sg.farmacia.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    private String username;

    @Size(min = 4, max = 50, message = "La contraseña debe tener al menos 4 caracteres")
    private String password;

    @NotBlank(message = "El nombre completo es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @NotNull(message = "El rol es obligatorio (ADMIN o CAJERO)")
    private Role rol;

    @Builder.Default
    private Boolean activo = true;

    private java.util.Set<String> modulosPermitidos;
}
