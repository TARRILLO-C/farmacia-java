package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.metodopago.MetodoPagoRequestDTO;
import com.sg.farmacia.dto.metodopago.MetodoPagoResponseDTO;
import com.sg.farmacia.service.MetodoPagoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/metodos-pago")
@RequiredArgsConstructor
public class MetodoPagoController {

    private final MetodoPagoService metodoPagoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<MetodoPagoResponseDTO>>> listarTodos(@RequestParam(required = false, defaultValue = "false") boolean soloActivos) {
        List<MetodoPagoResponseDTO> lista = soloActivos ? metodoPagoService.listarActivos() : metodoPagoService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(lista, "Métodos de pago obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MetodoPagoResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(metodoPagoService.obtenerPorId(id), "Método de pago obtenido"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MetodoPagoResponseDTO>> crear(@Valid @RequestBody MetodoPagoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(metodoPagoService.crear(dto), "Método de pago registrado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MetodoPagoResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody MetodoPagoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(metodoPagoService.actualizar(id, dto), "Método de pago actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        metodoPagoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Método de pago deshabilitado"));
    }
}
