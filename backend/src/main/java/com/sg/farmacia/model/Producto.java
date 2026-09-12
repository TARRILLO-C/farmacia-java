package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
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
@Entity
@Table(name = "productos", indexes = {
        @Index(name = "idx_producto_codigo_barras", columnList = "codigo_barras", unique = true),
        @Index(name = "idx_producto_nombre", columnList = "nombre"),
        @Index(name = "idx_producto_categoria", columnList = "categoria_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_barras", nullable = false, unique = true, length = 100)
    private String codigoBarras;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(name = "principio_activo", length = 150)
    private String principioActivo;

    @Column(length = 100)
    private String presentacion;

    @Column(length = 100)
    private String laboratorio;

    @Column(length = 50)
    private String lote;

    @Column(name = "precio_compra")
    private Double precioCompra;

    @Column(name = "precio_venta", nullable = false)
    private Double precioVenta;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    @Column(name = "stock_minimo", nullable = false)
    @Builder.Default
    private Integer stockMinimo = 10;

    @Column(name = "fecha_caducidad")
    private LocalDate fechaCaducidad;

    @Column(name = "requiere_receta", nullable = false)
    @Builder.Default
    private Boolean requiereReceta = false;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js (codigo, precio, fechaVencimiento)
    // =========================================================================

    @JsonGetter("codigo")
    public String getCodigo() {
        return this.codigoBarras;
    }

    @JsonSetter("codigo")
    public void setCodigo(String codigo) {
        if (this.codigoBarras == null || this.codigoBarras.isEmpty()) {
            this.codigoBarras = codigo;
        }
    }

    @JsonGetter("precio")
    public Double getPrecio() {
        return this.precioVenta;
    }

    @JsonSetter("precio")
    public void setPrecio(Double precio) {
        if (this.precioVenta == null) {
            this.precioVenta = precio;
        }
    }

    @JsonGetter("fechaVencimiento")
    public LocalDate getFechaVencimiento() {
        return this.fechaCaducidad;
    }

    @JsonSetter("fechaVencimiento")
    public void setFechaVencimiento(LocalDate fechaVencimiento) {
        if (this.fechaCaducidad == null) {
            this.fechaCaducidad = fechaVencimiento;
        }
    }

    @JsonGetter("categoriaId")
    public Long getCategoriaId() {
        return this.categoria != null ? this.categoria.getId() : null;
    }
}
