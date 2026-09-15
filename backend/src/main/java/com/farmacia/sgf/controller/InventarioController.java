package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.MovimientoInventario;
import com.farmacia.sgf.model.Producto;
import com.farmacia.sgf.model.TipoMovimiento;
import com.farmacia.sgf.repository.MovimientoInventarioRepository;
import com.farmacia.sgf.repository.ProductoRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class InventarioController {

    private final MovimientoInventarioRepository movimientoRepository;
    private final ProductoRepository productoRepository;

    @GetMapping("/movimientos")
    public ResponseEntity<List<MovimientoInventario>> getMovimientos() {
        return ResponseEntity.ok(movimientoRepository.findAll());
    }

    @GetMapping("/movimientos/producto/{productoId}")
    public ResponseEntity<List<MovimientoInventario>> getByProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(movimientoRepository.findByProductoId(productoId));
    }

    @PostMapping("/ajustar")
    @Transactional
    public ResponseEntity<MovimientoInventario> ajustarStock(@RequestBody AjusteStockDTO req) {
        Producto producto = productoRepository.findById(req.getProductoId())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado ID: " + req.getProductoId()));

        int stockAnterior = producto.getStock();
        int stockNuevo = req.getNuevoStock() != null ? req.getNuevoStock() : stockAnterior;

        producto.setStock(stockNuevo);
        productoRepository.save(producto);

        MovimientoInventario mov = MovimientoInventario.builder()
                .producto(producto)
                .tipo(req.getTipo() != null ? req.getTipo() : TipoMovimiento.AJUSTE)
                .cantidad(Math.abs(stockNuevo - stockAnterior))
                .stockAnterior(stockAnterior)
                .stockNuevo(stockNuevo)
                .motivo(req.getMotivo() != null ? req.getMotivo() : "Ajuste manual de stock")
                .usuario(req.getUsuario() != null ? req.getUsuario() : "ADMIN")
                .build();

        return ResponseEntity.ok(movimientoRepository.save(mov));
    }

    @Data
    public static class AjusteStockDTO {
        private Long productoId;
        private Integer nuevoStock;
        private TipoMovimiento tipo;
        private String motivo;
        private String usuario;
    }
}
