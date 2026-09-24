package com.sg.farmacia.dto.fidelizacion;

import com.sg.farmacia.model.FidelizacionCrm;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FidelizacionResponseDTO {

    private Long id;
    private Long clienteId;
    private String clienteNombre;
    private String clienteDocumento;
    private String estadoMembresia;
    private String codigoAfiliado;
    private Double porcentajeDescuento;
    private Integer puntosAcumulados;
    private LocalDate fechaAfiliacion;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FidelizacionResponseDTO fromEntity(FidelizacionCrm f) {
        if (f == null) return null;
        return FidelizacionResponseDTO.builder()
                .id(f.getId())
                .clienteId(f.getCliente() != null ? f.getCliente().getId() : null)
                .clienteNombre(f.getCliente() != null ? f.getCliente().getNombreCompleto() : null)
                .clienteDocumento(f.getCliente() != null ? f.getCliente().getNumeroDocumento() : null)
                .estadoMembresia(f.getEstadoMembresia())
                .codigoAfiliado(f.getCodigoAfiliado())
                .porcentajeDescuento(f.getPorcentajeDescuento())
                .puntosAcumulados(f.getPuntosAcumulados())
                .fechaAfiliacion(f.getFechaAfiliacion())
                .createdAt(f.getCreatedAt())
                .updatedAt(f.getUpdatedAt())
                .build();
    }
}
