package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.venta.DetalleItemDTO;
import com.sg.farmacia.dto.venta.DetalleVentaResponseDTO;
import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.*;
import com.sg.farmacia.repository.*;
import com.sg.farmacia.service.FidelizacionCrmService;
import com.sg.farmacia.service.VentaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
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
    private final ReciboRepository reciboRepository;
    private final UsuarioRepository usuarioRepository;
    private final MetodoPagoRepository metodoPagoRepository;
    private final LoteInventarioRepository loteRepository;
    private final FidelizacionCrmService fidelizacionService;

    @Override
    @Transactional
    public VentaResponseDTO procesarVenta(VentaRequestDTO dto) {
        log.info("Iniciando procesamiento de venta. RequiereReceta: {}", dto.isRequiereReceta());

        // 1. Validar lista de items
        if (dto.getItems() == null || dto.getItems().isEmpty()) {
            throw new BadRequestException("La venta debe contener al menos un producto en la lista de items.");
        }

        // 2. Resolver Cliente, Usuario y Método de Pago
        Cliente cliente = resolverCliente(dto);
        Usuario usuario = resolverUsuario(dto.getUsuarioId());
        MetodoPago metodoPago = resolverMetodoPago(dto.getMetodoPagoId(), dto.getMetodoPago());

        boolean requiereRecetaFinal = dto.isRequiereReceta();

        // 3. Procesar items con estrategia FEFO para descuento de lotes
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

            if (Boolean.TRUE.equals(producto.getRequiereReceta())) {
                requiereRecetaFinal = true;
            }

            // Seleccionar lote(s) con stock disponible
            int cantidadRestante = item.getCantidad();
            List<LoteInventario> lotesDisponibles;

            if (item.getLoteId() != null) {
                LoteInventario loteEspecifico = loteRepository.findById(item.getLoteId())
                        .orElseThrow(() -> new ResourceNotFoundException("Lote no encontrado con ID: " + item.getLoteId()));
                lotesDisponibles = List.of(loteEspecifico);
            } else {
                // Estrategia FEFO: Primer lote que vence, primero en salir
                lotesDisponibles = loteRepository.findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(producto.getId());
            }

            int stockTotalDisponible = lotesDisponibles.stream()
                    .mapToInt(l -> l.getStockActual() != null ? l.getStockActual() : 0)
                    .sum();

            if (stockTotalDisponible < cantidadRestante) {
                throw new BadRequestException("Stock insuficiente para el producto: " + producto.getNombre() +
                        ". Stock disponible: " + stockTotalDisponible + ", solicitado: " + cantidadRestante);
            }

            double precioUnitario = producto.getPrecioBaseVenta();

            for (LoteInventario lote : lotesDisponibles) {
                if (cantidadRestante <= 0) break;
                int disponibleEnLote = lote.getStockActual() != null ? lote.getStockActual() : 0;
                if (disponibleEnLote <= 0) continue;

                int aDescontar = Math.min(disponibleEnLote, cantidadRestante);
                lote.setStockActual(disponibleEnLote - aDescontar);
                loteRepository.save(lote);

                double subtotalItem = redondear(precioUnitario * aDescontar);
                subtotalAcumulado += subtotalItem;

                DetalleVenta det = DetalleVenta.builder()
                        .lote(lote)
                        .cantidad(aDescontar)
                        .precioUnitario(precioUnitario)
                        .descuento(0.00)
                        .subtotal(subtotalItem)
                        .build();

                detalles.add(det);
                cantidadRestante -= aDescontar;
            }
        }

        // Si la venta incluye medicamentos con receta, exigir cliente
        if (requiereRecetaFinal && cliente == null) {
            throw new BadRequestException("La venta incluye productos bajo receta médica; es obligatorio registrar o asociar un cliente válido.");
        }

        // 4. Calcular Descuento por Cliente Amigo (si aplica)
        double descuentoTotal = 0.0;
        boolean esAmigo = cliente != null && cliente.isEsClienteAmigo();

        if (esAmigo) {
            Double porcentaje = cliente.getPorcentajeDescuento();
            if (porcentaje == null || porcentaje <= 0.0) {
                porcentaje = 5.0; // Descuento estándar del 5%
            }
            double tasa = (porcentaje > 1.0) ? (porcentaje / 100.0) : porcentaje;
            descuentoTotal = redondear(subtotalAcumulado * tasa);
        }

        // 5. Calcular Impuesto (18% IGV en Perú) y Total
        double subtotal = redondear(subtotalAcumulado);
        double montoBase = redondear(Math.max(0.0, subtotal - descuentoTotal));
        double impuesto = redondear(montoBase * 0.18);
        double total = redondear(montoBase + impuesto);

        // 6. Generar número correlativo de venta
        long nextVentaId = (ventaRepository.findMaxId() != null ? ventaRepository.findMaxId() : 0L) + 1;
        int anio = LocalDate.now().getYear();
        String numeroVenta = String.format("VTA-%d-%06d", anio, nextVentaId);

        // 7. Guardar Venta
        Venta venta = Venta.builder()
                .numeroVenta(numeroVenta)
                .fecha(LocalDateTime.now())
                .subtotal(subtotal)
                .impuesto(impuesto)
                .descuentoTotal(descuentoTotal)
                .total(total)
                .cliente(cliente)
                .usuario(usuario)
                .metodoPago(metodoPago)
                .estado("COMPLETADA")
                .observaciones(dto.getObservaciones())
                .detalles(new ArrayList<>())
                .build();

        for (DetalleVenta det : detalles) {
            venta.addDetalle(det);
        }

        Venta ventaGuardada = ventaRepository.save(venta);

        // 8. Generar Recibo Fiscal
        long nextReciboId = (reciboRepository.findMaxId() != null ? reciboRepository.findMaxId() : 0L) + 1;
        String tipoComprobante = (dto.getTipoComprobante() != null && !dto.getTipoComprobante().isBlank())
                ? dto.getTipoComprobante().trim().toUpperCase()
                : "BOLETA";

        String serie = tipoComprobante.contains("FACTURA") ? "F001" : "B001";
        String correlativo = String.format("%08d", nextReciboId);
        String numeroRecibo = serie + "-" + correlativo;

        String clienteNom = cliente != null ? cliente.getNombreCompleto() : "PÚBLICO GENERAL";
        String clienteDoc = cliente != null ? cliente.getNumeroDocumento() : "00000000";
        String clienteDir = cliente != null ? cliente.getDireccion() : "VENTA EN MOSTRADOR";

        Recibo recibo = Recibo.builder()
                .numeroRecibo(numeroRecibo)
                .serie(serie)
                .correlativo(correlativo)
                .tipoComprobante(tipoComprobante)
                .fechaEmision(ventaGuardada.getFecha())
                .montoSubtotal(subtotal)
                .montoImpuesto(impuesto)
                .montoDescuento(descuentoTotal)
                .montoTotal(total)
                .metodoPago(metodoPago.getNombre())
                .venta(ventaGuardada)
                .clienteNombre(clienteNom)
                .clienteDocumento(clienteDoc)
                .clienteDireccion(clienteDir)
                .build();

        Recibo reciboGuardado = reciboRepository.save(recibo);
        ventaGuardada.setRecibo(reciboGuardado);

        // 9. Si es Cliente Amigo, acumular puntos
        if (esAmigo) {
            int puntosGanados = (int) (total / 10.0);
            if (puntosGanados > 0) {
                fidelizacionService.acumularPuntos(cliente.getId(), puntosGanados);
            }
        }

        log.info("Venta procesada con éxito: Venta {}, Recibo {}, Total S/ {}",
                numeroVenta, numeroRecibo, total);

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
    public List<VentaResponseDTO> listarHistorial(LocalDate fechaInicio, LocalDate fechaFin, String dniCliente) {
        LocalDateTime desde = (fechaInicio != null) ? fechaInicio.atStartOfDay() : null;
        LocalDateTime hasta = (fechaFin != null) ? fechaFin.atTime(LocalTime.MAX) : null;
        String dni = (dniCliente != null && !dniCliente.trim().isEmpty()) ? dniCliente.trim() : null;

        return ventaRepository.buscarHistorial(desde, hasta, dni).stream()
                .map(v -> mapearAVentaResponse(v, v.getCliente() != null && v.getCliente().isEsClienteAmigo()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VentaResponseDTO> listarPorClienteId(Long clienteId) {
        return ventaRepository.findByClienteId(clienteId).stream()
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
        if (dto.getClienteId() != null) {
            Cliente c = clienteRepository.findById(dto.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + dto.getClienteId()));
            if (!Boolean.TRUE.equals(c.getActivo())) {
                throw new BadRequestException("El cliente con ID " + dto.getClienteId() + " no está activo.");
            }
            return c;
        }

        if (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty()) {
            return clienteRepository.findByNumeroClienteAmigo(dto.getNumeroClienteAmigo().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontró cliente con código de afiliado: " + dto.getNumeroClienteAmigo()));
        }

        return null;
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
                .orElseThrow(() -> new BadRequestException("No hay usuarios registrados en el sistema para asociar la venta."));
    }

    private MetodoPago resolverMetodoPago(Long id, String nombre) {
        if (id != null) {
            return metodoPagoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return metodoPagoRepository.findByNombre(nombre.trim())
                    .orElseGet(() -> metodoPagoRepository.save(MetodoPago.builder().nombre(nombre.trim()).activo(true).build()));
        }
        return metodoPagoRepository.findByNombre("Efectivo")
                .orElseGet(() -> metodoPagoRepository.save(MetodoPago.builder().nombre("Efectivo").activo(true).build()));
    }

    private VentaResponseDTO mapearAVentaResponse(Venta venta, boolean esAmigo) {
        List<DetalleVentaResponseDTO> detallesDTO = (venta.getDetalles() != null)
                ? venta.getDetalles().stream()
                .map(d -> DetalleVentaResponseDTO.builder()
                        .id(d.getId())
                        .productoId(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getId() : null)
                        .productoNombre(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getNombre() : "")
                        .codigoBarras(d.getLote() != null && d.getLote().getProducto() != null ? d.getLote().getProducto().getCodigo() : "")
                        .loteId(d.getLote() != null ? d.getLote().getId() : null)
                        .codigoLote(d.getLote() != null ? d.getLote().getCodigoLote() : "")
                        .cantidad(d.getCantidad())
                        .precioUnitario(d.getPrecioUnitario())
                        .descuento(d.getDescuento())
                        .subtotalItem(d.getSubtotal())
                        .subtotal(d.getSubtotal())
                        .build())
                .collect(Collectors.toList())
                : new ArrayList<>();

        String numRecibo = venta.getRecibo() != null ? venta.getRecibo().getNumeroRecibo() : null;
        Long reciboId = venta.getRecibo() != null ? venta.getRecibo().getId() : null;

        return VentaResponseDTO.builder()
                .id(venta.getId())
                .numeroVenta(venta.getNumeroVenta())
                .fecha(venta.getFecha())
                .fechaVenta(venta.getFecha())
                .subtotal(venta.getSubtotal())
                .impuesto(venta.getImpuesto())
                .igv(venta.getImpuesto())
                .descuentoTotal(venta.getDescuentoTotal())
                .total(venta.getTotal())
                .requiereReceta(venta.isRequiereReceta())
                .clienteId(venta.getCliente() != null ? venta.getCliente().getId() : null)
                .clienteNombre(venta.getCliente() != null ? venta.getCliente().getNombreCompleto() : "PÚBLICO GENERAL")
                .clienteDocumento(venta.getCliente() != null ? venta.getCliente().getNumeroDocumento() : "00000000")
                .esClienteAmigo(esAmigo)
                .usuarioId(venta.getUsuario() != null ? venta.getUsuario().getId() : null)
                .usuarioNombre(venta.getUsuario() != null ? venta.getUsuario().getNombre() : null)
                .reciboId(reciboId)
                .numeroRecibo(numRecibo)
                .codigoComprobante(numRecibo)
                .metodoPagoId(venta.getMetodoPago() != null ? venta.getMetodoPago().getId() : null)
                .metodoPago(venta.getMetodoPago() != null ? venta.getMetodoPago().getNombre() : "EFECTIVO")
                .tipoComprobante(venta.getTipoComprobante())
                .estado(venta.getEstado())
                .observaciones(venta.getObservaciones())
                .detalles(detallesDTO)
                .build();
    }

    private double redondear(double valor) {
        return BigDecimal.valueOf(valor).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
