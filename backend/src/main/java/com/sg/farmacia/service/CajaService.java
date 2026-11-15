package com.sg.farmacia.service;

import com.sg.farmacia.dto.caja.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CajaService {

    Optional<CajaResponseDTO> obtenerCajaActiva();

    CajaResponseDTO abrirCaja(AperturaCajaDTO dto);

    CajaResponseDTO cerrarCaja(Long id, CierreCajaDTO dto);

    MovimientoCajaResponseDTO registrarMovimiento(Long cajaId, MovimientoCajaRequestDTO dto);

    void registrarVentaEnCajaActiva(Long ventaId, Double monto, String metodoPago);

    List<CajaResponseDTO> listarHistorial(LocalDate fechaInicio, LocalDate fechaFin);

    CajaResponseDTO obtenerPorId(Long id);
}

