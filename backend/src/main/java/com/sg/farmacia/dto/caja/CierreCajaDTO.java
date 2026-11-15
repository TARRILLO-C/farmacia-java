package com.sg.farmacia.dto.caja;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CierreCajaDTO {

    @NotNull(message = "El monto real en efectivo al cierre es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El monto de cierre no puede ser negativo")
    private Double montoCierre;

    private Long usuarioId;

    private String observaciones;
}
