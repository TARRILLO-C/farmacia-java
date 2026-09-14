package com.sg.farmacia.service;

import com.sg.farmacia.dto.recibo.ReciboResponseDTO;

public interface ReciboService {

    ReciboResponseDTO obtenerPorId(Long id);

    ReciboResponseDTO obtenerPorVentaId(Long ventaId);

    ReciboResponseDTO obtenerPorCodigo(String codigoComprobante);
}
