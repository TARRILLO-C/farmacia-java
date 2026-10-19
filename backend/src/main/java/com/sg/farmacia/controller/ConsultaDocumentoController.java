package com.sg.farmacia.controller;

import com.sg.farmacia.dto.ApiResponse;
import com.sg.farmacia.dto.consulta.DocumentoConsultaDTO;
import com.sg.farmacia.service.ConsultaDocumentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/consultas")
@RequiredArgsConstructor
public class ConsultaDocumentoController {

    private final ConsultaDocumentoService consultaDocumentoService;

    @GetMapping("/dni/{dni}")
    public ResponseEntity<ApiResponse<DocumentoConsultaDTO>> consultarDni(@PathVariable String dni) {
        DocumentoConsultaDTO resultado = consultaDocumentoService.consultarDni(dni);
        return ResponseEntity.ok(ApiResponse.success(resultado, "Consulta de DNI realizada con éxito"));
    }

    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<ApiResponse<DocumentoConsultaDTO>> consultarRuc(@PathVariable String ruc) {
        DocumentoConsultaDTO resultado = consultaDocumentoService.consultarRuc(ruc);
        return ResponseEntity.ok(ApiResponse.success(resultado, "Consulta de RUC realizada con éxito"));
    }
}
