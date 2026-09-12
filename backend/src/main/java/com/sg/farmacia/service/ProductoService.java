package com.sg.farmacia.service;

import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;

import java.util.List;

public interface ProductoService {

    List<ProductoResponseDTO> listarTodos(String search, Long categoriaId);

    ProductoResponseDTO obtenerPorId(Long id);

    ProductoResponseDTO obtenerPorCodigo(String codigoBarras);

    ProductoResponseDTO crear(ProductoRequestDTO dto);

    ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto);

    void eliminar(Long id);

    ProductoResponseDTO ajustarStock(Long id, AjusteStockRequestDTO dto);

    List<ProductoResponseDTO> listarStockBajo(Integer limite);

    List<ProductoResponseDTO> listarProximosAVencer(Integer dias);
}
