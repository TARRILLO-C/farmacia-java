package com.sg.farmacia.dto.laboratorio;

import com.sg.farmacia.model.Laboratorio;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LaboratorioResponseDTO {

    private Long id;
    private String nombre;
    private String paisOrigen;
    private Boolean activo;
    private LocalDateTime createdAt;

    public static LaboratorioResponseDTO fromEntity(Laboratorio lab) {
        if (lab == null) return null;
        return LaboratorioResponseDTO.builder()
                .id(lab.getId())
                .nombre(lab.getNombre())
                .paisOrigen(lab.getPaisOrigen())
                .activo(lab.getActivo())
                .createdAt(lab.getCreatedAt())
                .build();
    }
}
