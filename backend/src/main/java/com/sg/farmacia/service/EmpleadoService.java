package com.sg.farmacia.service;

import com.sg.farmacia.dto.empleado.EmpleadoRequestDTO;
import com.sg.farmacia.dto.empleado.EmpleadoResponseDTO;
import com.sg.farmacia.model.Empleado;

import java.util.List;

public interface EmpleadoService {

    List<EmpleadoResponseDTO> listarTodos();

    List<EmpleadoResponseDTO> listarActivos();

    EmpleadoResponseDTO obtenerPorId(Long id);

    EmpleadoResponseDTO obtenerPorDni(String dni);

    List<EmpleadoResponseDTO> buscar(String term);

    EmpleadoResponseDTO crear(EmpleadoRequestDTO dto);

    EmpleadoResponseDTO actualizar(Long id, EmpleadoRequestDTO dto);

    void eliminar(Long id);

    Empleado resolverEntidad(Long id, String dni);
}
