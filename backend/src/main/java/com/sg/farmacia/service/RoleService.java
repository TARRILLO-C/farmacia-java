package com.sg.farmacia.service;

import com.sg.farmacia.dto.rol.RoleRequestDTO;
import com.sg.farmacia.dto.rol.RoleResponseDTO;
import com.sg.farmacia.model.Role;

import java.util.List;

public interface RoleService {

    List<RoleResponseDTO> listarTodos();

    RoleResponseDTO obtenerPorId(Long id);

    RoleResponseDTO crear(RoleRequestDTO dto);

    RoleResponseDTO actualizar(Long id, RoleRequestDTO dto);

    void eliminar(Long id);

    Role obtenerEntidadPorIdONombre(Long id, String nombre);
}
