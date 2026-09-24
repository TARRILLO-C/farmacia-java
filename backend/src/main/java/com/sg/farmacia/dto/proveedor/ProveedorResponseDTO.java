package com.sg.farmacia.dto.proveedor;

import com.sg.farmacia.model.Proveedor;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProveedorResponseDTO {

    private Long id;
    private String ruc;
    private String razonSocial;
    private String contacto;
    private String telefono;
    private String email;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProveedorResponseDTO fromEntity(Proveedor p) {
        if (p == null) return null;
        return ProveedorResponseDTO.builder()
                .id(p.getId())
                .ruc(p.getRuc())
                .razonSocial(p.getRazonSocial())
                .contacto(p.getContacto())
                .telefono(p.getTelefono())
                .email(p.getEmail())
                .activo(p.getActivo())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
