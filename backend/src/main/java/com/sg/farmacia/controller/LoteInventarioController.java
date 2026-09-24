package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.lote.LoteRequestDTO;
import com.sg.farmacia.dto.lote.LoteResponseDTO;
import com.sg.farmacia.service.LoteInventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/lotes")
@RequiredArgsConstructor
public class LoteInventarioController {

    private final LoteInventarioService loteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoteResponseDTO>>> listarTodos(@RequestParam(required = false) Long productoId) {
        List<LoteResponseDTO> lista = (productoId != null)
                ? loteService.listarPorProductoId(productoId)
                : loteService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(lista, "Lotes de inventario obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LoteResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(loteService.obtenerPorId(id), "Lote obtenido con éxito"));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<ApiResponse<List<LoteResponseDTO>>> listarStockBajo() {
        return ResponseEntity.ok(ApiResponse.success(loteService.listarStockBajo(), "Lotes con stock bajo"));
    }

    @GetMapping("/proximos-a-vencer")
    public ResponseEntity<ApiResponse<List<LoteResponseDTO>>> listarProximosAVencer(@RequestParam(required = false, defaultValue = "30") int dias) {
        return ResponseEntity.ok(ApiResponse.success(loteService.listarProximosAVencer(dias), "Lotes próximos a vencer"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LoteResponseDTO>> crear(@Valid @RequestBody LoteRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(loteService.crear(dto), "Lote de inventario registrado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LoteResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody LoteRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(loteService.actualizar(id, dto), "Lote actualizado con éxito"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        loteService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Lote deshabilitado"));
    }
}
