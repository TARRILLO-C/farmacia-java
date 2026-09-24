package com.sg.farmacia.dto.compra;

import com.sg.farmacia.model.Compra;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompraResponseDTO {

    private Long id;
    private Long proveedorId;
    private String proveedorRazonSocial;
    private String proveedorRuc;
    private Long usuarioId;
    private String usuarioNombre;
    private String numeroFactura;
    private LocalDateTime fechaCompra;
    private Double total;
    private String estado;
    private LocalDateTime createdAt;
    private List<DetalleCompraResponseDTO> detalles;

    public static CompraResponseDTO fromEntity(Compra c) {
        if (c == null) return null;
        List<DetalleCompraResponseDTO> dets = c.getDetalles() != null
                ? c.getDetalles().stream().map(DetalleCompraResponseDTO::fromEntity).collect(Collectors.toList())
                : new ArrayList<>();

        return CompraResponseDTO.builder()
                .id(c.getId())
                .proveedorId(c.getProveedor() != null ? c.getProveedor().getId() : null)
                .proveedorRazonSocial(c.getProveedor() != null ? c.getProveedor().getRazonSocial() : null)
                .proveedorRuc(c.getProveedor() != null ? c.getProveedor().getRuc() : null)
                .usuarioId(c.getUsuario() != null ? c.getUsuario().getId() : null)
                .usuarioNombre(c.getUsuario() != null ? c.getUsuario().getNombre() : null)
                .numeroFactura(c.getNumeroFactura())
                .fechaCompra(c.getFechaCompra())
                .total(c.getTotal())
                .estado(c.getEstado())
                .createdAt(c.getCreatedAt())
                .detalles(dets)
                .build();
    }
}
