package com.sg.farmacia.service;

import com.sg.farmacia.dto.consulta.DocumentoConsultaDTO;
import com.sg.farmacia.model.Cliente;

public interface ConsultaDocumentoService {

    DocumentoConsultaDTO consultarDni(String dni);

    DocumentoConsultaDTO consultarRuc(String ruc);

    /**
     * Devuelve el cliente con ese DNI/RUC; si no existe, lo consulta en RENIEC/SUNAT y lo registra.
     */
    Cliente obtenerORegistrarCliente(String numeroDocumento);
}
