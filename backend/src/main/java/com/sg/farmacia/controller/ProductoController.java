package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.producto.AjusteStockRequestDTO;
import com.sg.farmacia.dto.producto.ProductoRequestDTO;
import com.sg.farmacia.dto.producto.ProductoResponseDTO;
import com.sg.farmacia.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductoResponseDTO>>> listarTodos(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoriaId) {
        List<ProductoResponseDTO> productos = productoService.listarTodos(search, categoriaId);
        return ResponseEntity.ok(ApiResponse.success(productos, "Listado de productos obtenido con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductoResponseDTO>> obtenerPorId(@PathVariable Long id) {
        ProductoResponseDTO producto = productoService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(producto, "Producto encontrado con éxito"));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<ProductoResponseDTO>> obtenerPorCodigo(@PathVariable String codigo) {
        ProductoResponseDTO producto = productoService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(ApiResponse.success(producto, "Producto encontrado por código de barras"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductoResponseDTO>> crear(@Valid @RequestBody ProductoRequestDTO dto) {
        ProductoResponseDTO nuevoProducto = productoService.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(nuevoProducto, "Producto registrado exitosamente en el inventario"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductoResponseDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequestDTO dto) {
        ProductoResponseDTO productoActualizado = productoService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.success(productoActualizado, "Producto actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Producto eliminado exitosamente"));
    }

    @PatchMapping("/{id}/ajustar-stock")
    public ResponseEntity<ApiResponse<ProductoResponseDTO>> ajustarStock(
            @PathVariable Long id,
            @Valid @RequestBody AjusteStockRequestDTO dto) {
        ProductoResponseDTO producto = productoService.ajustarStock(id, dto);
        return ResponseEntity.ok(ApiResponse.success(producto, "Stock del producto ajustado exitosamente"));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<ApiResponse<List<ProductoResponseDTO>>> listarStockBajo(
            @RequestParam(required = false, defaultValue = "10") Integer limite) {
        List<ProductoResponseDTO> productos = productoService.listarStockBajo(limite);
        return ResponseEntity.ok(ApiResponse.success(productos, "Productos con bajo stock obtenidos con éxito"));
    }

    @GetMapping("/proximos-a-vencer")
    public ResponseEntity<ApiResponse<List<ProductoResponseDTO>>> listarProximosAVencer(
            @RequestParam(required = false, defaultValue = "30") Integer dias) {
        List<ProductoResponseDTO> productos = productoService.listarProximosAVencer(dias);
        return ResponseEntity.ok(ApiResponse.success(productos, "Productos próximos a vencer obtenidos con éxito"));
    }
}
