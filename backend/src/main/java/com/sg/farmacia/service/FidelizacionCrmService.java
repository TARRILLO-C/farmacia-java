package com.sg.farmacia.service;

import com.sg.farmacia.dto.fidelizacion.FidelizacionRequestDTO;
import com.sg.farmacia.dto.fidelizacion.FidelizacionResponseDTO;

import java.util.List;

public interface FidelizacionCrmService {

    List<FidelizacionResponseDTO> listarTodos();

    FidelizacionResponseDTO obtenerPorId(Long id);

    FidelizacionResponseDTO obtenerPorClienteId(Long clienteId);

    FidelizacionResponseDTO obtenerPorCodigoAfiliado(String codigoAfiliado);

    FidelizacionResponseDTO afiliarOActualizar(FidelizacionRequestDTO dto);

    void eliminar(Long id);

    void acumularPuntos(Long clienteId, int puntos);
}
