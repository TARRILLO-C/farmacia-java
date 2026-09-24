package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.lote.LoteRequestDTO;
import com.sg.farmacia.dto.lote.LoteResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.LoteInventario;
import com.sg.farmacia.model.Producto;
import com.sg.farmacia.repository.LoteInventarioRepository;
import com.sg.farmacia.repository.ProductoRepository;
import com.sg.farmacia.service.LoteInventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LoteInventarioServiceImpl implements LoteInventarioService {

    private final LoteInventarioRepository loteRepository;
    private final ProductoRepository productoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarTodos() {
        return loteRepository.findAll().stream()
                .map(LoteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarPorProductoId(Long productoId) {
        return loteRepository.findByProductoId(productoId).stream()
                .map(LoteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarStockBajo() {
        return loteRepository.findLotesBajoStock().stream()
                .map(LoteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LoteResponseDTO> listarProximosAVencer(int dias) {
        LocalDate fechaLimite = LocalDate.now().plusDays(dias);
        return loteRepository.findLotesProximosAVencer(fechaLimite).stream()
                .map(LoteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LoteResponseDTO obtenerPorId(Long id) {
        LoteInventario lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote de inventario no encontrado con ID: " + id));
        return LoteResponseDTO.fromEntity(lote);
    }

    @Override
    @Transactional
    public LoteResponseDTO crear(LoteRequestDTO dto) {
        Producto producto = productoRepository.findById(dto.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + dto.getProductoId()));

        String codLote = dto.getCodigoLote().trim();
        if (loteRepository.existsByProductoIdAndCodigoLote(producto.getId(), codLote)) {
            throw new BadRequestException("Ya existe un lote con el código '" + codLote + "' para el producto '" + producto.getNombre() + "'.");
        }

        LoteInventario lote = LoteInventario.builder()
                .producto(producto)
                .codigoLote(codLote)
                .fechaVencimiento(dto.getFechaVencimiento())
                .stockActual(dto.getStockActual())
                .stockMinimo(dto.getStockMinimo() != null ? dto.getStockMinimo() : 5)
                .precioCompra(dto.getPrecioCompra() != null ? dto.getPrecioCompra() : 0.00)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return LoteResponseDTO.fromEntity(loteRepository.save(lote));
    }

    @Override
    @Transactional
    public LoteResponseDTO actualizar(Long id, LoteRequestDTO dto) {
        LoteInventario lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote de inventario no encontrado con ID: " + id));

        String codLote = dto.getCodigoLote().trim();
        loteRepository.findByProductoIdAndCodigoLote(lote.getProducto().getId(), codLote).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new BadRequestException("Ya existe otro lote registrado con el código '" + codLote + "' para este producto.");
            }
        });

        lote.setCodigoLote(codLote);
        lote.setFechaVencimiento(dto.getFechaVencimiento());
        lote.setStockActual(dto.getStockActual());
        if (dto.getStockMinimo() != null) {
            lote.setStockMinimo(dto.getStockMinimo());
        }
        if (dto.getPrecioCompra() != null) {
            lote.setPrecioCompra(dto.getPrecioCompra());
        }
        if (dto.getActivo() != null) {
            lote.setActivo(dto.getActivo());
        }

        return LoteResponseDTO.fromEntity(loteRepository.save(lote));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        LoteInventario lote = loteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lote de inventario no encontrado con ID: " + id));
        lote.setActivo(false);
        loteRepository.save(lote);
    }

    @Override
    @Transactional
    public LoteInventario registrarOActualizarLote(Long productoId, String codigoLote, LocalDate fechaVencimiento, int cantidad, double precioCompra) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + productoId));

        String cod = codigoLote.trim();
        LoteInventario lote = loteRepository.findByProductoIdAndCodigoLote(productoId, cod)
                .orElse(LoteInventario.builder()
                        .producto(producto)
                        .codigoLote(cod)
                        .fechaVencimiento(fechaVencimiento)
                        .stockActual(0)
                        .stockMinimo(5)
                        .precioCompra(precioCompra)
                        .activo(true)
                        .build());

        lote.setStockActual(lote.getStockActual() + cantidad);
        lote.setPrecioCompra(precioCompra);
        lote.setFechaVencimiento(fechaVencimiento);
        lote.setActivo(true);

        return loteRepository.save(lote);
    }

    @Override
    @Transactional
    public void descontarStockLote(Long loteId, int cantidad) {
        LoteInventario lote = loteRepository.findById(loteId)
                .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con ID: " + loteId));

        if (lote.getStockActual() < cantidad) {
            throw new BadRequestException("Stock insuficiente en el lote " + lote.getCodigoLote() +
                    ". Disponible: " + lote.getStockActual() + ", solicitado: " + cantidad);
        }

        lote.setStockActual(lote.getStockActual() - cantidad);
        loteRepository.save(lote);
    }
}
