package com.sg.farmacia.integration.apiperu;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record ApiPeruResponse<T>(boolean success, String code, String message, T data) {
}
