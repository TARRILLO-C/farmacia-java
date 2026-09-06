package com.farmacia.sgf.controller;

import com.farmacia.sgf.dto.ApiResponse;
import com.farmacia.sgf.dto.categoria.CategoriaRequestDTO;
import com.farmacia.sgf.dto.categoria.CategoriaResponseDTO;
import com.farmacia.sgf.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoriaResponseDTO>>> listarTodas() {
        List<CategoriaResponseDTO> categorias = categoriaService.listarTodas();
        return ResponseEntity.ok(ApiResponse.success(categorias, "Listado de categorías obtenido con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriaResponseDTO>> obtenerPorId(@PathVariable Long id) {
        CategoriaResponseDTO categoria = categoriaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(categoria, "Categoría encontrada"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CategoriaResponseDTO>> crear(@Valid @RequestBody CategoriaRequestDTO dto) {
        CategoriaResponseDTO nuevaCategoria = categoriaService.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(nuevaCategoria, "Categoría registrada exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoriaResponseDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequestDTO dto) {
        CategoriaResponseDTO categoriaActualizada = categoriaService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.success(categoriaActualizada, "Categoría actualizada exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Categoría eliminada exitosamente"));
    }
}
