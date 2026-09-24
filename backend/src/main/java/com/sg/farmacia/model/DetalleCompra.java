package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "compra")
@EqualsAndHashCode(exclude = "compra")
@Entity
@Table(name = "detalle_compras", indexes = {
        @Index(name = "idx_detalle_compra", columnList = "compra_id"),
        @Index(name = "idx_detalle_compra_producto", columnList = "producto_id")
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DetalleCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_id", nullable = false)
    @JsonIgnore
    private Compra compra;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "lote_asignado", nullable = false, length = 50)
    private String loteAsignado;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", nullable = false)
    private Double precioUnitario;

    @Column(nullable = false)
    private Double subtotal;
}
