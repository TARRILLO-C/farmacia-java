package com.sg.farmacia.dto.presentacion;

import com.sg.farmacia.model.Presentacion;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresentacionResponseDTO {

    private Long id;
    private String nombre;
    private LocalDateTime createdAt;

    public static PresentacionResponseDTO fromEntity(Presentacion p) {
        if (p == null) return null;
        return PresentacionResponseDTO.builder()
                .id(p.getId())
                .nombre(p.getNombre())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
