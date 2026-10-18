package com.sg.farmacia.integration.apiperu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiPeruRucData(
        String ruc,
        @JsonProperty("nombre_o_razon_social") String razonSocial,
        String direccion,
        @JsonProperty("direccion_completa") String direccionCompleta,
        String estado,
        String condicion,
        String departamento,
        String provincia,
        String distrito
) {
}
