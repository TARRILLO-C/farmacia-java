package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Categoria;
import com.sg.farmacia.model.Producto;
import com.sg.farmacia.repository.CategoriaRepository;
import com.sg.farmacia.repository.ProductoRepository;
import com.sg.farmacia.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarTodos(String search, Long categoriaId) {
        boolean hasSearch = search != null && !search.trim().isEmpty();
        boolean hasCategoria = categoriaId != null && categoriaId > 0;

        List<Producto> productos;

        if (hasSearch && hasCategoria) {
            productos = productoRepository.buscarPorCategoriaYTermino(categoriaId, search.trim());
        } else if (hasCategoria) {
            productos = productoRepository.findByCategoriaId(categoriaId);
        } else if (hasSearch) {
            productos = productoRepository.buscarPorCodigoBarrasONombre(search.trim());
        } else {
            productos = productoRepository.findAllWithCategoria();
        }

        return productos.stream()
                .map(ProductoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorId(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));
        return ProductoResponseDTO.fromEntity(producto);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductoResponseDTO obtenerPorCodigo(String codigoBarras) {
        if (codigoBarras == null || codigoBarras.trim().isEmpty()) {
            throw new BadRequestException("El código de barras proporcionado no es válido");
        }
        Producto producto = productoRepository.findByCodigoBarras(codigoBarras.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró ningún producto con el código de barras: " + codigoBarras.trim()));
        return ProductoResponseDTO.fromEntity(producto);
    }

    @Override
    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
        String codigoBarras = dto.obtenerCodigoBarras();

        if (productoRepository.existsByCodigoBarras(codigoBarras)) {
            throw new BadRequestException("Ya existe un producto registrado con el código de barras: " + codigoBarras);
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + dto.getCategoriaId()));

        Producto producto = Producto.builder()
                .codigoBarras(codigoBarras)
                .nombre(dto.obtenerNombre())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .principioActivo(dto.getPrincipioActivo() != null ? dto.getPrincipioActivo().trim() : null)
                .presentacion(dto.getPresentacion() != null ? dto.getPresentacion().trim() : null)
                .laboratorio(dto.getLaboratorio() != null ? dto.getLaboratorio().trim() : null)
                .lote(dto.getLote() != null ? dto.getLote().trim() : null)
                .precioCompra(dto.getPrecioCompra())
                .precioVenta(dto.getPrecioVenta())
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .stockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 10)
                .fechaCaducidad(dto.getFechaCaducidad())
                .requiereReceta(dto.getRequiereReceta() != null ? dto.getRequiereReceta() : false)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .categoria(categoria)
                .build();

        Producto guardado = productoRepository.save(producto);
        return ProductoResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));

        String nuevoCodigo = dto.obtenerCodigoBarras();
        if (productoRepository.existsByCodigoBarrasAndIdNot(nuevoCodigo, id)) {
            throw new BadRequestException("Ya existe otro producto registrado con el código de barras: " + nuevoCodigo);
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + dto.getCategoriaId()));

        producto.setCodigoBarras(nuevoCodigo);
        producto.setNombre(dto.obtenerNombre());
        producto.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        producto.setPrincipioActivo(dto.getPrincipioActivo() != null ? dto.getPrincipioActivo().trim() : null);
        producto.setPresentacion(dto.getPresentacion() != null ? dto.getPresentacion().trim() : null);
        producto.setLaboratorio(dto.getLaboratorio() != null ? dto.getLaboratorio().trim() : null);
        producto.setLote(dto.getLote() != null ? dto.getLote().trim() : null);
        producto.setPrecioCompra(dto.getPrecioCompra());
        producto.setPrecioVenta(dto.getPrecioVenta());
        if (dto.getStock() != null) {
            producto.setStock(dto.getStock());
        }
        if (dto.getStockMinimo() != null) {
            producto.setStockMinimo(dto.getStockMinimo());
        }
        producto.setFechaCaducidad(dto.getFechaCaducidad());
        if (dto.getRequiereReceta() != null) {
            producto.setRequiereReceta(dto.getRequiereReceta());
        }
        if (dto.getActivo() != null) {
            producto.setActivo(dto.getActivo());
        }
        producto.setCategoria(categoria);

        Producto actualizado = productoRepository.save(producto);
        return ProductoResponseDTO.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));
        productoRepository.delete(producto);
    }

    @Override
    @Transactional
    public ProductoResponseDTO ajustarStock(Long id, AjusteStockRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));

        int stockActual = producto.getStock() != null ? producto.getStock() : 0;
        int nuevoStock;
        String tipoMovimiento = dto.getTipo() != null ? dto.getTipo().trim().toUpperCase() : "";

        switch (tipoMovimiento) {
            case "ENTRADA":
            case "INGRESO":
            case "INCREMENTO":
                nuevoStock = stockActual + Math.abs(dto.getCantidad());
                break;
            case "SALIDA":
            case "EGRESO":
            case "DECREMENTO":
                nuevoStock = stockActual - Math.abs(dto.getCantidad());
                break;
            case "AJUSTE":
            case "FIJAR":
            case "MANUAL":
                nuevoStock = dto.getCantidad();
                break;
            default:
                // Si no especifica tipo, interpretar directamente el signo de cantidad
                nuevoStock = stockActual + dto.getCantidad();
                break;
        }

        if (nuevoStock < 0) {
            throw new BadRequestException(String.format(
                    "Stock insuficiente. La operación resultaría en un stock de %d unidades para el producto '%s'. Stock actual disponible: %d",
                    nuevoStock, producto.getNombre(), stockActual
            ));
        }

        producto.setStock(nuevoStock);
        Producto guardado = productoRepository.save(producto);
        return ProductoResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarStockBajo(Integer limite) {
        int lim = (limite != null && limite >= 0) ? limite : 10;
        return productoRepository.findByStockLessThanEqual(lim)
                .stream()
                .map(ProductoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarProximosAVencer(Integer dias) {
        int diasLimite = (dias != null && dias > 0) ? dias : 30;
        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(diasLimite);

        return productoRepository.findByFechaCaducidadBetween(hoy, fechaLimite)
                .stream()
                .map(ProductoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
