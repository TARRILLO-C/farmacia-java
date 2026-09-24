package com.sg.farmacia.model;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "usuarios", indexes = {
        @Index(name = "idx_usuario_username", columnList = "username", unique = true),
        @Index(name = "idx_usuario_email", columnList = "email", unique = true)
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "empleado_id", nullable = false, unique = true)
    private Empleado empleado;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    @JsonIgnore
    private String passwordHash;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    private Role rol;

    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true;

    @Builder.Default
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Builder.Default
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
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
    // Getters y Setters de compatibilidad con Spring Security y Frontend Next.js
    // =========================================================================

    public String getPassword() {
        return this.passwordHash;
    }

    public void setPassword(String password) {
        this.passwordHash = password;
    }

    @JsonGetter("nombre")
    public String getNombre() {
        return this.empleado != null ? this.empleado.getNombreCompleto() : this.username;
    }

    @JsonGetter("modulosPermitidos")
    public Set<String> getModulosPermitidos() {
        if (this.rol == null) {
            return new HashSet<>();
        }
        String nombreRol = this.rol.getNombre().toUpperCase();
        if (nombreRol.contains("ADMIN")) {
            return new HashSet<>(Arrays.asList(
                    "dashboard", "pos", "inventario", "categorias", "laboratorios", "principios-activos",
                    "presentaciones", "proveedores", "compras", "clientes", "fidelizacion", "ventas", "recibos", "reportes", "usuarios", "empleados"
            ));
        } else if (nombreRol.contains("FARMACEUTICO")) {
            return new HashSet<>(Arrays.asList(
                    "dashboard", "pos", "inventario", "categorias", "laboratorios", "principios-activos",
                    "presentaciones", "compras", "clientes", "ventas"
            ));
        } else {
            // CAJERO u operador
            return new HashSet<>(Arrays.asList(
                    "dashboard", "pos", "clientes", "ventas", "recibos"
            ));
        }
    }
}
