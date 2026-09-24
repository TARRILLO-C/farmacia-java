package com.sg.farmacia.dto.proveedor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorRequestDTO {

    @NotBlank(message = "El RUC del proveedor es obligatorio")
    @Size(min = 8, max = 20, message = "El RUC debe tener entre 8 y 20 caracteres")
    private String ruc;

    @NotBlank(message = "La razón social es obligatoria")
    @Size(min = 2, max = 150, message = "La razón social debe tener entre 2 y 150 caracteres")
    private String razonSocial;

    @Size(max = 150, message = "El contacto no puede exceder 150 caracteres")
    private String contacto;

    @Size(max = 25, message = "El teléfono no puede exceder 25 caracteres")
    private String telefono;

    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String email;

    @Builder.Default
    private Boolean activo = true;
}
