package com.sg.farmacia.dto.fidelizacion;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FidelizacionRequestDTO {

    @NotNull(message = "El ID del cliente es obligatorio")
    private Long clienteId;

    @Builder.Default
    private String estadoMembresia = "ACTIVO";

    private String codigoAfiliado;

    @PositiveOrZero(message = "El porcentaje de descuento no puede ser negativo")
    @Builder.Default
    private Double porcentajeDescuento = 0.0;

    @PositiveOrZero(message = "Los puntos no pueden ser negativos")
    @Builder.Default
    private Integer puntosAcumulados = 0;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaAfiliacion;
}
