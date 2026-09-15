package com.farmacia.sgf.controller;

import com.farmacia.sgf.model.RolUsuario;
import com.farmacia.sgf.model.Usuario;
import com.farmacia.sgf.repository.UsuarioRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String identifier = req.getUsername() != null ? req.getUsername() : req.getEmail();

        Usuario usuario = usuarioRepository.findByUsername(identifier)
                .orElseGet(() -> usuarioRepository.findByEmail(identifier).orElse(null));

        if (usuario == null) {
            Map<String, String> err = new HashMap<>();
            err.put("message", "Usuario o contraseña incorrectos");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("token", "demo-jwt-token-" + usuario.getId());
        response.put("type", "Bearer");
        response.put("usuario", usuario);

        return ResponseEntity.ok(response);
    }

    @Data
    public static class LoginRequest {
        private String username;
        private String email;
        private String password;
    }
}
