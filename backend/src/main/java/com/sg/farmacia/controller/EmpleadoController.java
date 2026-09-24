package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.empleado.EmpleadoRequestDTO;
import com.sg.farmacia.dto.empleado.EmpleadoResponseDTO;
import com.sg.farmacia.service.EmpleadoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/empleados")
@RequiredArgsConstructor
public class EmpleadoController {

    private final EmpleadoService empleadoService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmpleadoResponseDTO>>> listarTodos(
            @RequestParam(required = false, defaultValue = "false") boolean soloActivos,
            @RequestParam(required = false) String search) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(ApiResponse.success(empleadoService.buscar(search.trim()), "Empleados encontrados"));
        }
        List<EmpleadoResponseDTO> lista = soloActivos ? empleadoService.listarActivos() : empleadoService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(lista, "Empleados obtenidos con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmpleadoResponseDTO>> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(empleadoService.obtenerPorId(id), "Empleado obtenido con éxito"));
    }

    @GetMapping("/dni/{dni}")
    public ResponseEntity<ApiResponse<EmpleadoResponseDTO>> obtenerPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(ApiResponse.success(empleadoService.obtenerPorDni(dni), "Empleado obtenido por DNI"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmpleadoResponseDTO>> crear(@Valid @RequestBody EmpleadoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(empleadoService.crear(dto), "Empleado registrado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmpleadoResponseDTO>> actualizar(@PathVariable Long id, @Valid @RequestBody EmpleadoRequestDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(empleadoService.actualizar(id, dto), "Empleado actualizado"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        empleadoService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Empleado deshabilitado"));
    }
}
