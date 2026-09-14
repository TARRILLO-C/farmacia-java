package com.sg.farmacia.service;

import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;

import java.util.List;

public interface VentaService {

    VentaResponseDTO procesarVenta(VentaRequestDTO dto);

    List<VentaResponseDTO> listarTodas();

    List<VentaResponseDTO> listarHistorial(java.time.LocalDate fechaInicio, java.time.LocalDate fechaFin, String dniCliente);

    List<VentaResponseDTO> listarPorClienteId(Long clienteId);

    VentaResponseDTO obtenerPorId(Long id);
}
