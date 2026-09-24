package com.sg.farmacia.service;

import com.sg.farmacia.dto.presentacion.PresentacionRequestDTO;
import com.sg.farmacia.dto.presentacion.PresentacionResponseDTO;
import com.sg.farmacia.model.Presentacion;

import java.util.List;

public interface PresentacionService {

    List<PresentacionResponseDTO> listarTodas();

    PresentacionResponseDTO obtenerPorId(Long id);

    PresentacionResponseDTO crear(PresentacionRequestDTO dto);

    PresentacionResponseDTO actualizar(Long id, PresentacionRequestDTO dto);

    void eliminar(Long id);

    Presentacion resolverEntidad(Long id, String nombre);
}
