package com.sg.farmacia.dto.categoria;

import com.sg.farmacia.model.Categoria;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoriaResponseDTO {

    private Long id;
    private String nombre;
    private String descripcion;
    private Boolean activo;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategoriaResponseDTO fromEntity(Categoria categoria) {
        if (categoria == null) return null;
        return CategoriaResponseDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .descripcion(categoria.getDescripcion())
                .activo(categoria.getActivo())
                .createdAt(categoria.getCreatedAt())
                .updatedAt(categoria.getUpdatedAt())
                .build();
    }
}
