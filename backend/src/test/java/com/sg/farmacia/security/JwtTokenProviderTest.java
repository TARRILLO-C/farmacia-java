package com.sg.farmacia.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "esta_es_una_clave_secreta_de_prueba_para_jwt_con_mas_de_256_bits_largo!!");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMilliseconds", 3600000L); // 1 hora
    }

    @Test
    @DisplayName("Debe generar un token JWT válido y extraer el username correctamente")
    void generarYValidarToken_Exito() {
        String username = "cajero";
        String rol = "CAJERO";
        Long id = 2L;
        String nombre = "Luis Morales";

        String token = jwtTokenProvider.generarToken(username, rol, id, nombre);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(jwtTokenProvider.validarToken(token));
        assertEquals(username, jwtTokenProvider.obtenerUsernameDelJwt(token));
    }

    @Test
    @DisplayName("Debe invalidar un token corrupto o mal formado")
    void validarToken_TokenInvalido() {
        String tokenInvalido = "header.payload.signature_falsa";

        boolean esValido = jwtTokenProvider.validarToken(tokenInvalido);

        assertFalse(esValido);
    }
}
