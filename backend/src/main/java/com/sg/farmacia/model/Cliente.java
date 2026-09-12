package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dni_ruc", nullable = false, unique = true, length = 20)
    private String dniRuc;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(length = 255)
    private String direccion;

    @Column(length = 25)
    private String telefono;

    @Column(length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_cliente", nullable = false, length = 20)
    @Builder.Default
    private TipoCliente tipoCliente = TipoCliente.NUEVO;

    @Column(name = "es_cliente_amigo", nullable = false)
    @Builder.Default
    private boolean esClienteAmigo = false;

    @Column(name = "numero_cliente_amigo", unique = true, length = 30)
    private String numeroClienteAmigo;

    @Column(name = "porcentaje_descuento", nullable = false)
    @Builder.Default
    private Double porcentajeDescuento = 0.0;

    @Column(name = "puntos_fidelidad", nullable = false)
    @Builder.Default
    private Integer puntosFidelidad = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js (documentoIdentidad, nombre, apellido, codigoClienteAmigo)
    // =========================================================================

    @JsonGetter("documentoIdentidad")
    public String getDocumentoIdentidad() {
        return this.dniRuc;
    }

    @JsonSetter("documentoIdentidad")
    public void setDocumentoIdentidad(String documentoIdentidad) {
        if (this.dniRuc == null || this.dniRuc.isEmpty()) {
            this.dniRuc = documentoIdentidad;
        }
    }

    @JsonGetter("codigoClienteAmigo")
    public String getCodigoClienteAmigo() {
        return this.numeroClienteAmigo;
    }

    @JsonSetter("codigoClienteAmigo")
    public void setCodigoClienteAmigo(String codigoClienteAmigo) {
        if (this.numeroClienteAmigo == null || this.numeroClienteAmigo.isEmpty()) {
            this.numeroClienteAmigo = codigoClienteAmigo;
        }
    }

    @JsonGetter("nombre")
    public String getNombre() {
        if (this.nombreCompleto == null) return "";
        String[] partes = this.nombreCompleto.trim().split("\\s+", 2);
        return partes.length > 0 ? partes[0] : this.nombreCompleto;
    }

    @JsonGetter("apellido")
    public String getApellido() {
        if (this.nombreCompleto == null) return "";
        String[] partes = this.nombreCompleto.trim().split("\\s+", 2);
        return partes.length > 1 ? partes[1] : "";
    }
}
