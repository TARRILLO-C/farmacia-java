package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.venta.VentaRequestDTO;
import com.sg.farmacia.dto.venta.VentaResponseDTO;
import com.sg.farmacia.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<ApiResponse<VentaResponseDTO>> procesarVenta(@Valid @RequestBody VentaRequestDTO dto) {
        VentaResponseDTO response = ventaService.procesarVenta(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Venta procesada exitosamente"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VentaResponseDTO>>> listarTodas() {
        List<VentaResponseDTO> ventas = ventaService.listarTodas();
        return ResponseEntity.ok(ApiResponse.success(ventas, "Listado de ventas obtenido con éxito"));
    }

    @GetMapping("/historial")
    public ResponseEntity<ApiResponse<List<VentaResponseDTO>>> listarHistorial(
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fechaInicio,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate fechaFin,
            @RequestParam(required = false) String dni) {
        List<VentaResponseDTO> historial = ventaService.listarHistorial(fechaInicio, fechaFin, dni);
        return ResponseEntity.ok(ApiResponse.success(historial, "Historial de ventas filtrado obtenido con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VentaResponseDTO>> obtenerPorId(@PathVariable Long id) {
        VentaResponseDTO venta = ventaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(venta, "Venta encontrada con éxito"));
    }
}
