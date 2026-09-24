package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "lotes")
@EqualsAndHashCode(exclude = "lotes")
@Entity
@Table(name = "productos", indexes = {
        @Index(name = "idx_producto_codigo", columnList = "codigo", unique = true),
        @Index(name = "idx_producto_nombre", columnList = "nombre"),
        @Index(name = "idx_producto_categoria", columnList = "categoria_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "precio_base_venta", nullable = false)
    private Double precioBaseVenta;

    @Builder.Default
    @Column(name = "requiere_receta", nullable = false)
    private Boolean requiereReceta = false;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laboratorio_id")
    private Laboratorio laboratorio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "principio_activo_id")
    private PrincipioActivo principioActivo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "presentacion_id")
    private Presentacion presentacion;

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    @JsonIgnore
    private List<LoteInventario> lotes = new ArrayList<>();

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js y DTOs anteriores
    // =========================================================================

    @JsonGetter("codigoBarras")
    public String getCodigoBarras() {
        return this.codigo;
    }

    @JsonSetter("codigoBarras")
    public void setCodigoBarras(String codigoBarras) {
        if (this.codigo == null || this.codigo.isEmpty()) {
            this.codigo = codigoBarras;
        }
    }

    @JsonGetter("precioVenta")
    public Double getPrecioVenta() {
        return this.precioBaseVenta;
    }

    @JsonSetter("precioVenta")
    public void setPrecioVenta(Double precioVenta) {
        if (this.precioBaseVenta == null) {
            this.precioBaseVenta = precioVenta;
        }
    }

    @JsonGetter("precio")
    public Double getPrecio() {
        return this.precioBaseVenta;
    }

    @JsonSetter("precio")
    public void setPrecio(Double precio) {
        if (this.precioBaseVenta == null) {
            this.precioBaseVenta = precio;
        }
    }

    @JsonGetter("stock")
    public Integer getStock() {
        if (this.lotes == null || this.lotes.isEmpty()) {
            return 0;
        }
        return this.lotes.stream()
                .filter(l -> Boolean.TRUE.equals(l.getActivo()))
                .mapToInt(l -> l.getStockActual() != null ? l.getStockActual() : 0)
                .sum();
    }

    @JsonGetter("stockMinimo")
    public Integer getStockMinimo() {
        if (this.lotes == null || this.lotes.isEmpty()) {
            return 5;
        }
        return this.lotes.stream()
                .filter(l -> Boolean.TRUE.equals(l.getActivo()))
                .mapToInt(l -> l.getStockMinimo() != null ? l.getStockMinimo() : 5)
                .min()
                .orElse(5);
    }

    @JsonGetter("fechaCaducidad")
    public LocalDate getFechaCaducidad() {
        if (this.lotes == null || this.lotes.isEmpty()) {
            return null;
        }
        return this.lotes.stream()
                .filter(l -> Boolean.TRUE.equals(l.getActivo()) && l.getFechaVencimiento() != null)
                .map(LoteInventario::getFechaVencimiento)
                .min(LocalDate::compareTo)
                .orElse(null);
    }

    @JsonGetter("fechaVencimiento")
    public LocalDate getFechaVencimiento() {
        return getFechaCaducidad();
    }

    @JsonGetter("categoriaId")
    public Long getCategoriaId() {
        return this.categoria != null ? this.categoria.getId() : null;
    }

    @JsonGetter("laboratorioId")
    public Long getLaboratorioId() {
        return this.laboratorio != null ? this.laboratorio.getId() : null;
    }

    @JsonGetter("principioActivoId")
    public Long getPrincipioActivoId() {
        return this.principioActivo != null ? this.principioActivo.getId() : null;
    }

    @JsonGetter("presentacionId")
    public Long getPresentacionId() {
        return this.presentacion != null ? this.presentacion.getId() : null;
    }

    @JsonGetter("laboratorioNombre")
    public String getLaboratorioNombre() {
        return this.laboratorio != null ? this.laboratorio.getNombre() : null;
    }

    @JsonGetter("principioActivoNombre")
    public String getPrincipioActivoNombre() {
        return this.principioActivo != null ? this.principioActivo.getNombre() : null;
    }

    @JsonGetter("presentacionNombre")
    public String getPresentacionNombre() {
        return this.presentacion != null ? this.presentacion.getNombre() : null;
    }
}
