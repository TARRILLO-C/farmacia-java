package com.sg.farmacia.service;

import com.sg.farmacia.dto.compra.CompraRequestDTO;
import com.sg.farmacia.dto.compra.CompraResponseDTO;

import java.time.LocalDateTime;
import java.util.List;

public interface CompraService {

    List<CompraResponseDTO> listarTodas();

    CompraResponseDTO obtenerPorId(Long id);

    List<CompraResponseDTO> listarPorProveedor(Long proveedorId);

    List<CompraResponseDTO> listarPorRangoFechas(LocalDateTime desde, LocalDateTime hasta);

    CompraResponseDTO registrarCompra(CompraRequestDTO dto);
}
