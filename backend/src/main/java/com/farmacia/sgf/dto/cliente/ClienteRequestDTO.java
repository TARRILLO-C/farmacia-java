package com.farmacia.sgf.dto.cliente;

import com.farmacia.sgf.model.TipoCliente;
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

    @NotBlank(message = "El documento de identidad (DNI/RUC) es obligatorio")
    @Size(min = 8, max = 20, message = "El documento debe tener entre 8 y 20 caracteres")
    @JsonAlias({"documentoIdentidad", "dni", "ruc"})
    private String dniRuc;

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
    private TipoCliente tipoCliente = TipoCliente.NUEVO;

    @Builder.Default
    private Boolean esClienteAmigo = false;

    @JsonAlias({"codigoClienteAmigo"})
    private String numeroClienteAmigo;

    private Double porcentajeDescuento;

    @Builder.Default
    private Boolean activo = true;

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
