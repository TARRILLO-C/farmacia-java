package com.sg.farmacia.service;

import com.sg.farmacia.dto.principioactivo.PrincipioActivoRequestDTO;
import com.sg.farmacia.dto.principioactivo.PrincipioActivoResponseDTO;
import com.sg.farmacia.model.PrincipioActivo;

import java.util.List;

public interface PrincipioActivoService {

    List<PrincipioActivoResponseDTO> listarTodos();

    PrincipioActivoResponseDTO obtenerPorId(Long id);

    PrincipioActivoResponseDTO crear(PrincipioActivoRequestDTO dto);

    PrincipioActivoResponseDTO actualizar(Long id, PrincipioActivoRequestDTO dto);

    void eliminar(Long id);

    PrincipioActivo resolverEntidad(Long id, String nombre);
}
