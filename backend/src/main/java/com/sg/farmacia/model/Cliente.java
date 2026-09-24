package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "fidelizacion")
@EqualsAndHashCode(exclude = "fidelizacion")
@Entity
@Table(name = "clientes", indexes = {
        @Index(name = "idx_cliente_numero_documento", columnList = "numero_documento", unique = true)
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "tipo_documento", nullable = false, length = 15)
    private String tipoDocumento = "DNI";

    @Column(name = "numero_documento", nullable = false, unique = true, length = 20)
    private String numeroDocumento;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(length = 255)
    private String direccion;

    @Column(length = 25)
    private String telefono;

    @Column(length = 100)
    private String email;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @OneToOne(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private FidelizacionCrm fidelizacion;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (this.tipoDocumento == null || this.tipoDocumento.isBlank()) {
            this.tipoDocumento = "DNI";
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

    // =========================================================================
    // Getters y Setters de compatibilidad con Frontend Next.js y servicios previos
    // =========================================================================

    @JsonGetter("dniRuc")
    public String getDniRuc() {
        return this.numeroDocumento;
    }

    @JsonSetter("dniRuc")
    public void setDniRuc(String dniRuc) {
        if (this.numeroDocumento == null || this.numeroDocumento.isEmpty()) {
            this.numeroDocumento = dniRuc;
        }
    }

    @JsonGetter("documentoIdentidad")
    public String getDocumentoIdentidad() {
        return this.numeroDocumento;
    }

    @JsonSetter("documentoIdentidad")
    public void setDocumentoIdentidad(String documentoIdentidad) {
        if (this.numeroDocumento == null || this.numeroDocumento.isEmpty()) {
            this.numeroDocumento = documentoIdentidad;
        }
    }

    @JsonGetter("esClienteAmigo")
    public boolean isEsClienteAmigo() {
        return this.fidelizacion != null && "ACTIVO".equalsIgnoreCase(this.fidelizacion.getEstadoMembresia());
    }

    @JsonGetter("numeroClienteAmigo")
    public String getNumeroClienteAmigo() {
        return this.fidelizacion != null ? this.fidelizacion.getCodigoAfiliado() : null;
    }

    @JsonGetter("codigoClienteAmigo")
    public String getCodigoClienteAmigo() {
        return getNumeroClienteAmigo();
    }

    @JsonGetter("porcentajeDescuento")
    public Double getPorcentajeDescuento() {
        return (this.fidelizacion != null && this.fidelizacion.getPorcentajeDescuento() != null)
                ? this.fidelizacion.getPorcentajeDescuento()
                : 0.0;
    }

    @JsonGetter("puntosFidelidad")
    public Integer getPuntosFidelidad() {
        return (this.fidelizacion != null && this.fidelizacion.getPuntosAcumulados() != null)
                ? this.fidelizacion.getPuntosAcumulados()
                : 0;
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
