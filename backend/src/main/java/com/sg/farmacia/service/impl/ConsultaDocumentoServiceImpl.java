package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.consulta.DocumentoConsultaDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.integration.apiperu.ApiPeruClient;
import com.sg.farmacia.integration.apiperu.ApiPeruDniData;
import com.sg.farmacia.integration.apiperu.ApiPeruRucData;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.service.ConsultaDocumentoService;
import com.sg.farmacia.util.DocumentoIdentidad;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultaDocumentoServiceImpl implements ConsultaDocumentoService {

    private final ApiPeruClient apiPeruClient;
    private final ClienteRepository clienteRepository;

    @Override
    @Transactional(readOnly = true)
    public DocumentoConsultaDTO consultarDni(String dni) {
        String numero = DocumentoIdentidad.normalizar(dni);
        if (!DocumentoIdentidad.esDniValido(numero)) {
            throw new BadRequestException("El DNI debe tener 8 dígitos numéricos.");
        }
        return clienteRepository.findByNumeroDocumento(numero)
                .map(this::desdeCliente)
                .orElseGet(() -> desdeReniec(apiPeruClient.consultarDni(numero)));
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentoConsultaDTO consultarRuc(String ruc) {
        String numero = DocumentoIdentidad.normalizar(ruc);
        if (!DocumentoIdentidad.esRucValido(numero)) {
            throw new BadRequestException("El RUC debe tener 11 dígitos, iniciar en 10, 15, 16, 17 o 20 y tener un dígito verificador válido.");
        }
        return clienteRepository.findByNumeroDocumento(numero)
                .map(this::desdeCliente)
                .orElseGet(() -> desdeSunat(apiPeruClient.consultarRuc(numero)));
    }

    @Override
    @Transactional
    public Cliente obtenerORegistrarCliente(String numeroDocumento) {
        String numero = DocumentoIdentidad.normalizar(numeroDocumento);

        return clienteRepository.findByNumeroDocumento(numero).orElseGet(() -> {
            Cliente nuevo;
            if (DocumentoIdentidad.esDniValido(numero)) {
                ApiPeruDniData data = apiPeruClient.consultarDni(numero);
                nuevo = Cliente.builder()
                        .tipoDocumento(DocumentoIdentidad.DNI)
                        .numeroDocumento(numero)
                        .nombreCompleto(limitar(nombreDni(data), 150))
                        .direccion(limitar(vacioANull(data.direccionCompleta()), 255))
                        .activo(true)
                        .build();
            } else if (DocumentoIdentidad.esRucValido(numero)) {
                ApiPeruRucData data = apiPeruClient.consultarRuc(numero);
                nuevo = Cliente.builder()
                        .tipoDocumento(DocumentoIdentidad.RUC)
                        .numeroDocumento(numero)
                        .nombreCompleto(limitar(data.razonSocial(), 150))
                        .direccion(limitar(direccionRuc(data), 255))
                        .activo(true)
                        .build();
            } else {
                throw new BadRequestException("Documento inválido: ingrese un DNI de 8 dígitos o un RUC válido de 11 dígitos.");
            }

            log.info("Registrando automáticamente cliente {} {}", nuevo.getTipoDocumento(), numero);
            return clienteRepository.save(nuevo);
        });
    }

    // =========================================================================
    // Métodos Auxiliares
    // =========================================================================

    private DocumentoConsultaDTO desdeCliente(Cliente c) {
        String tipo = c.getNumeroDocumento().length() == 11 ? DocumentoIdentidad.RUC : DocumentoIdentidad.DNI;
        return DocumentoConsultaDTO.builder()
                .tipoDocumento(tipo)
                .numeroDocumento(c.getNumeroDocumento())
                .nombreCompleto(c.getNombreCompleto())
                .direccion(c.getDireccion())
                .fuente("LOCAL")
                .registrado(true)
                .clienteId(c.getId())
                .esClienteAmigo(c.isEsClienteAmigo())
                .codigoClienteAmigo(c.getCodigoClienteAmigo())
                .porcentajeDescuento(c.getPorcentajeDescuento())
                .build();
    }

    private DocumentoConsultaDTO desdeReniec(ApiPeruDniData d) {
        return DocumentoConsultaDTO.builder()
                .tipoDocumento(DocumentoIdentidad.DNI)
                .numeroDocumento(d.numero())
                .nombreCompleto(nombreDni(d))
                .nombres(d.nombres())
                .apellidoPaterno(d.apellidoPaterno())
                .apellidoMaterno(d.apellidoMaterno())
                .direccion(vacioANull(d.direccionCompleta()))
                .fuente("RENIEC")
                .registrado(false)
                .build();
    }

    private DocumentoConsultaDTO desdeSunat(ApiPeruRucData d) {
        return DocumentoConsultaDTO.builder()
                .tipoDocumento(DocumentoIdentidad.RUC)
                .numeroDocumento(d.ruc())
                .nombreCompleto(d.razonSocial())
                .direccion(direccionRuc(d))
                .estado(d.estado())
                .condicion(d.condicion())
                .departamento(d.departamento())
                .provincia(d.provincia())
                .distrito(d.distrito())
                .fuente("SUNAT")
                .registrado(false)
                .build();
    }

    /** "NOMBRES APELLIDO_PATERNO APELLIDO_MATERNO", o el nombre completo de RENIEC si faltan partes. */
    private String nombreDni(ApiPeruDniData d) {
        String armado = Stream.of(d.nombres(), d.apellidoPaterno(), d.apellidoMaterno())
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .collect(Collectors.joining(" "));
        return armado.isBlank() ? d.nombreCompleto() : armado;
    }

    private String direccionRuc(ApiPeruRucData d) {
        String completa = vacioANull(d.direccionCompleta());
        return completa != null ? completa : vacioANull(d.direccion());
    }

    private String vacioANull(String valor) {
        return (valor == null || valor.isBlank() || "-".equals(valor.trim())) ? null : valor.trim();
    }

    private String limitar(String valor, int max) {
        return (valor == null || valor.length() <= max) ? valor : valor.substring(0, max);
    }
}
