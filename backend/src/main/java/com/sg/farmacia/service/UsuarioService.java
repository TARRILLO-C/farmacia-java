package com.sg.farmacia.service;

import com.sg.farmacia.dto.usuario.UsuarioRequestDTO;
import com.sg.farmacia.dto.usuario.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    UsuarioResponseDTO obtenerPorId(Long id);

    UsuarioResponseDTO crear(UsuarioRequestDTO dto);

    UsuarioResponseDTO actualizar(Long id, UsuarioRequestDTO dto);

    UsuarioResponseDTO toggleActivo(Long id);

    void eliminar(Long id);
}
