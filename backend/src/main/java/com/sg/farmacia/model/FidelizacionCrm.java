package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "cliente")
@EqualsAndHashCode(exclude = "cliente")
@Entity
@Table(name = "fidelizacion_crm", indexes = {
        @Index(name = "idx_fidelizacion_cliente", columnList = "cliente_id", unique = true),
        @Index(name = "idx_fidelizacion_codigo", columnList = "codigo_afiliado", unique = true)
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FidelizacionCrm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false, unique = true)
    @JsonIgnore
    private Cliente cliente;

    @Builder.Default
    @Column(name = "estado_membresia", nullable = false, length = 20)
    private String estadoMembresia = "ACTIVO";

    @Column(name = "codigo_afiliado", unique = true, length = 30)
    private String codigoAfiliado;

    @Builder.Default
    @Column(name = "porcentaje_descuento")
    private Double porcentajeDescuento = 0.0;

    @Builder.Default
    @Column(name = "puntos_acumulados")
    private Integer puntosAcumulados = 0;

    @Column(name = "fecha_afiliacion", nullable = false)
    @Builder.Default
    private LocalDate fechaAfiliacion = LocalDate.now();

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.fechaAfiliacion == null) {
            this.fechaAfiliacion = LocalDate.now();
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
}
