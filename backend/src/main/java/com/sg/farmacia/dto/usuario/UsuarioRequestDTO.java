package com.sg.farmacia.dto.usuario;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioRequestDTO {

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    private String username;

    @Email(message = "El email debe tener un formato válido")
    private String email;

    @Size(min = 4, max = 50, message = "La contraseña debe tener al menos 4 caracteres")
    private String password;

    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    private Long empleadoId;

    @JsonAlias({"rolId", "idRol"})
    private Long rolId;

    @JsonAlias({"rolNombre", "rol"})
    private String rol;

    @Builder.Default
    private Boolean activo = true;

    private Set<String> modulosPermitidos;
}
