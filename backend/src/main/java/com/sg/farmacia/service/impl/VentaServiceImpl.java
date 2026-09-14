package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.venta.DetalleItemDTO;
import com.sg.farmacia.dto.venta.DetalleVentaResponseDTO;
import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.model.DetalleVenta;
import com.sg.farmacia.model.Producto;
import com.sg.farmacia.model.Venta;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.repository.ProductoRepository;
import com.sg.farmacia.repository.VentaRepository;
import com.sg.farmacia.service.VentaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class VentaServiceImpl implements VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;

    @Override
    @Transactional
    public VentaResponseDTO procesarVenta(VentaRequestDTO dto) {
        log.info("Iniciando procesamiento de venta. RequiereReceta: {}", dto.isRequiereReceta());

        // 1. Validar lista de items
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("La venta debe contener al menos un producto en la lista de items.");
        }

        // 2. Resolver Cliente y validaciones de Receta Médica / Cliente Amigo
        Cliente cliente = resolverCliente(dto);
        boolean requiereRecetaFinal = dto.isRequiereReceta();

        // 3. Procesar items, validar stock y calcular montos
        double subtotalAcumulado = 0.0;
        List<DetalleVenta> detalles = new ArrayList<>();

        for (DetalleItemDTO item : dto.getItems()) {
            if (item.getProductoId() == null) {
                throw new BadRequestException("El identificador del producto es obligatorio.");
            }
            if (item.getCantidad() == null || item.getCantidad() <= 0) {
                throw new BadRequestException("La cantidad solicitada debe ser mayor a cero.");
            }

            Producto producto = productoRepository.findById(item.getProductoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + item.getProductoId()));

            if (!Boolean.TRUE.equals(producto.getActivo())) {
                throw new BadRequestException("El producto '" + producto.getNombre() + "' no se encuentra activo para la venta.");
            }

            // Validar stock disponible
            int stockActual = producto.getStock() != null ? producto.getStock() : 0;
            if (stockActual < item.getCantidad()) {
                throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre() +
                        ". Stock disponible: " + stockActual + ", solicitado: " + item.getCantidad());
            }

            // Si el producto requiere receta médica de forma individual
            if (Boolean.TRUE.equals(producto.getRequiereReceta())) {
                requiereRecetaFinal = true;
            }

            // Calcular montos del item
            double precioUnitario = producto.getPrecioVenta();
            double subtotalItem = redondear(precioUnitario * item.getCantidad());
            subtotalAcumulado += subtotalItem;

            // Descontar automáticamente el stock del producto
            producto.setStock(stockActual - item.getCantidad());
            productoRepository.save(producto);

            // Crear detalle
            DetalleVenta detalle = DetalleVenta.builder()
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(precioUnitario)
                    .subtotalItem(subtotalItem)
                    .build();

            detalles.add(detalle);
        }

        // Si la venta o alguno de sus medicamentos exige receta, validar cliente obligatorio
        if (requiereRecetaFinal && cliente == null) {
            throw new BadRequestException("La venta incluye productos bajo receta médica; es obligatorio asociar un cliente válido (clienteId).");
        }

        // 4. Calcular Descuento por Cliente Amigo (si aplica)
        double descuentoTotal = 0.0;
        boolean esAmigo = cliente != null && (cliente.isEsClienteAmigo() ||
                (cliente.getNumeroClienteAmigo() != null && !cliente.getNumeroClienteAmigo().isBlank()));

        if (esAmigo) {
            Double porcentaje = cliente.getPorcentajeDescuento();
            if (porcentaje == null || porcentaje <= 0.0) {
                porcentaje = 5.0; // Descuento estándar del 5% por fidelización
            }
            double tasa = (porcentaje > 1.0) ? (porcentaje / 100.0) : porcentaje;
            descuentoTotal = redondear(subtotalAcumulado * tasa);
        }

        // 5. Calcular IGV (18%) y Total
        double subtotal = redondear(subtotalAcumulado);
        double montoBase = redondear(Math.max(0.0, subtotal - descuentoTotal));
        double igv = redondear(montoBase * 0.18);
        double total = redondear(montoBase + igv);

        // 6. Si es Cliente Amigo, acreditar puntos de fidelidad
        if (esAmigo) {
            int puntosGanados = (int) (total / 10.0);
            if (puntosGanados > 0) {
                int puntosPrevios = cliente.getPuntosFidelidad() != null ? cliente.getPuntosFidelidad() : 0;
                cliente.setPuntosFidelidad(puntosPrevios + puntosGanados);
                clienteRepository.save(cliente);
            }
        }

        // 7. Crear y persistir la Venta junto a sus Detalles
        Venta venta = Venta.builder()
                .fechaVenta(LocalDateTime.now())
                .subtotal(subtotal)
                .igv(igv)
                .descuentoTotal(descuentoTotal)
                .total(total)
                .requiereReceta(requiereRecetaFinal)
                .cliente(cliente)
                .detalles(new ArrayList<>())
                .build();

        for (DetalleVenta detalle : detalles) {
            venta.addDetalle(detalle);
        }

        Venta ventaGuardada = ventaRepository.save(venta);
        log.info("Venta procesada exitosamente con ID: {}, Total: S/ {}", ventaGuardada.getId(), ventaGuardada.getTotal());

        return mapearAVentaResponse(ventaGuardada, esAmigo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarTodas() {
        return ventaRepository.findAllConDetalles().stream()
                .map(v -> mapearAVentaResponse(v, v.getCliente() != null && v.getCliente().isEsClienteAmigo()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VentaResponseDTO obtenerPorId(Long id) {
        Venta venta = ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + id));
        boolean esAmigo = venta.getCliente() != null && venta.getCliente().isEsClienteAmigo();
        return mapearAVentaResponse(venta, esAmigo);
    }

    // =========================================================================
    // Métodos Auxiliares
    // =========================================================================

    private Cliente resolverCliente(VentaRequestDTO dto) {
        Cliente cliente = null;

        // 1. Por clienteId
        if (dto.getClienteId() != null) {
            cliente = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + dto.getClienteId()));

            if (!Boolean.TRUE.equals(cliente.getActivo())) {
                throw new BadRequestException("El cliente con ID " + dto.getClienteId() + " no está activo.");
            }
        }

        // 2. Por número de Cliente Amigo
        if (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty()) {
            Cliente clientePorNumero = clienteRepository.findByNumeroClienteAmigo(dto.getNumeroClienteAmigo().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró cliente con el número de Cliente Amigo: " + dto.getNumeroClienteAmigo()));

            if (!Boolean.TRUE.equals(clientePorNumero.getActivo())) {
                throw new BadRequestException("El Cliente Amigo '" + dto.getNumeroClienteAmigo() + "' no se encuentra activo.");
            }

            if (cliente != null && !cliente.getId().equals(clientePorNumero.getId())) {
                throw new BadRequestException("El clienteId proporcionado (" + cliente.getId() +
                        ") no coincide con el cliente asociado al número Cliente Amigo (" + clientePorNumero.getId() + ").");
            }
            cliente = clientePorNumero;
        }

        return cliente;
    }

    private VentaResponseDTO mapearAVentaResponse(Venta venta, boolean esAmigo) {
        List<DetalleVentaResponseDTO> detallesDTO = venta.getDetalles().stream()
                .map(d -> DetalleVentaResponseDTO.builder()
                        .id(d.getId())
                        .productoId(d.getProducto() != null ? d.getProducto().getId() : null)
                        .productoNombre(d.getProducto() != null ? d.getProducto().getNombre() : "")
                        .codigoBarras(d.getProducto() != null ? d.getProducto().getCodigoBarras() : "")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .subtotalItem(d.getSubtotalItem())
                        .build())
                .collect(Collectors.toList());

        return VentaResponseDTO.builder()
                .id(venta.getId())
                .fechaVenta(venta.getFechaVenta())
                .subtotal(venta.getSubtotal())
                .igv(venta.getIgv())
                .descuentoTotal(venta.getDescuentoTotal())
                .total(venta.getTotal())
                .requiereReceta(venta.isRequiereReceta())
                .clienteId(venta.getCliente() != null ? venta.getCliente().getId() : null)
                .clienteNombre(venta.getCliente() != null ? venta.getCliente().getNombreCompleto() : "Público General")
                .clienteDocumento(venta.getCliente() != null ? venta.getCliente().getDniRuc() : "Sin Documento")
                .esClienteAmigo(esAmigo)
                .detalles(detallesDTO)
                .build();
    }

    private double redondear(double valor) {
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
