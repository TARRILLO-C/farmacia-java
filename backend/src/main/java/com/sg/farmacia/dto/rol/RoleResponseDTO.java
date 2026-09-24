package com.sg.farmacia.dto.rol;

import com.sg.farmacia.model.Role;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;

    public static RoleResponseDTO fromEntity(Role r) {
        if (r == null) return null;
        return RoleResponseDTO.builder()
                .id(r.getId())
                .nombre(r.getNombre())
                .descripcion(r.getDescripcion())
                .build();
    }
}
