package com.sg.farmacia.service;

import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;

import java.util.List;

public interface VentaService {

    VentaResponseDTO procesarVenta(VentaRequestDTO dto);

    List<VentaResponseDTO> listarTodas();

    VentaResponseDTO obtenerPorId(Long id);
}
