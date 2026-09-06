package com.farmacia.sgf.service;

import com.farmacia.sgf.dto.categoria.CategoriaRequestDTO;
import com.farmacia.sgf.dto.categoria.CategoriaResponseDTO;

import java.util.List;

public interface CategoriaService {

    List<CategoriaResponseDTO> listarTodas();

    CategoriaResponseDTO obtenerPorId(Long id);

    CategoriaResponseDTO crear(CategoriaRequestDTO dto);

    CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto);

    void eliminar(Long id);
}
