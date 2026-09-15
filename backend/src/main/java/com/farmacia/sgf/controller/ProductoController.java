package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.Producto;
import com.farmacia.sgf.repository.CategoriaRepository;
import com.farmacia.sgf.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @GetMapping
    public ResponseEntity<List<Producto>> getAll() {
        return ResponseEntity.ok(productoRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> getById(@PathVariable Long id) {
        return productoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/bajo-stock")
    public ResponseEntity<List<Producto>> getBajoStock() {
        return ResponseEntity.ok(productoRepository.findProductosBajoStock());
    }

    @PostMapping
    public ResponseEntity<Producto> create(@RequestBody Producto producto) {
        if (producto.getCategoria() != null && producto.getCategoria().getId() != null) {
            categoriaRepository.findById(producto.getCategoria().getId()).ifPresent(producto::setCategoria);
        }
        Producto guardado = productoRepository.save(producto);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> update(@PathVariable Long id, @RequestBody Producto req) {
        return productoRepository.findById(id).map(prod -> {
            prod.setCodigo(req.getCodigo());
            prod.setNombre(req.getNombre());
            prod.setDescripcion(req.getDescripcion());
            prod.setPrincipioActivo(req.getPrincipioActivo());
            prod.setPresentacion(req.getPresentacion());
            prod.setLaboratorio(req.getLaboratorio());
            prod.setPrecio(req.getPrecio());
            prod.setStock(req.getStock());
            prod.setStockMinimo(req.getStockMinimo());
            prod.setRequiereReceta(req.getRequiereReceta());
            prod.setActivo(req.getActivo());
            if (req.getCategoria() != null && req.getCategoria().getId() != null) {
                categoriaRepository.findById(req.getCategoria().getId()).ifPresent(prod::setCategoria);
            }
            return ResponseEntity.ok(productoRepository.save(prod));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (productoRepository.existsById(id)) {
            productoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
