package com.sg.farmacia.dto.venta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VentaResponseDTO {

    private Long id;
    private LocalDateTime fechaVenta;
    private Double subtotal;
    private Double igv;
    private Double descuentoTotal;
    private Double total;
    private boolean requiereReceta;
    private Long clienteId;
    private String clienteNombre;
    private String clienteDocumento;
    private boolean esClienteAmigo;
    private List<DetalleVentaResponseDTO> detalles;
}
