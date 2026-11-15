package com.sg.farmacia.dto.caja;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoCajaResponseDTO {

    private Long id;
    private Long cajaId;
    private String tipo;
    private String concepto;
    private Double monto;
    private String metodoPago;
    private LocalDateTime fecha;
    private Long usuarioId;
    private String usuarioNombre;
    private Long referenciaId;
}
