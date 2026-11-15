package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movimientos_caja", indexes = {
        @Index(name = "idx_mov_caja_id", columnList = "caja_id"),
        @Index(name = "idx_mov_fecha", columnList = "fecha")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class MovimientoCaja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_id", nullable = false)
    @ToString.Exclude
    @JsonIgnoreProperties("movimientos")
    private Caja caja;

    @Column(nullable = false, length = 20)
    private String tipo; // INGRESO, EGRESO, VENTA

    @Column(nullable = false, length = 200)
    private String concepto;

    @Column(nullable = false)
    private Double monto;

    @Builder.Default
    @Column(name = "metodo_pago", length = 50)
    private String metodoPago = "EFECTIVO"; // EFECTIVO, TARJETA, YAPE, PLIN

    @Column(nullable = false)
    private LocalDateTime fecha;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "referencia_id")
    private Long referenciaId; // ID de la Venta u otra transacción asociada

    @PrePersist
    public void prePersist() {
        if (this.fecha == null) {
            this.fecha = LocalDateTime.now();
        }
        if (this.metodoPago == null) {
            this.metodoPago = "EFECTIVO";
        }
    }
}
