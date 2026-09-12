package com.sg.farmacia.dto.producto;

import com.sg.farmacia.dto.categoria.CategoriaResponseDTO;
import com.sg.farmacia.model.Producto;
import com.fasterxml.jackson.annotation.JsonFormat;
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
    private String codigoBarras;
    private String codigo; // Alias para compatibilidad con Frontend Next.js
    private String nombre;
    private String descripcion;
    private String principioActivo;
    private String presentacion;
    private String laboratorio;
    private String lote;
    private Double precioCompra;
    private Double precioVenta;
    private Double precio; // Alias para compatibilidad con Frontend Next.js
    private Integer stock;
    private Integer stockMinimo;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaCaducidad;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaVencimiento; // Alias para compatibilidad con Frontend Next.js

    private Boolean requiereReceta;
    private Boolean activo;

    // Conexión con Categoría
    private Long categoriaId;
    private String categoriaNombre;
    private CategoriaResponseDTO categoria;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductoResponseDTO fromEntity(Producto producto) {
        if (producto == null) return null;

        Long catId = producto.getCategoria() != null ? producto.getCategoria().getId() : null;
        String catNombre = producto.getCategoria() != null ? producto.getCategoria().getNombre() : null;
        CategoriaResponseDTO catDto = producto.getCategoria() != null ? CategoriaResponseDTO.fromEntity(producto.getCategoria()) : null;

        return ProductoResponseDTO.builder()
                .id(producto.getId())
                .codigoBarras(producto.getCodigoBarras())
                .codigo(producto.getCodigoBarras())
                .nombre(producto.getNombre())
                .descripcion(producto.getDescripcion())
                .principioActivo(producto.getPrincipioActivo())
                .presentacion(producto.getPresentacion())
                .laboratorio(producto.getLaboratorio())
                .lote(producto.getLote())
                .precioCompra(producto.getPrecioCompra())
                .precioVenta(producto.getPrecioVenta())
                .precio(producto.getPrecioVenta())
                .stock(producto.getStock())
                .stockMinimo(producto.getStockMinimo())
                .fechaCaducidad(producto.getFechaCaducidad())
                .fechaVencimiento(producto.getFechaCaducidad())
                .requiereReceta(producto.getRequiereReceta())
                .activo(producto.getActivo())
                .categoriaId(catId)
                .categoriaNombre(catNombre)
                .categoria(catDto)
                .createdAt(producto.getCreatedAt())
                .updatedAt(producto.getUpdatedAt())
                .build();
    }
}
