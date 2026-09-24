package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.compra.CompraRequestDTO;
import com.sg.farmacia.dto.compra.CompraResponseDTO;
import com.sg.farmacia.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<CompraResponseDTO>>> listarTodas(
            @RequestParam(required = false) Long proveedorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {

        if (proveedorId != null) {
            return ResponseEntity.ok(ApiResponse.success(compraService.listarPorProveedor(proveedorId), "Compras por proveedor"));
        }
        if (fechaInicio != null || fechaFin != null) {
            LocalDateTime desde = fechaInicio != null ? fechaInicio.atStartOfDay() : null;
            LocalDateTime hasta = fechaFin != null ? fechaFin.atTime(LocalTime.MAX) : null;
            return ResponseEntity.ok(ApiResponse.success(compraService.listarPorRangoFechas(desde, hasta), "Compras por rango de fechas"));
        }
        return ResponseEntity.ok(ApiResponse.success(compraService.listarTodas(), "Listado general de compras"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompraResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(compraService.obtenerPorId(id), "Detalle de compra obtenido"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CompraResponseDTO>> registrarCompra(@Valid @RequestBody CompraRequestDTO dto) {
        CompraResponseDTO res = compraService.registrarCompra(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(res, "Compra y lotes registrados exitosamente"));
    }
}
