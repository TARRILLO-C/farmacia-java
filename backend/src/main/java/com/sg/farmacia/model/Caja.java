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
@Entity
@Table(name = "cajas", indexes = {
        @Index(name = "idx_caja_estado", columnList = "estado"),
        @Index(name = "idx_caja_fecha_apertura", columnList = "fecha_apertura")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Caja {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha_apertura", nullable = false)
    private LocalDateTime fechaApertura;

    @Column(name = "fecha_cierre")
    private LocalDateTime fechaCierre;

    @Builder.Default
    @Column(name = "monto_inicial", nullable = false)
    private Double montoInicial = 0.0;

    @Column(name = "monto_cierre")
    private Double montoCierre;

    @Builder.Default
    @Column(name = "total_ventas_efectivo")
    private Double totalVentasEfectivo = 0.0;

    @Builder.Default
    @Column(name = "total_ventas_tarjeta")
    private Double totalVentasTarjeta = 0.0;

    @Builder.Default
    @Column(name = "total_ventas_digital")
    private Double totalVentasDigital = 0.0;

    @Builder.Default
    @Column(name = "total_ingresos_manuales")
    private Double totalIngresosManuales = 0.0;

    @Builder.Default
    @Column(name = "total_egresos_manuales")
    private Double totalEgresosManuales = 0.0;

    @Builder.Default
    @Column(name = "saldo_esperado_efectivo")
    private Double saldoEsperadoEfectivo = 0.0;

    @Builder.Default
    @Column(name = "diferencia")
    private Double diferencia = 0.0;

    @Builder.Default
    @Column(nullable = false, length = 20)
    private String estado = "ABIERTA"; // ABIERTA, CERRADA

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_apertura_id", nullable = false)
    private Usuario usuarioApertura;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_cierre_id")
    private Usuario usuarioCierre;

    @Column(name = "observaciones_apertura", length = 500)
    private String observacionesApertura;

    @Column(name = "observaciones_cierre", length = 500)
    private String observacionesCierre;

    @Builder.Default
    @OneToMany(mappedBy = "caja", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @JsonIgnoreProperties("caja")
    private List<MovimientoCaja> movimientos = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.fechaApertura == null) {
            this.fechaApertura = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "ABIERTA";
        }
        if (this.saldoEsperadoEfectivo == null || this.saldoEsperadoEfectivo == 0.0) {
            this.saldoEsperadoEfectivo = this.montoInicial != null ? this.montoInicial : 0.0;
        }
    }
}
