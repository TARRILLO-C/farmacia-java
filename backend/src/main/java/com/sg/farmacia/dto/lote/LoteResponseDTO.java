package com.sg.farmacia.dto.lote;

import com.sg.farmacia.model.LoteInventario;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoteResponseDTO {

    private Long id;
    private Long productoId;
    private String productoCodigo;
    private String productoNombre;
    private String codigoLote;
    private LocalDate fechaVencimiento;
    private Integer stockActual;
    private Integer stockMinimo;
    private Double precioCompra;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static LoteResponseDTO fromEntity(LoteInventario lote) {
        if (lote == null) return null;
        return LoteResponseDTO.builder()
                .id(lote.getId())
                .productoId(lote.getProducto() != null ? lote.getProducto().getId() : null)
                .productoCodigo(lote.getProducto() != null ? lote.getProducto().getCodigo() : null)
                .productoNombre(lote.getProducto() != null ? lote.getProducto().getNombre() : null)
                .codigoLote(lote.getCodigoLote())
                .fechaVencimiento(lote.getFechaVencimiento())
                .stockActual(lote.getStockActual())
                .stockMinimo(lote.getStockMinimo())
                .precioCompra(lote.getPrecioCompra())
                .activo(lote.getActivo())
                .createdAt(lote.getCreatedAt())
                .updatedAt(lote.getUpdatedAt())
                .build();
    }
}
