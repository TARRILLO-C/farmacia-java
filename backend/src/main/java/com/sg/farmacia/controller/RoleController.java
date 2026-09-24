package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.rol.RoleRequestDTO;
import com.sg.farmacia.dto.rol.RoleResponseDTO;
import com.sg.farmacia.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponseDTO>>> listarTodos() {
        return ResponseEntity.ok(ApiResponse.success(roleService.listarTodos(), "Roles obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(roleService.obtenerPorId(id), "Rol obtenido con éxito"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponseDTO>> crear(@Valid @RequestBody RoleRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(roleService.crear(dto), "Rol creado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody RoleRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(roleService.actualizar(id, dto), "Rol actualizado con éxito"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        roleService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Rol eliminado con éxito"));
    }
}
