package com.sg.farmacia.service;

import com.sg.farmacia.dto.proveedor.ProveedorRequestDTO;
import com.sg.farmacia.dto.proveedor.ProveedorResponseDTO;
import com.sg.farmacia.model.Proveedor;

import java.util.List;

public interface ProveedorService {

    List<ProveedorResponseDTO> listarTodos();

    List<ProveedorResponseDTO> listarActivos();

    ProveedorResponseDTO obtenerPorId(Long id);

    ProveedorResponseDTO obtenerPorRuc(String ruc);

    List<ProveedorResponseDTO> buscar(String term);

    ProveedorResponseDTO crear(ProveedorRequestDTO dto);

    ProveedorResponseDTO actualizar(Long id, ProveedorRequestDTO dto);

    void eliminar(Long id);

    Proveedor resolverEntidad(Long id, String ruc);
}
