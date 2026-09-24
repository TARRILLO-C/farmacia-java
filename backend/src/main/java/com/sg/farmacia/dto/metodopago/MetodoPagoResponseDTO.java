package com.sg.farmacia.dto.metodopago;

import com.sg.farmacia.model.MetodoPago;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetodoPagoResponseDTO {

    private Long id;
    private String nombre;
    private Boolean activo;

    public static MetodoPagoResponseDTO fromEntity(MetodoPago m) {
        if (m == null) return null;
        return MetodoPagoResponseDTO.builder()
                .id(m.getId())
                .nombre(m.getNombre())
                .activo(m.getActivo())
                .build();
    }
}
