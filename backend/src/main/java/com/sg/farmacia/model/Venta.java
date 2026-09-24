package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"detalles", "recibo"})
@EqualsAndHashCode(exclude = {"detalles", "recibo"})
@Entity
@Table(name = "ventas", indexes = {
        @Index(name = "idx_venta_numero", columnList = "numero_venta", unique = true),
        @Index(name = "idx_venta_fecha", columnList = "fecha"),
        @Index(name = "idx_venta_cliente", columnList = "cliente_id"),
        @Index(name = "idx_venta_usuario", columnList = "usuario_id"),
        @Index(name = "idx_venta_metodo_pago", columnList = "metodo_pago_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_venta", nullable = false, unique = true, length = 30)
    private String numeroVenta;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, precision = 10, scale = 2)
    private Double subtotal;

    @Builder.Default
    @Column(name = "descuento_total", nullable = false, precision = 10, scale = 2)
    private Double descuentoTotal = 0.00;

    @Column(nullable = false, precision = 10, scale = 2)
    private Double impuesto;

    @Column(nullable = false, precision = 10, scale = 2)
    private Double total;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "metodo_pago_id", nullable = false)
    private MetodoPago metodoPago;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String estado = "COMPLETADA";

    @Column(length = 255)
    private String observaciones;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleVenta> detalles = new ArrayList<>();

    @OneToOne(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private Recibo recibo;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.descuentoTotal == null) {
            this.descuentoTotal = 0.00;
        }
        if (this.estado == null) {
            this.estado = "COMPLETADA";
        }
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

    public void addDetalle(DetalleVenta detalle) {
        if (this.detalles == null) {
            this.detalles = new ArrayList<>();
        }
        this.detalles.add(detalle);
        detalle.setVenta(this);
    }

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js y DTOs anteriores
    // =========================================================================

    @JsonGetter("fechaVenta")
    public LocalDateTime getFechaVenta() {
        return this.fecha;
    }

    public void setFechaVenta(LocalDateTime fecha) {
        this.fecha = fecha;
    }

    @JsonGetter("igv")
    public Double getIgv() {
        return this.impuesto;
    }

    public void setIgv(Double igv) {
        this.impuesto = igv;
    }

    @JsonGetter("metodoPagoNombre")
    public String getMetodoPagoNombre() {
        return this.metodoPago != null ? this.metodoPago.getNombre() : "EFECTIVO";
    }

    @JsonGetter("tipoComprobante")
    public String getTipoComprobante() {
        return (this.recibo != null && this.recibo.getTipoComprobante() != null)
                ? this.recibo.getTipoComprobante()
                : "BOLETA";
    }

    public boolean isRequiereReceta() {
        if (this.detalles == null) return false;
        return this.detalles.stream()
                .anyMatch(d -> d.getLote() != null && d.getLote().getProducto() != null &&
                        Boolean.TRUE.equals(d.getLote().getProducto().getRequiereReceta()));
    }
}
