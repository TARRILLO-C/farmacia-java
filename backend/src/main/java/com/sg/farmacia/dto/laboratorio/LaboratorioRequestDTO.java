package com.sg.farmacia.dto.laboratorio;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaboratorioRequestDTO {

    @NotBlank(message = "El nombre del laboratorio es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre debe tener entre 2 y 100 caracteres")
    private String nombre;

    @Size(max = 50, message = "El país de origen no puede exceder los 50 caracteres")
    private String paisOrigen;

    @Builder.Default
    private Boolean activo = true;
}
