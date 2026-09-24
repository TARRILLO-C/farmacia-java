package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "venta")
@EqualsAndHashCode(exclude = "venta")
@Entity
@Table(name = "detalle_ventas", indexes = {
        @Index(name = "idx_detalle_venta", columnList = "venta_id"),
        @Index(name = "idx_detalle_lote", columnList = "lote_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DetalleVenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false)
    @JsonIgnore
    private Venta venta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id", nullable = false)
    private LoteInventario lote;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false, precision = 10, scale = 2)
    private Double precioUnitario;

    @Builder.Default
    @Column(nullable = false, precision = 10, scale = 2)
    private Double descuento = 0.00;

    @Column(nullable = false, precision = 10, scale = 2)
    private Double subtotal;

    // =========================================================================
    // Getters de compatibilidad con Frontend y DTOs anteriores
    // =========================================================================

    @JsonGetter("producto")
    public Producto getProducto() {
        return this.lote != null ? this.lote.getProducto() : null;
    }

    @JsonGetter("subtotalItem")
    public Double getSubtotalItem() {
        return this.subtotal;
    }

    public void setSubtotalItem(Double subtotalItem) {
        this.subtotal = subtotalItem;
    }

    @JsonGetter("loteId")
    public Long getLoteId() {
        return this.lote != null ? this.lote.getId() : null;
    }

    @JsonGetter("codigoLote")
    public String getCodigoLote() {
        return this.lote != null ? this.lote.getCodigoLote() : null;
    }
}
