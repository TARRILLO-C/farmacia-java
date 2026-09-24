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
    private String numeroVenta;
    private LocalDateTime fecha;
    private LocalDateTime fechaVenta; // Alias
    private Double subtotal;
    private Double impuesto;
    private Double igv; // Alias
    private Double descuentoTotal;
    private Double total;
    private boolean requiereReceta;
    private Long clienteId;
    private String clienteNombre;
    private String clienteDocumento;
    private boolean esClienteAmigo;
    private Long usuarioId;
    private String usuarioNombre;
    private Long reciboId;
    private String numeroRecibo;
    private String codigoComprobante; // Alias
    private Long metodoPagoId;
    private String metodoPago;
    private String tipoComprobante;
    private String estado;
    private String observaciones;
    private List<DetalleVentaResponseDTO> detalles;
}
