package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.recibo.ReciboResponseDTO;
import com.sg.farmacia.service.ReciboService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recibos")
@RequiredArgsConstructor
public class ReciboController {

    private final ReciboService reciboService;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReciboResponseDTO>> obtenerPorId(@PathVariable Long id) {
        ReciboResponseDTO recibo = reciboService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(recibo, "Recibo obtenido con éxito"));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<ApiResponse<ReciboResponseDTO>> obtenerPorCodigo(@PathVariable String codigo) {
        ReciboResponseDTO recibo = reciboService.obtenerPorCodigo(codigo);
        return ResponseEntity.ok(ApiResponse.success(recibo, "Recibo encontrado por código de comprobante"));
    }

    @GetMapping("/venta/{ventaId}")
    public ResponseEntity<ApiResponse<ReciboResponseDTO>> obtenerPorVentaId(@PathVariable Long ventaId) {
        ReciboResponseDTO recibo = reciboService.obtenerPorVentaId(ventaId);
        return ResponseEntity.ok(ApiResponse.success(recibo, "Recibo obtenido para la venta"));
    }
}
