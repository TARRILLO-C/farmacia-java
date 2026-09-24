package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.fidelizacion.FidelizacionRequestDTO;
import com.sg.farmacia.dto.fidelizacion.FidelizacionResponseDTO;
import com.sg.farmacia.service.FidelizacionCrmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fidelizacion")
@RequiredArgsConstructor
public class FidelizacionCrmController {

    private final FidelizacionCrmService fidelizacionService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FidelizacionResponseDTO>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.success(fidelizacionService.listarTodos(), "Membresías de fidelización obtenidas"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FidelizacionResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(fidelizacionService.obtenerPorId(id), "Membresía obtenida"));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<ApiResponse<FidelizacionResponseDTO>> obtenerPorClienteId(@PathVariable Long clienteId) {
        return ResponseEntity.ok(ApiResponse.success(fidelizacionService.obtenerPorClienteId(clienteId), "Membresía del cliente"));
    }

    @GetMapping("/codigo/{codigoAfiliado}")
    public ResponseEntity<ApiResponse<FidelizacionResponseDTO>> obtenerPorCodigoAfiliado(@PathVariable String codigoAfiliado) {
        return ResponseEntity.ok(ApiResponse.success(fidelizacionService.obtenerPorCodigoAfiliado(codigoAfiliado), "Membresía encontrada por código"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FidelizacionResponseDTO>> afiliarOActualizar(@Valid @RequestBody FidelizacionRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(fidelizacionService.afiliarOActualizar(dto), "Afiliación registrada/actualizada exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        fidelizacionService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Membresía eliminada"));
    }
}
