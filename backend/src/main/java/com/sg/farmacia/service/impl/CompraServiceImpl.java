package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.compra.CompraRequestDTO;
import com.sg.farmacia.dto.compra.CompraResponseDTO;
import com.sg.farmacia.dto.compra.DetalleCompraRequestDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.*;
import com.sg.farmacia.service.CompraService;
import com.sg.farmacia.service.LoteInventarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompraServiceImpl implements CompraService {

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final LoteInventarioService loteInventarioService;

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarTodas() {
        return compraRepository.findAllConDetalles().stream()
                .map(CompraResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CompraResponseDTO obtenerPorId(Long id) {
        Compra c = compraRepository.findByIdConDetalles(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con ID: " + id));
        return CompraResponseDTO.fromEntity(c);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarPorProveedor(Long proveedorId) {
        return compraRepository.findByProveedorId(proveedorId).stream()
                .map(CompraResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompraResponseDTO> listarPorRangoFechas(LocalDateTime desde, LocalDateTime hasta) {
        return compraRepository.buscarPorRangoFechas(desde, hasta).stream()
                .map(CompraResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompraResponseDTO registrarCompra(CompraRequestDTO dto) {
        Proveedor proveedor = proveedorRepository.findById(dto.getProveedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + dto.getProveedorId()));

        Usuario usuario = resolverUsuario(dto.getUsuarioId());

        if (dto.getDetalles() == null || dto.getDetalles().isEmpty()) {
            throw new BadRequestException("La compra debe incluir al menos un producto.");
        }

        double totalAcumulado = 0.0;
        List<DetalleCompra> detalles = new ArrayList<>();

        Compra compra = Compra.builder()
                .proveedor(proveedor)
                .usuario(usuario)
                .numeroFactura(dto.getNumeroFactura().trim())
                .fechaCompra(LocalDateTime.now())
                .estado("COMPLETADA")
                .total(0.0)
                .build();

        for (DetalleCompraRequestDTO item : dto.getDetalles()) {
            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + item.getProductoId()));

            double subtotal = redondear(item.getCantidad() * item.getPrecioUnitario());
            totalAcumulado += subtotal;

            DetalleCompra det = DetalleCompra.builder()
                    .compra(compra)
                    .producto(producto)
                    .loteAsignado(item.getLoteAsignado().trim())
                    .fechaVencimiento(item.getFechaVencimiento())
                    .cantidad(item.getCantidad())
                    .precioUnitario(item.getPrecioUnitario())
                    .subtotal(subtotal)
                    .build();

            detalles.add(det);

            // Actualizar o crear lote de inventario automáticamente
            loteInventarioService.registrarOActualizarLote(
                    producto.getId(),
                    item.getLoteAsignado(),
                    item.getFechaVencimiento(),
                    item.getCantidad(),
                    item.getPrecioUnitario()
            );
        }

        compra.setTotal(redondear(totalAcumulado));
        compra.setDetalles(detalles);

        Compra compraGuardada = compraRepository.save(compra);
        log.info("Compra registrada exitosamente con ID: {}, Factura: {}, Total: S/ {}",
                compraGuardada.getId(), compraGuardada.getNumeroFactura(), compraGuardada.getTotal());

        return CompraResponseDTO.fromEntity(compraGuardada);
    }

    private Usuario resolverUsuario(Long usuarioId) {
        if (usuarioId != null) {
            return usuarioRepository.findById(usuarioId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + usuarioId));
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !auth.getName().equalsIgnoreCase("anonymousUser")) {
            return usuarioRepository.findByUsername(auth.getName())
                    .orElseGet(() -> usuarioRepository.findAll().stream().findFirst().orElseThrow(() ->
                            new BadRequestException("No hay usuarios registrados en el sistema.")));
        }

        return usuarioRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BadRequestException("No hay usuarios registrados para asociar la compra."));
    }

    private double redondear(double valor) {
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
