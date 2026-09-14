package com.sg.farmacia.dto.venta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleVentaResponseDTO {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private String codigoBarras;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotalItem;
}
