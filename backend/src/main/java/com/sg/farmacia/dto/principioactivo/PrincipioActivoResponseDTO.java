package com.sg.farmacia.dto.principioactivo;

import com.sg.farmacia.model.PrincipioActivo;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrincipioActivoResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private LocalDateTime createdAt;

    public static PrincipioActivoResponseDTO fromEntity(PrincipioActivo pa) {
        if (pa == null) return null;
        return PrincipioActivoResponseDTO.builder()
                .id(pa.getId())
                .nombre(pa.getNombre())
                .descripcion(pa.getDescripcion())
                .createdAt(pa.getCreatedAt())
                .build();
    }
}
