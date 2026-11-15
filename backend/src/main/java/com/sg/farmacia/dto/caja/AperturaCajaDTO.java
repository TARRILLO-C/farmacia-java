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
public class AperturaCajaDTO {

    @NotNull(message = "El monto inicial de apertura es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El monto inicial no puede ser negativo")
    private Double montoInicial;

    private Long usuarioId;

    private String observaciones;
}
