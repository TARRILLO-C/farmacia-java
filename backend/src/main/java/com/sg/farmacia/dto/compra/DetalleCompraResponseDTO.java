package com.sg.farmacia.dto.compra;

import com.sg.farmacia.model.DetalleCompra;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetalleCompraResponseDTO {

    private Long id;
    private Long productoId;
    private String productoCodigo;
    private String productoNombre;
    private String loteAsignado;
    private LocalDate fechaVencimiento;
    private Integer cantidad;
    private Double precioUnitario;
    private Double subtotal;

    public static DetalleCompraResponseDTO fromEntity(DetalleCompra d) {
        if (d == null) return null;
        return DetalleCompraResponseDTO.builder()
                .id(d.getId())
                .productoId(d.getProducto() != null ? d.getProducto().getId() : null)
                .productoCodigo(d.getProducto() != null ? d.getProducto().getCodigo() : null)
                .productoNombre(d.getProducto() != null ? d.getProducto().getNombre() : null)
                .loteAsignado(d.getLoteAsignado())
                .fechaVencimiento(d.getFechaVencimiento())
                .cantidad(d.getCantidad())
                .precioUnitario(d.getPrecioUnitario())
                .subtotal(d.getSubtotal())
                .build();
    }
}
