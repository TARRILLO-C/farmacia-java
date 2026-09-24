package com.sg.farmacia.dto.metodopago;

import com.sg.farmacia.model.MetodoPago;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoRequestDTO {

    @NotBlank(message = "El nombre del método de pago es obligatorio")
    @Size(min = 2, max = 50, message = "El nombre debe tener entre 2 y 50 caracteres")
    private String nombre;

    @Builder.Default
    private Boolean activo = true;
}
