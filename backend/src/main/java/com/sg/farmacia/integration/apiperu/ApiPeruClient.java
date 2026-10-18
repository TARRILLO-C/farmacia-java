package com.sg.farmacia.integration.apiperu;

import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.exception.ServicioExternoException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Cliente HTTP de apiperu.dev para consultar DNI (RENIEC) y RUC (SUNAT).
 * El token se mantiene en el servidor para no exponerlo al navegador.
 */
@Slf4j
@Component
public class ApiPeruClient {

    private static final ParameterizedTypeReference<ApiPeruResponse<ApiPeruDniData>> TIPO_DNI =
            new ParameterizedTypeReference<>() {};
    private static final ParameterizedTypeReference<ApiPeruResponse<ApiPeruRucData>> TIPO_RUC =
            new ParameterizedTypeReference<>() {};

    private final RestClient restClient;
    private final String token;

    public ApiPeruClient(
            @Value("${apiperu.base-url}") String baseUrl,
            @Value("${apiperu.token}") String token,
            @Value("${apiperu.connect-timeout:5s}") Duration connectTimeout,
            @Value("${apiperu.read-timeout:10s}") Duration readTimeout) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeout);
        requestFactory.setReadTimeout(readTimeout);
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
        this.token = token;
    }

    public ApiPeruDniData consultarDni(String dni) {
        return consultar("/dni/{numero}", dni, TIPO_DNI, "DNI", "RENIEC");
    }

    public ApiPeruRucData consultarRuc(String ruc) {
        return consultar("/ruc/{numero}", ruc, TIPO_RUC, "RUC", "SUNAT");
    }

    private <T> T consultar(String ruta, String numero, ParameterizedTypeReference<ApiPeruResponse<T>> tipo,
                            String documento, String fuente) {
        Resultado<T> resultado;
        try {
            resultado = restClient.get()
                    .uri(ruta + "?api_token={token}", numero, token)
                    .accept(MediaType.APPLICATION_JSON)
                    .exchange((request, response) ->
                            new Resultado<>(response.getStatusCode().value(), response.bodyTo(tipo)));
        } catch (RuntimeException ex) {
            log.error("Fallo al consultar {} {} en apiperu.dev: {}", documento, numero, ex.getMessage());
            throw new ServicioExternoException(
                    "No se pudo conectar con " + fuente + " para consultar el " + documento + ". Intente nuevamente.", ex);
        }

        ApiPeruResponse<T> body = resultado.body();
        if (body != null && body.success() && body.data() != null) {
            return body.data();
        }

        String code = body != null ? body.code() : null;
        if (resultado.status() == 404 || "document_not_found".equals(code)) {
            throw new ResourceNotFoundException("El " + documento + " " + numero + " no existe en " + fuente + ".");
        }
        if ("invalid_input".equals(code)) {
            throw new BadRequestException("El " + documento + " " + numero + " es incorrecto.");
        }

        log.error("apiperu.dev respondió HTTP {} al consultar {}: {}", resultado.status(), documento,
                body != null ? body.message() : "sin cuerpo");
        throw new ServicioExternoException("El servicio de consulta de " + fuente + " no está disponible en este momento.");
    }

    private record Resultado<T>(int status, ApiPeruResponse<T> body) {
    }
}
