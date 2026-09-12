package com.sg.farmacia.dto.cliente;

import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.model.TipoCliente;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClienteResponseDTO {

    private Long id;
    private String dniRuc;
    private String documentoIdentidad; // Alias para Next.js
    private String nombreCompleto;
    private String nombre;             // Alias para Next.js
    private String apellido;           // Alias para Next.js
    private String direccion;
    private String telefono;
    private String email;
    private TipoCliente tipoCliente;
    private boolean esClienteAmigo;
    private String numeroClienteAmigo;
    private String codigoClienteAmigo; // Alias para Next.js
    private Double porcentajeDescuento;
    private Integer puntosFidelidad;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClienteResponseDTO fromEntity(Cliente cliente) {
        if (cliente == null) return null;

        String nombre = cliente.getNombre();
        String apellido = cliente.getApellido();

        return ClienteResponseDTO.builder()
                .id(cliente.getId())
                .dniRuc(cliente.getDniRuc())
                .documentoIdentidad(cliente.getDniRuc())
                .nombreCompleto(cliente.getNombreCompleto())
                .nombre(nombre)
                .apellido(apellido)
                .direccion(cliente.getDireccion())
                .telefono(cliente.getTelefono())
                .email(cliente.getEmail())
                .tipoCliente(cliente.getTipoCliente())
                .esClienteAmigo(cliente.isEsClienteAmigo())
                .numeroClienteAmigo(cliente.getNumeroClienteAmigo())
                .codigoClienteAmigo(cliente.getNumeroClienteAmigo())
                .porcentajeDescuento(cliente.getPorcentajeDescuento())
                .puntosFidelidad(cliente.getPuntosFidelidad())
                .activo(cliente.getActivo())
                .createdAt(cliente.getCreatedAt())
                .updatedAt(cliente.getUpdatedAt())
                .build();
    }
}
