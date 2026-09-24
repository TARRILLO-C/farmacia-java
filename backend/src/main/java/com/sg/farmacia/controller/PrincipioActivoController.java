package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.principioactivo.PrincipioActivoRequestDTO;
import com.sg.farmacia.dto.principioactivo.PrincipioActivoResponseDTO;
import com.sg.farmacia.service.PrincipioActivoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/principios-activos")
@RequiredArgsConstructor
public class PrincipioActivoController {

    private final PrincipioActivoService principioActivoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PrincipioActivoResponseDTO>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.success(principioActivoService.listarTodos(), "Principios activos obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipioActivoResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(principioActivoService.obtenerPorId(id), "Principio activo obtenido"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PrincipioActivoResponseDTO>> crear(@Valid @RequestBody PrincipioActivoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(principioActivoService.crear(dto), "Principio activo creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PrincipioActivoResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody PrincipioActivoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(principioActivoService.actualizar(id, dto), "Principio activo actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        principioActivoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Principio activo eliminado"));
    }
}
