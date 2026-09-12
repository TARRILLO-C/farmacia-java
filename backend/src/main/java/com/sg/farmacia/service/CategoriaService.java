package com.sg.farmacia.service;

import com.sg.farmacia.dto.categoria.CategoriaRequestDTO;
import com.sg.farmacia.dto.categoria.CategoriaResponseDTO;

import java.util.List;

public interface CategoriaService {

    List<CategoriaResponseDTO> listarTodas();

    CategoriaResponseDTO obtenerPorId(Long id);

    CategoriaResponseDTO crear(CategoriaRequestDTO dto);

    CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto);

    void eliminar(Long id);
}
