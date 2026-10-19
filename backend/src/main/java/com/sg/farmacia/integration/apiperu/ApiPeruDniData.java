package com.sg.farmacia.integration.apiperu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiPeruDniData(
        String numero,
        @JsonProperty("nombre_completo") String nombreCompleto,
        String nombres,
        @JsonProperty("apellido_paterno") String apellidoPaterno,
        @JsonProperty("apellido_materno") String apellidoMaterno,
        @JsonProperty("direccion_completa") String direccionCompleta
) {
}
