package com.sg.farmacia.model;

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
        @Index(name = "idx_venta_fecha", columnList = "fecha_venta"),
        @Index(name = "idx_venta_cliente", columnList = "cliente_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Venta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_venta", nullable = false)
    @Builder.Default
    private LocalDateTime fechaVenta = LocalDateTime.now();

    @Column(nullable = false)
    private Double subtotal;

    @Column(nullable = false)
    private Double igv;

    @Column(name = "descuento_total", nullable = false)
    @Builder.Default
    private Double descuentoTotal = 0.0;

    @Column(nullable = false)
    private Double total;

    @Column(name = "requiere_receta", nullable = false)
    @Builder.Default
    private boolean requiereReceta = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = true)
    private Cliente cliente;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleVenta> detalles = new ArrayList<>();

    @OneToOne(mappedBy = "venta", cascade = CascadeType.ALL, orphanRemoval = true)
    private Recibo recibo;

    @PrePersist
    public void prePersist() {
        if (this.fechaVenta == null) {
            this.fechaVenta = LocalDateTime.now();
        }
        if (this.descuentoTotal == null) {
            this.descuentoTotal = 0.0;
        }
    }

    public void addDetalle(DetalleVenta detalle) {
        if (this.detalles == null) {
            this.detalles = new ArrayList<>();
        }
        this.detalles.add(detalle);
        detalle.setVenta(this);
    }
}
