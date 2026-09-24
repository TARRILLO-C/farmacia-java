package com.sg.farmacia.dto.empleado;

import com.sg.farmacia.model.Empleado;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmpleadoResponseDTO {

    private Long id;
    private String dni;
    private String nombres;
    private String apellidos;
    private String nombreCompleto;
    private String telefono;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EmpleadoResponseDTO fromEntity(Empleado e) {
        if (e == null) return null;
        return EmpleadoResponseDTO.builder()
                .id(e.getId())
                .dni(e.getDni())
                .nombres(e.getNombres())
                .apellidos(e.getApellidos())
                .nombreCompleto(e.getNombreCompleto())
                .telefono(e.getTelefono())
                .activo(e.getActivo())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
