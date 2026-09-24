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
    private Long loteId;
    private String codigoLote;
    private Integer cantidad;
    private Double precioUnitario;
    private Double descuento;
    private Double subtotalItem;
    private Double subtotal;
}
