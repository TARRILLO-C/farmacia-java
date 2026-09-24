package com.sg.farmacia.dto.cliente;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteRequestDTO {

    @Builder.Default
    private String tipoDocumento = "DNI";

    @NotBlank(message = "El documento de identidad es obligatorio")
    @Size(min = 8, max = 20, message = "El documento debe tener entre 8 y 20 caracteres")
    @JsonAlias({"documentoIdentidad", "dni", "ruc", "dniRuc", "numeroDocumento"})
    private String numeroDocumento;

    @JsonAlias({"nombre"})
    private String nombre;

    @JsonAlias({"apellido"})
    private String apellido;

    @JsonAlias({"nombreCompleto"})
    private String nombreCompleto;

    @Size(max = 255, message = "La dirección no puede exceder los 255 caracteres")
    private String direccion;

    @Size(max = 25, message = "El teléfono no puede exceder los 25 caracteres")
    private String telefono;

    private String email;

    @Builder.Default
    private Boolean esClienteAmigo = false;

    @JsonAlias({"codigoClienteAmigo", "codigoAfiliado"})
    private String numeroClienteAmigo;

    private Double porcentajeDescuento;

    @Builder.Default
    private Boolean activo = true;

    public String getDniRuc() {
        return this.numeroDocumento;
    }

    public void setDniRuc(String dniRuc) {
        this.numeroDocumento = dniRuc;
    }

    public String obtenerNombreCompleto() {
        if (this.nombreCompleto != null && !this.nombreCompleto.trim().isEmpty()) {
            return this.nombreCompleto.trim();
        }
        String n = this.nombre != null ? this.nombre.trim() : "";
        String a = this.apellido != null ? this.apellido.trim() : "";
        String combinado = (n + " " + a).trim();
        return combinado.isEmpty() ? "CLIENTE S/N" : combinado;
    }
}
