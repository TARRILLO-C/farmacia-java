package com.farmacia.sgf.controller;

import com.farmacia.sgf.dto.ApiResponse;
import com.farmacia.sgf.dto.cliente.ClienteRequestDTO;
import com.farmacia.sgf.dto.cliente.ClienteResponseDTO;
import com.farmacia.sgf.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClienteResponseDTO>>> listarTodos() {
        List<ClienteResponseDTO> clientes = clienteService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(clientes, "Listado de clientes obtenido exitosamente"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> obtenerPorId(@PathVariable Long id) {
        ClienteResponseDTO cliente = clienteService.obtenerPorId(id);
        return ResponseEntity.ok(ApiResponse.success(cliente, "Cliente encontrado"));
    }

    @GetMapping("/documento/{dniRuc}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> obtenerPorDniRuc(@PathVariable String dniRuc) {
        ClienteResponseDTO cliente = clienteService.obtenerPorDniRuc(dniRuc);
        return ResponseEntity.ok(ApiResponse.success(cliente, "Cliente encontrado"));
    }

    @GetMapping("/amigo/{numeroClienteAmigo}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> obtenerPorNumeroClienteAmigo(@PathVariable String numeroClienteAmigo) {
        ClienteResponseDTO cliente = clienteService.obtenerPorNumeroClienteAmigo(numeroClienteAmigo);
        return ResponseEntity.ok(ApiResponse.success(cliente, "Cliente encontrado"));
    }

    @GetMapping("/buscar")
    public ResponseEntity<ApiResponse<Object>> buscar(
            @RequestParam(name = "term", required = false) String term,
            @RequestParam(name = "termino", required = false) String termino) {
        String query = (term != null && !term.trim().isEmpty()) ? term : termino;

        if (query != null && !query.trim().isEmpty()) {
            List<ClienteResponseDTO> resultados = clienteService.buscar(query.trim());
            return ResponseEntity.ok(ApiResponse.success(resultados, "Resultados de búsqueda"));
        }

        List<ClienteResponseDTO> todos = clienteService.listarTodos();
        return ResponseEntity.ok(ApiResponse.success(todos, "Todos los clientes"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> crear(@Valid @RequestBody ClienteRequestDTO dto) {
        ClienteResponseDTO nuevoCliente = clienteService.crear(dto);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(nuevoCliente, "Cliente registrado exitosamente en el sistema"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClienteResponseDTO>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ClienteRequestDTO dto) {
        ClienteResponseDTO clienteActualizado = clienteService.actualizar(id, dto);
        return ResponseEntity.ok(ApiResponse.success(clienteActualizado, "Cliente actualizado exitosamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Cliente eliminado exitosamente"));
    }
}
