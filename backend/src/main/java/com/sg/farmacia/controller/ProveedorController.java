package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.proveedor.ProveedorRequestDTO;
import com.sg.farmacia.dto.proveedor.ProveedorResponseDTO;
import com.sg.farmacia.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProveedorResponseDTO>>> listarTodos(
            @RequestParam(required = false, defaultValue = "false") boolean soloActivos,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(proveedorService.buscar(search.trim()), "Proveedores encontrados"));
        }
        List<ProveedorResponseDTO> lista = soloActivos ? proveedorService.listarActivos() : proveedorService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(lista, "Proveedores obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProveedorResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(proveedorService.obtenerPorId(id), "Proveedor obtenido con éxito"));
    }

    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<ApiResponse<ProveedorResponseDTO>> obtenerPorRuc(@PathVariable String ruc) {
        return ResponseEntity.ok(ApiResponse.success(proveedorService.obtenerPorRuc(ruc), "Proveedor obtenido por RUC"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProveedorResponseDTO>> crear(@Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(proveedorService.crear(dto), "Proveedor registrado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProveedorResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody ProveedorRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(proveedorService.actualizar(id, dto), "Proveedor actualizado con éxito"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Proveedor deshabilitado con éxito"));
    }
}
