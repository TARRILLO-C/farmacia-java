package com.sg.farmacia.dto.caja;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoCajaRequestDTO {

    @NotBlank(message = "El tipo de movimiento es obligatorio (INGRESO o EGRESO)")
    private String tipo; // INGRESO, EGRESO

    @NotBlank(message = "El concepto o motivo del movimiento es obligatorio")
    private String concepto;

    @NotNull(message = "El monto es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser mayor a cero")
    private Double monto;

    @Builder.Default
    private String metodoPago = "EFECTIVO";

    private Long usuarioId;

    private Long referenciaId;
}

