package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "producto")
@EqualsAndHashCode(exclude = "producto")
@Entity
@Table(name = "lotes_inventario", indexes = {
        @Index(name = "idx_lote_producto", columnList = "producto_id"),
        @Index(name = "idx_lote_vencimiento", columnList = "fecha_vencimiento")
}, uniqueConstraints = {
        @UniqueConstraint(name = "uk_producto_lote", columnNames = {"producto_id", "codigo_lote"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class LoteInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "codigo_lote", nullable = false, length = 50)
    private String codigoLote;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Builder.Default
    @Column(name = "stock_actual", nullable = false)
    private Integer stockActual = 0;

    @Builder.Default
    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo = 5;

    @Builder.Default
    @Column(name = "precio_compra", nullable = false, precision = 10, scale = 2)
    private Double precioCompra = 0.00;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

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

    @JsonGetter("productoId")
    public Long getProductoId() {
        return this.producto != null ? this.producto.getId() : null;
    }

    @JsonGetter("productoNombre")
    public String getProductoNombre() {
        return this.producto != null ? this.producto.getNombre() : null;
    }
}
