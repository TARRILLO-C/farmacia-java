package com.sg.farmacia.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JwtTokenProvider {

    // Clave secreta robusta de 256 bits para algoritmo HS256
    @Value("${app.jwt.secret:sgf_farmacia_jwt_secret_key_2026_super_secure_key_for_production}")
    private String jwtSecret;

    // 24 horas de validez por defecto (en milisegundos)
    @Value("${app.jwt.expiration-milliseconds:86400000}")
    private long jwtExpirationMilliseconds;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Genera un token JWT a partir de un objeto Authentication de Spring Security
     */
    public String generarToken(Authentication authentication) {
        String username = authentication.getName();
        Date fechaActual = new Date();
        Date fechaExpiracion = new Date(fechaActual.getTime() + this.jwtExpirationMilliseconds);

        String roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));

        return Jwts.builder()
                .setSubject(username)
                .claim("roles", roles)
                .setIssuedAt(fechaActual)
                .setExpiration(fechaExpiracion)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Genera un token JWT con atributos personalizados de usuario
     */
    public String generarToken(String username, String rol, Long usuarioId, String nombre) {
        Date fechaActual = new Date();
        Date fechaExpiracion = new Date(fechaActual.getTime() + this.jwtExpirationMilliseconds);

        return Jwts.builder()
                .setSubject(username)
                .claim("id", usuarioId)
                .claim("nombre", nombre)
                .claim("rol", rol)
                .claim("roles", "ROLE_" + rol)
                .setIssuedAt(fechaActual)
                .setExpiration(fechaExpiracion)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Obtiene el username a partir de los claims del token JWT
     */
    public String obtenerUsernameDelJwt(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        return claims.getSubject();
    }

    /**
     * Valida la firma, integridad y vigencia temporal del token JWT
     */
    public boolean validarToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (SignatureException ex) {
            log.error("Firma JWT no válida o manipulada: {}", ex.getMessage());
        } catch (MalformedJwtException ex) {
            log.error("Token JWT malformado o con estructura inválida: {}", ex.getMessage());
        } catch (ExpiredJwtException ex) {
            log.warn("El token JWT ha expirado: {}", ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            log.error("Token JWT no soportado por el proveedor: {}", ex.getMessage());
        } catch (IllegalArgumentException ex) {
            log.error("Cadena de claims JWT vacía o nula: {}", ex.getMessage());
        }
        return false;
    }
}
