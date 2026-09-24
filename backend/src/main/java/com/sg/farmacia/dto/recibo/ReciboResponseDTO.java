package com.sg.farmacia.dto.recibo;

import com.sg.farmacia.dto.venta.DetalleVentaResponseDTO;
import com.sg.farmacia.model.Recibo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReciboResponseDTO {

    private Long id;
    private String numeroRecibo;
    private String codigoComprobante; // Alias
    private String serie;
    private String correlativo;
    private String tipoComprobante;
    private LocalDateTime fechaEmision;

    // Datos Financieros
    private Double montoSubtotal;
    private Double subtotal; // Alias
    private Double montoImpuesto;
    private Double igv; // Alias
    private Double montoDescuento;
    private Double descuentoTotal; // Alias
    private Double montoTotal;
    private Double totalPagado; // Alias
    private String metodoPago;

    // Datos de la Venta
    private Long ventaId;
    private String numeroVenta;
    private boolean requiereReceta;

    // Datos del Cliente
    private Long clienteId;
    private String clienteNombre;
    private String clienteDocumento;
    private String clienteDniRuc; // Alias
    private String clienteDireccion;
    private boolean esClienteAmigo;
    private Integer puntosAcumulados;

    // Detalle de Items
    private List<DetalleVentaResponseDTO> items;

    // Metadatos para impresión de Ticket en POS
    @Builder.Default
    private String nombreEstablecimiento = "SGF FARMACIA CENTRAL";

    @Builder.Default
    private String rucEstablecimiento = "20608912345";

    @Builder.Default
    private String direccionEstablecimiento = "Av. José Balta 550, Chiclayo - Perú";

    @Builder.Default
    private String telefonoEstablecimiento = "(074) 234-567";

    @Builder.Default
    private String mensajePie = "¡Gracias por su compra! Cuide su salud y la de su familia.";

    public static ReciboResponseDTO fromEntity(Recibo r) {
        if (r == null) return null;
        List<DetalleVentaResponseDTO> items = (r.getVenta() != null && r.getVenta().getDetalles() != null)
                ? r.getVenta().getDetalles().stream().map(d -> DetalleVentaResponseDTO.builder()
                        .id(d.getId())
                        .productoId(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getId() : null)
                        .productoNombre(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getNombre() : "")
                        .codigoBarras(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getCodigo() : "")
                        .loteId(d.getLote() != null ? d.getLote().getId() : null)
                        .codigoLote(d.getLote() != null ? d.getLote().getCodigoLote() : "")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .descuento(d.getDescuento())
                        .subtotalItem(d.getSubtotal())
                        .subtotal(d.getSubtotal())
                        .build()).collect(Collectors.toList())
                : new ArrayList<>();

        boolean esAmigo = r.getVenta() != null && r.getVenta().getCliente() != null && r.getVenta().getCliente().isEsClienteAmigo();
        Integer puntos = (r.getVenta() != null && r.getVenta().getCliente() != null) ? r.getVenta().getCliente().getPuntosFidelidad() : 0;

        return ReciboResponseDTO.builder()
                .id(r.getId())
                .numeroRecibo(r.getNumeroRecibo())
                .codigoComprobante(r.getNumeroRecibo())
                .serie(r.getSerie())
                .correlativo(r.getCorrelativo())
                .tipoComprobante(r.getTipoComprobante())
                .fechaEmision(r.getFechaEmision())
                .montoSubtotal(r.getMontoSubtotal())
                .subtotal(r.getMontoSubtotal())
                .montoImpuesto(r.getMontoImpuesto())
                .igv(r.getMontoImpuesto())
                .montoDescuento(r.getMontoDescuento())
                .descuentoTotal(r.getMontoDescuento())
                .montoTotal(r.getMontoTotal())
                .totalPagado(r.getMontoTotal())
                .metodoPago(r.getMetodoPago())
                .ventaId(r.getVenta() != null ? r.getVenta().getId() : null)
                .numeroVenta(r.getVenta() != null ? r.getVenta().getNumeroVenta() : null)
                .requiereReceta(r.getVenta() != null && r.getVenta().isRequiereReceta())
                .clienteId(r.getVenta() != null && r.getVenta().getCliente() != null ? r.getVenta().getCliente().getId() : null)
                .clienteNombre(r.getClienteNombre())
                .clienteDocumento(r.getClienteDocumento())
                .clienteDniRuc(r.getClienteDocumento())
                .clienteDireccion(r.getClienteDireccion())
                .esClienteAmigo(esAmigo)
                .puntosAcumulados(puntos)
                .items(items)
                .build();
    }
}
