package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.caja.*;
import com.sg.farmacia.service.CajaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/cajas")
@RequiredArgsConstructor
public class CajaController {

    private final CajaService cajaService;

    @GetMapping("/activa")
    public ResponseEntity<ApiResponse<CajaResponseDTO>> obtenerCajaActiva() {
        Optional<CajaResponseDTO> caja = cajaService.obtenerCajaActiva();
        return caja.map(cajaResponseDTO -> ResponseEntity.ok(ApiResponse.success(cajaResponseDTO, "Caja activa obtenida")))
                .orElseGet(() -> ResponseEntity.ok(ApiResponse.success(null, "No hay caja abierta en este momento")));
    }

    @PostMapping("/abrir")
    public ResponseEntity<ApiResponse<CajaResponseDTO>> abrirCaja(@Valid @RequestBody AperturaCajaDTO dto) {
        CajaResponseDTO nuevaCaja = cajaService.abrirCaja(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(nuevaCaja, "Caja abierta exitosamente"));
    }

    @PostMapping("/{id}/cerrar")
    public ResponseEntity<ApiResponse<CajaResponseDTO>> cerrarCaja(
            @PathVariable Long id,
            @Valid @RequestBody CierreCajaDTO dto) {
        CajaResponseDTO cajaCerrada = cajaService.cerrarCaja(id, dto);
        return ResponseEntity.ok(ApiResponse.success(cajaCerrada, "Caja cerrada y arqueo completado exitosamente"));
    }

    @PostMapping("/{id}/movimientos")
    public ResponseEntity<ApiResponse<MovimientoCajaResponseDTO>> registrarMovimiento(
            @PathVariable Long id,
            @Valid @RequestBody MovimientoCajaRequestDTO dto) {
        MovimientoCajaResponseDTO movimiento = cajaService.registrarMovimiento(id, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(movimiento, "Movimiento de caja registrado exitosamente"));
    }

    @GetMapping("/historial")
    public ResponseEntity<ApiResponse<List<CajaResponseDTO>>> listarHistorial(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        List<CajaResponseDTO> historial = cajaService.listarHistorial(fechaInicio, fechaFin);
        return ResponseEntity.ok(ApiResponse.success(historial, "Historial de cajas obtenido con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CajaResponseDTO>> obtenerPorId(@PathVariable Long id) {
        CajaResponseDTO caja = cajaService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(caja, "Detalle de caja obtenido con éxito"));
    }
}

