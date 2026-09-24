package com.sg.farmacia.dto.producto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.sg.farmacia.dto.categoria.CategoriaResponseDTO;
import com.sg.farmacia.model.Producto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponseDTO {

    private Long id;
    private String codigo;
    private String codigoBarras; // Alias compatibilidad
    private String nombre;
    private String descripcion;
    private Double precioBaseVenta;
    private Double precioVenta; // Alias
    private Double precio; // Alias frontend Next.js
    private Boolean requiereReceta;
    private Boolean activo;

    // Relaciones
    private Long categoriaId;
    private String categoriaNombre;
    private CategoriaResponseDTO categoria;

    private Long laboratorioId;
    private String laboratorioNombre;
    private String laboratorio; // Alias

    private Long principioActivoId;
    private String principioActivoNombre;
    private String principioActivo; // Alias

    private Long presentacionId;
    private String presentacionNombre;
    private String presentacion; // Alias

    // Información calculada de inventario (Lotes)
    private Integer stock;
    private Integer stockMinimo;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaCaducidad;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaVencimiento; // Alias

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductoResponseDTO fromEntity(Producto producto) {
        if (producto == null) return null;

        Long catId = producto.getCategoria() != null ? producto.getCategoria().getId() : null;
        String catNombre = producto.getCategoria() != null ? producto.getCategoria().getNombre() : null;
        CategoriaResponseDTO catDto = producto.getCategoria() != null ? CategoriaResponseDTO.fromEntity(producto.getCategoria()) : null;

        Long labId = producto.getLaboratorio() != null ? producto.getLaboratorio().getId() : null;
        String labNombre = producto.getLaboratorio() != null ? producto.getLaboratorio().getNombre() : null;

        Long paId = producto.getPrincipioActivo() != null ? producto.getPrincipioActivo().getId() : null;
        String paNombre = producto.getPrincipioActivo() != null ? producto.getPrincipioActivo().getNombre() : null;

        Long presId = producto.getPresentacion() != null ? producto.getPresentacion().getId() : null;
        String presNombre = producto.getPresentacion() != null ? producto.getPresentacion().getNombre() : null;

        return ProductoResponseDTO.builder()
                .id(producto.getId())
                .codigo(producto.getCodigo())
                .codigoBarras(producto.getCodigo())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .precioBaseVenta(producto.getPrecioBaseVenta())
                .precioVenta(producto.getPrecioBaseVenta())
                .precio(producto.getPrecioBaseVenta())
                .requiereReceta(producto.getRequiereReceta())
                .activo(producto.getActivo())
                .categoriaId(catId)
                .categoriaNombre(catNombre)
                .categoria(catDto)
                .laboratorioId(labId)
                .laboratorioNombre(labNombre)
                .laboratorio(labNombre)
                .principioActivoId(paId)
                .principioActivoNombre(paNombre)
                .principioActivo(paNombre)
                .presentacionId(presId)
                .presentacionNombre(presNombre)
                .presentacion(presNombre)
                .stock(producto.getStock())
                .stockMinimo(producto.getStockMinimo())
                .fechaCaducidad(producto.getFechaCaducidad())
                .fechaVencimiento(producto.getFechaCaducidad())
                .createdAt(producto.getCreatedAt())
                .updatedAt(producto.getUpdatedAt())
                .build();
    }
}
