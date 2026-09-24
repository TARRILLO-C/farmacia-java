package com.sg.farmacia.service;

import com.sg.farmacia.dto.laboratorio.LaboratorioRequestDTO;
import com.sg.farmacia.dto.laboratorio.LaboratorioResponseDTO;
import com.sg.farmacia.model.Laboratorio;

import java.util.List;

public interface LaboratorioService {

    List<LaboratorioResponseDTO> listarTodos();

    List<LaboratorioResponseDTO> listarActivos();

    LaboratorioResponseDTO obtenerPorId(Long id);

    LaboratorioResponseDTO crear(LaboratorioRequestDTO dto);

    LaboratorioResponseDTO actualizar(Long id, LaboratorioRequestDTO dto);

    void eliminar(Long id);

    Laboratorio resolverEntidad(Long id, String nombre);
}
