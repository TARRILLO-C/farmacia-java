package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.laboratorio.LaboratorioRequestDTO;
import com.sg.farmacia.dto.laboratorio.LaboratorioResponseDTO;
import com.sg.farmacia.service.LaboratorioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/laboratorios")
@RequiredArgsConstructor
public class LaboratorioController {

    private final LaboratorioService laboratorioService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LaboratorioResponseDTO>>> listarTodos(@RequestParam(required = false, defaultValue = "false") boolean soloActivos) {
        List<LaboratorioResponseDTO> lista = soloActivos ? laboratorioService.listarActivos() : laboratorioService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(lista, "Laboratorios obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratorioResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(laboratorioService.obtenerPorId(id), "Laboratorio obtenido con éxito"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<LaboratorioResponseDTO>> crear(@Valid @RequestBody LaboratorioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(laboratorioService.crear(dto), "Laboratorio creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LaboratorioResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody LaboratorioRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(laboratorioService.actualizar(id, dto), "Laboratorio actualizado con éxito"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        laboratorioService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Laboratorio deshabilitado"));
    }
}
