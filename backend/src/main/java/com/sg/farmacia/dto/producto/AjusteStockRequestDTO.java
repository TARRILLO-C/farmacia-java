package com.sg.farmacia.dto.producto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AjusteStockRequestDTO {

    @NotNull(message = "La cantidad para el ajuste de stock es obligatoria")
    private Integer cantidad;

    /**
     * Tipo de movimiento:
     * - "ENTRADA" o "INCREMENTO": suma la cantidad al stock actual.
     * - "SALIDA" o "DECREMENTO": resta la cantidad del stock actual.
     * - "AJUSTE" o "FIJAR": establece el stock exactamente al valor de cantidad.
     * Si no se especifica tipo: si cantidad > 0 suma, si cantidad < 0 resta.
     */
    private String tipo;

    /**
     * Motivo del ajuste (ej. "Recepción de proveedor", "Merma/Daño", "Corrección de inventario").
     */
    private String motivo;
}
