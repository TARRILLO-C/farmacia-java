package com.sg.farmacia.dto.principioactivo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrincipioActivoRequestDTO {

    @NotBlank(message = "El nombre del principio activo es obligatorio")
    @Size(min = 2, max = 150, message = "El nombre debe tener entre 2 y 150 caracteres")
    private String nombre;

    private String descripcion;
}
