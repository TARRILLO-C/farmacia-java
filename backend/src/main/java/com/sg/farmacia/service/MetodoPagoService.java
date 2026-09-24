package com.sg.farmacia.service;

import com.sg.farmacia.dto.metodopago.MetodoPagoRequestDTO;
import com.sg.farmacia.dto.metodopago.MetodoPagoResponseDTO;
import com.sg.farmacia.model.MetodoPago;

import java.util.List;

public interface MetodoPagoService {

    List<MetodoPagoResponseDTO> listarTodos();

    List<MetodoPagoResponseDTO> listarActivos();

    MetodoPagoResponseDTO obtenerPorId(Long id);

    MetodoPagoResponseDTO crear(MetodoPagoRequestDTO dto);

    MetodoPagoResponseDTO actualizar(Long id, MetodoPagoRequestDTO dto);

    void eliminar(Long id);

    MetodoPago resolverMetodoPago(Long id, String nombre);
}
