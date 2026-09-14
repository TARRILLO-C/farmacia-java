package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.usuario.UsuarioRequestDTO;
import com.sg.farmacia.dto.usuario.UsuarioResponseDTO;
import com.sg.farmacia.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<UsuarioResponseDTO>>> listarTodos() {
        List<UsuarioResponseDTO> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(usuarios, "Listado de usuarios obtenido con éxito"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> obtenerPorId(@PathVariable Long id) {
        UsuarioResponseDTO usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(usuario, "Usuario encontrado"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> crear(@Valid @RequestBody UsuarioRequestDTO dto) {
        UsuarioResponseDTO nuevoUsuario = usuarioService.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(nuevoUsuario, "Usuario registrado exitosamente"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequestDTO dto) {
        UsuarioResponseDTO actualizado = usuarioService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.success(actualizado, "Usuario actualizado exitosamente"));
    }

    @PatchMapping("/{id}/toggle-activo")
    public ResponseEntity<ApiResponse<UsuarioResponseDTO>> toggleActivo(@PathVariable Long id) {
        UsuarioResponseDTO actualizado = usuarioService.toggleActivo(id);
        return ResponseEntity.ok(ApiResponse.success(actualizado, "Estado del usuario modificado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Usuario eliminado exitosamente"));
    }
}
