package com.sg.farmacia.dto.caja;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CajaResponseDTO {

    private Long id;
    private LocalDateTime fechaApertura;
    private LocalDateTime fechaCierre;
    private Double montoInicial;
    private Double montoCierre;
    private Double totalVentasEfectivo;
    private Double totalVentasTarjeta;
    private Double totalVentasDigital;
    private Double totalVentasTotal;
    private Double totalIngresosManuales;
    private Double totalEgresosManuales;
    private Double saldoEsperadoEfectivo;
    private Double diferencia;
    private String estado; // ABIERTA, CERRADA
    private Long usuarioAperturaId;
    private String usuarioAperturaNombre;
    private Long usuarioCierreId;
    private String usuarioCierreNombre;
    private String observacionesApertura;
    private String observacionesCierre;
    private List<MovimientoCajaResponseDTO> movimientos;
}
