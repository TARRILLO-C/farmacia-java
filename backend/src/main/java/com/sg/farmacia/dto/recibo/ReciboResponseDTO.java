package com.sg.farmacia.dto.recibo;

import com.sg.farmacia.dto.venta.DetalleVentaResponseDTO;
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
public class ReciboResponseDTO {

    private Long id;
    private String codigoComprobante;
    private LocalDateTime fechaEmision;

    // Datos de la Venta
    private Long ventaId;
    private Double subtotal;
    private Double descuentoTotal;
    private Double igv;
    private Double totalPagado;
    private boolean requiereReceta;

    // Datos del Cliente
    private Long clienteId;
    private String clienteNombre;
    private String clienteDniRuc;
    private String clienteDireccion;
    private boolean esClienteAmigo;
    private Integer puntosAcumulados;

    // Detalle de Items
    private List<DetalleVentaResponseDTO> items;

    // Metadatos para impresión de Ticket en Next.js POS
    @Builder.Default
    private String nombreEstablecimiento = "FARMACIA SAN GABRIEL";

    @Builder.Default
    private String rucEstablecimiento = "20608912345";

    @Builder.Default
    private String direccionEstablecimiento = "Av. Universitaria 1234, Lima - Perú";

    @Builder.Default
    private String telefonoEstablecimiento = "(01) 719-8000";

    @Builder.Default
    private String mensajePie = "¡Gracias por su compra! Cuide su salud y la de su familia.";
}
