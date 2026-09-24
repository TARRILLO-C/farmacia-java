package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "venta")
@EqualsAndHashCode(exclude = "venta")
@Entity
@Table(name = "recibos", indexes = {
        @Index(name = "idx_recibo_numero", columnList = "numero_recibo", unique = true),
        @Index(name = "idx_recibo_venta", columnList = "venta_id", unique = true)
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Recibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_recibo", nullable = false, unique = true, length = 30)
    private String numeroRecibo;

    @Column(nullable = false, length = 10)
    private String serie;

    @Column(nullable = false, length = 15)
    private String correlativo;

    @Column(name = "tipo_comprobante", nullable = false, length = 20)
    private String tipoComprobante;

    @Builder.Default
    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @Column(name = "monto_subtotal", nullable = false)
    private Double montoSubtotal;

    @Column(name = "monto_impuesto", nullable = false)
    private Double montoImpuesto;

    @Builder.Default
    @Column(name = "monto_descuento", nullable = false)
    private Double montoDescuento = 0.00;

    @Column(name = "monto_total", nullable = false)
    private Double montoTotal;

    @Column(name = "metodo_pago", nullable = false, length = 50)
    private String metodoPago;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false, unique = true)
    @JsonIgnore
    private Venta venta;

    @Column(name = "cliente_nombre", nullable = false, length = 150)
    private String clienteNombre;

    @Column(name = "cliente_documento", nullable = false, length = 20)
    private String clienteDocumento;

    @Column(name = "cliente_direccion", length = 255)
    private String clienteDireccion;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.fechaEmision == null) {
            this.fechaEmision = LocalDateTime.now();
        }
        if (this.montoDescuento == null) {
            this.montoDescuento = 0.00;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js y DTOs anteriores
    // =========================================================================

    @JsonGetter("codigoComprobante")
    public String getCodigoComprobante() {
        return this.numeroRecibo;
    }

    public void setCodigoComprobante(String codigoComprobante) {
        this.numeroRecibo = codigoComprobante;
    }

    @JsonGetter("totalPagado")
    public Double getTotalPagado() {
        return this.montoTotal;
    }

    public void setTotalPagado(Double totalPagado) {
        this.montoTotal = totalPagado;
    }

    @JsonGetter("ventaId")
    public Long getVentaId() {
        return this.venta != null ? this.venta.getId() : null;
    }
}
