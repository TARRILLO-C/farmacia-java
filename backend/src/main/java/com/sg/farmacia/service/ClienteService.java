package com.sg.farmacia.service;

import com.sg.farmacia.dto.cliente.ClienteRequestDTO;
import com.sg.farmacia.dto.cliente.ClienteResponseDTO;

import java.util.List;

public interface ClienteService {

    List<ClienteResponseDTO> listarTodos();

    ClienteResponseDTO obtenerPorId(Long id);

    ClienteResponseDTO obtenerPorDniRuc(String dniRuc);

    ClienteResponseDTO obtenerPorNumeroClienteAmigo(String numeroClienteAmigo);

    List<ClienteResponseDTO> buscar(String termino);

    ClienteResponseDTO crear(ClienteRequestDTO dto);

    ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto);

    void eliminar(Long id);
}
