package com.sg.farmacia.service;

import com.sg.farmacia.dto.lote.LoteRequestDTO;
import com.sg.farmacia.dto.lote.LoteResponseDTO;
import com.sg.farmacia.model.LoteInventario;

import java.util.List;

public interface LoteInventarioService {

    List<LoteResponseDTO> listarTodos();

    List<LoteResponseDTO> listarPorProductoId(Long productoId);

    List<LoteResponseDTO> listarStockBajo();

    List<LoteResponseDTO> listarProximosAVencer(int dias);

    LoteResponseDTO obtenerPorId(Long id);

    LoteResponseDTO crear(LoteRequestDTO dto);

    LoteResponseDTO actualizar(Long id, LoteRequestDTO dto);

    void eliminar(Long id);

    LoteInventario registrarOActualizarLote(Long productoId, String codigoLote, java.time.LocalDate fechaVencimiento, int cantidad, double precioCompra);

    void descontarStockLote(Long loteId, int cantidad);
}
