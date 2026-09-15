package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.*;
import com.farmacia.sgf.repository.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class VentaController {

    private final VentaRepository ventaRepository;
    private final ProductoRepository productoRepository;
    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoInventarioRepository movimientoRepository;

    @GetMapping
    public ResponseEntity<List<Venta>> getAll() {
        return ResponseEntity.ok(ventaRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Venta> getById(@PathVariable Long id) {
        return ventaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Venta> createVenta(@RequestBody CreateVentaDTO req) {
        Usuario usuario = usuarioRepository.findById(req.getUsuarioId() != null ? req.getUsuarioId() : 1L)
                .orElseGet(() -> usuarioRepository.findAll().stream().findFirst().orElse(null));

        Cliente cliente = null;
        if (req.getClienteId() != null) {
            cliente = clienteRepository.findById(req.getClienteId()).orElse(null);
        }

        BigDecimal rawSubtotal = BigDecimal.ZERO;
        List<DetalleVenta> detallesProcesados = new ArrayList<>();

        Venta venta = Venta.builder()
                .numeroVenta("VTA-" + System.currentTimeMillis() / 1000)
                .cliente(cliente)
                .usuario(usuario)
                .metodoPago(req.getMetodoPago() != null ? req.getMetodoPago() : MetodoPago.EFECTIVO)
                .tipoComprobante(req.getTipoComprobante() != null ? req.getTipoComprobante() : TipoComprobante.TICKET)
                .observaciones(req.getObservaciones())
                .estado(EstadoVenta.COMPLETADA)
                .build();

        for (CreateDetalleVentaDTO itemReq : req.getDetalles()) {
            Producto producto = productoRepository.findById(itemReq.getProductoId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + itemReq.getProductoId()));

            int stockAnterior = producto.getStock();
            int nuevoStock = Math.max(0, stockAnterior - itemReq.getCantidad());
            producto.setStock(nuevoStock);
            productoRepository.save(producto);

            // Registrar movimiento de kardex
            MovimientoInventario mov = MovimientoInventario.builder()
                    .producto(producto)
                    .tipo(TipoMovimiento.SALIDA)
                    .cantidad(itemReq.getCantidad())
                    .stockAnterior(stockAnterior)
                    .stockNuevo(nuevoStock)
                    .motivo("Venta POS - " + venta.getNumeroVenta())
                    .usuario(usuario != null ? usuario.getUsername() : "CAJERO")
                    .build();
            movimientoRepository.save(mov);

            BigDecimal desc = itemReq.getDescuento() != null ? itemReq.getDescuento() : BigDecimal.ZERO;
            BigDecimal sub = producto.getPrecio().multiply(BigDecimal.valueOf(itemReq.getCantidad())).subtract(desc);
            rawSubtotal = rawSubtotal.add(sub);

            DetalleVenta detalle = DetalleVenta.builder()
                    .venta(venta)
                    .producto(producto)
                    .cantidad(itemReq.getCantidad())
                    .precioUnitario(producto.getPrecio())
                    .descuento(desc)
                    .subtotal(sub)
                    .build();

            detallesProcesados.add(detalle);
        }

        BigDecimal descuentoClienteAmigo = BigDecimal.ZERO;
        if (cliente != null && cliente.isEsClienteAmigo()) {
            descuentoClienteAmigo = rawSubtotal.multiply(new BigDecimal("0.05")).setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalFinal = rawSubtotal.subtract(descuentoClienteAmigo);
        BigDecimal baseImponible = totalFinal.divide(new BigDecimal("1.18"), 2, RoundingMode.HALF_UP);
        BigDecimal igv = totalFinal.subtract(baseImponible);

        venta.setDetalles(detallesProcesados);
        venta.setSubtotal(rawSubtotal);
        venta.setDescuentoTotal(descuentoClienteAmigo);
        venta.setImpuesto(igv);
        venta.setTotal(totalFinal);

        Venta guardada = ventaRepository.save(venta);
        return ResponseEntity.ok(guardada);
    }

    @Data
    public static class CreateVentaDTO {
        private Long clienteId;
        private Long usuarioId;
        private MetodoPago metodoPago;
        private TipoComprobante tipoComprobante;
        private List<CreateDetalleVentaDTO> detalles;
        private String observaciones;
    }

    @Data
    public static class CreateDetalleVentaDTO {
        private Long productoId;
        private Integer cantidad;
        private BigDecimal descuento;
    }
}
