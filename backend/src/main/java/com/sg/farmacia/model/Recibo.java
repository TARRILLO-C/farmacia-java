package com.sg.farmacia.model;

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
        @Index(name = "idx_recibo_codigo", columnList = "codigo_comprobante", unique = true),
        @Index(name = "idx_recibo_venta", columnList = "venta_id", unique = true)
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Recibo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_comprobante", nullable = false, unique = true, length = 50)
    private String codigoComprobante;

    @Column(name = "fecha_emision", nullable = false)
    @Builder.Default
    private LocalDateTime fechaEmision = LocalDateTime.now();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venta_id", nullable = false, unique = true)
    @JsonIgnore
    private Venta venta;

    @Column(name = "total_pagado", nullable = false)
    private Double totalPagado;

    @PrePersist
    public void prePersist() {
        if (this.fechaEmision == null) {
            this.fechaEmision = LocalDateTime.now();
        }
    }
}
