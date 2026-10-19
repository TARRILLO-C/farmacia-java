package com.sg.farmacia.dto.consulta;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Datos de un DNI/RUC para el POS. Si el documento ya existe como cliente se devuelve
 * desde la base de datos (fuente LOCAL); si no, desde RENIEC o SUNAT.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DocumentoConsultaDTO {

    private String tipoDocumento;
    private String numeroDocumento;
    private String nombreCompleto;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String direccion;

    // Solo RUC (SUNAT)
    private String estado;
    private String condicion;
    private String departamento;
    private String provincia;
    private String distrito;

    // LOCAL, RENIEC o SUNAT
    private String fuente;
    private boolean registrado;
    private Long clienteId;
    private boolean esClienteAmigo;
    private String codigoClienteAmigo;
    private Double porcentajeDescuento;
}
