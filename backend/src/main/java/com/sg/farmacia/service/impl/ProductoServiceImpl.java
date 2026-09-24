package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.*;
import com.sg.farmacia.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final LaboratorioService laboratorioService;
    private final PrincipioActivoService principioActivoService;
    private final PresentacionService presentacionService;
    private final LoteInventarioRepository loteRepository;

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
            productos = productoRepository.buscarPorCodigoONombre(search.trim());
        } else {
            productos = productoRepository.findAllWithRelations();
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
    public ProductoResponseDTO obtenerPorCodigo(String codigo) {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new BadRequestException("El código proporcionado no es válido.");
        }
        Producto producto = productoRepository.findByCodigo(codigo.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró ningún producto con el código: " + codigo.trim()));
        return ProductoResponseDTO.fromEntity(producto);
    }

    @Override
    @Transactional
    public ProductoResponseDTO crear(ProductoRequestDTO dto) {
        String codigo = dto.obtenerCodigo();

        if (productoRepository.existsByCodigo(codigo)) {
            throw new BadRequestException("Ya existe un producto registrado con el código: " + codigo);
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + dto.getCategoriaId()));

        Laboratorio lab = laboratorioService.resolverEntidad(dto.getLaboratorioId(), dto.getLaboratorio());
        PrincipioActivo pa = principioActivoService.resolverEntidad(dto.getPrincipioActivoId(), dto.getPrincipioActivo());
        Presentacion pres = presentacionService.resolverEntidad(dto.getPresentacionId(), dto.getPresentacion());

        Producto producto = Producto.builder()
                .codigo(codigo)
                .nombre(dto.obtenerNombre())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .precioBaseVenta(dto.getPrecioVenta())
                .requiereReceta(dto.getRequiereReceta() != null ? dto.getRequiereReceta() : false)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .categoria(categoria)
                .laboratorio(lab)
                .principioActivo(pa)
                .presentacion(pres)
                .lotes(new ArrayList<>())
                .build();

        Producto guardado = productoRepository.save(producto);

        // Si se especificó stock o lote inicial, registrar LoteInventario
        if (dto.getStock() != null && dto.getStock() > 0) {
            String codLote = (dto.getLote() != null && !dto.getLote().isBlank())
                    ? dto.getLote().trim()
                    : "LOT-" + LocalDate.now().getYear() + "-01";

            LocalDate venc = (dto.getFechaCaducidad() != null)
                    ? dto.getFechaCaducidad()
                    : LocalDate.now().plusMonths(12);

            LoteInventario lote = LoteInventario.builder()
                    .producto(guardado)
                    .codigoLote(codLote)
                    .fechaVencimiento(venc)
                    .stockActual(dto.getStock())
                    .stockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5)
                    .precioCompra(dto.getPrecioCompra() != null ? dto.getPrecioCompra() : 0.00)
                    .activo(true)
                    .build();

            loteRepository.save(lote);
            guardado.getLotes().add(lote);
        }

        return ProductoResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional
    public ProductoResponseDTO actualizar(Long id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));

        String nuevoCodigo = dto.obtenerCodigo();
        if (productoRepository.existsByCodigoAndIdNot(nuevoCodigo, id)) {
            throw new BadRequestException("Ya existe otro producto registrado con el código: " + nuevoCodigo);
        }

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + dto.getCategoriaId()));

        Laboratorio lab = laboratorioService.resolverEntidad(dto.getLaboratorioId(), dto.getLaboratorio());
        PrincipioActivo pa = principioActivoService.resolverEntidad(dto.getPrincipioActivoId(), dto.getPrincipioActivo());
        Presentacion pres = presentacionService.resolverEntidad(dto.getPresentacionId(), dto.getPresentacion());

        producto.setCodigo(nuevoCodigo);
        producto.setNombre(dto.obtenerNombre());
        producto.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        producto.setPrecioBaseVenta(dto.getPrecioVenta());
        if (dto.getRequiereReceta() != null) {
            producto.setRequiereReceta(dto.getRequiereReceta());
        }
        if (dto.getActivo() != null) {
            producto.setActivo(dto.getActivo());
        }
        producto.setCategoria(categoria);
        if (lab != null) producto.setLaboratorio(lab);
        if (pa != null) producto.setPrincipioActivo(pa);
        if (pres != null) producto.setPresentacion(pres);

        Producto actualizado = productoRepository.save(producto);
        return ProductoResponseDTO.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    @Override
    @Transactional
    public ProductoResponseDTO ajustarStock(Long id, AjusteStockRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el producto con ID: " + id));

        int stockActual = producto.getStock();
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
                nuevoStock = stockActual + dto.getCantidad();
                break;
        }

        if (nuevoStock < 0) {
            throw new BadRequestException(String.format(
                    "Stock insuficiente. La operación resultaría en un stock de %d unidades para el producto '%s'. Stock actual disponible: %d",
                    nuevoStock, producto.getNombre(), stockActual
            ));
        }

        // Buscar lote activo o crear lote de ajuste
        List<LoteInventario> lotes = loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(id);
        if (!lotes.isEmpty()) {
            LoteInventario primerLote = lotes.get(0);
            int diff = nuevoStock - stockActual;
            primerLote.setStockActual(Math.max(0, primerLote.getStockActual() + diff));
            loteRepository.save(primerLote);
        } else {
            LoteInventario nuevoLote = LoteInventario.builder()
                    .producto(producto)
                    .codigoLote("LOT-AJUSTE-" + LocalDate.now().getYear())
                    .fechaVencimiento(LocalDate.now().plusMonths(12))
                    .stockActual(nuevoStock)
                    .stockMinimo(5)
                    .precioCompra(0.00)
                    .activo(true)
                    .build();
            loteRepository.save(nuevoLote);
        }

        return ProductoResponseDTO.fromEntity(productoRepository.findById(id).orElse(producto));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarStockBajo(Integer limite) {
        int lim = (limite != null && limite >= 0) ? limite : 10;
        return productoRepository.findAllWithRelations().stream()
                .filter(p -> p.getStock() <= lim)
                .map(ProductoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductoResponseDTO> listarProximosAVencer(Integer dias) {
        int diasLimite = (dias != null && dias > 0) ? dias : 30;
        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(diasLimite);

        return productoRepository.findAllWithRelations().stream()
                .filter(p -> p.getFechaCaducidad() != null && !p.getFechaCaducidad().isBefore(hoy) && !p.getFechaCaducidad().isAfter(fechaLimite))
                .map(ProductoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
