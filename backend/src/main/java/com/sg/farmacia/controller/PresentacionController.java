package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.presentacion.PresentacionRequestDTO;
import com.sg.farmacia.dto.presentacion.PresentacionResponseDTO;
import com.sg.farmacia.service.PresentacionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/presentaciones")
@RequiredArgsConstructor
public class PresentacionController {

    private final PresentacionService presentacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PresentacionResponseDTO>>> listarTodas() {
        return ResponseEntity.ok(ApiResponse.success(presentacionService.listarTodas(), "Presentaciones obtenidas con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PresentacionResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(presentacionService.obtenerPorId(id), "Presentación obtenida"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PresentacionResponseDTO>> crear(@Valid @RequestBody PresentacionRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(presentacionService.crear(dto), "Presentación creada exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PresentacionResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody PresentacionRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(presentacionService.actualizar(id, dto), "Presentación actualizada"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        presentacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Presentación eliminada"));
    }
}
