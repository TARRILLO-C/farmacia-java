package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.cliente.ClienteRequestDTO;
import com.sg.farmacia.dto.cliente.ClienteResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.model.FidelizacionCrm;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.repository.FidelizacionCrmRepository;
import com.sg.farmacia.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final FidelizacionCrmRepository fidelizacionRepository;
    private final Random random = new Random();

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAllWithFidelizacion()
                .stream()
                .map(ClienteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPorId(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el cliente con ID: " + id));
        return ClienteResponseDTO.fromEntity(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPorDniRuc(String dniRuc) {
        Cliente cliente = clienteRepository.findByNumeroDocumento(dniRuc.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró cliente con documento: " + dniRuc));
        return ClienteResponseDTO.fromEntity(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public ClienteResponseDTO obtenerPorNumeroClienteAmigo(String numeroClienteAmigo) {
        Cliente cliente = clienteRepository.findByNumeroClienteAmigo(numeroClienteAmigo.trim())
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró cliente con código ClienteAmigo: " + numeroClienteAmigo));
        return ClienteResponseDTO.fromEntity(cliente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> buscar(String termino) {
        if (termino == null || termino.trim().isEmpty()) {
            return listarTodos();
        }
        return clienteRepository.buscarPorTermino(termino.trim())
                .stream()
                .map(ClienteResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClienteResponseDTO crear(ClienteRequestDTO dto) {
        String numDoc = (dto.getNumeroDocumento() != null && !dto.getNumeroDocumento().isBlank())
                ? dto.getNumeroDocumento().trim()
                : (dto.getDniRuc() != null ? dto.getDniRuc().trim() : "");

        if (numDoc.isBlank()) {
            throw new BadRequestException("El número de documento es obligatorio.");
        }

        if (clienteRepository.existsByNumeroDocumento(numDoc)) {
            throw new BadRequestException("Ya existe un cliente registrado con el documento: " + numDoc);
        }

        String tipoDoc = (dto.getTipoDocumento() != null && !dto.getTipoDocumento().isBlank())
                ? dto.getTipoDocumento().trim().toUpperCase()
                : (numDoc.length() == 11 ? "RUC" : "DNI");

        Cliente cliente = Cliente.builder()
                .tipoDocumento(tipoDoc)
                .numeroDocumento(numDoc)
                .nombreCompleto(dto.obtenerNombreCompleto())
                .direccion(dto.getDireccion() != null ? dto.getDireccion().trim() : null)
                .telefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null)
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        boolean esAmigo = Boolean.TRUE.equals(dto.getEsClienteAmigo()) ||
                (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().isBlank());

        if (esAmigo) {
            String codigoAmigo = (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty())
                    ? dto.getNumeroClienteAmigo().trim().toUpperCase()
                    : generarCodigoClienteAmigoUnico();

            Double descuento = (dto.getPorcentajeDescuento() != null && dto.getPorcentajeDescuento() > 0)
                    ? dto.getPorcentajeDescuento()
                    : 10.0;

            FidelizacionCrm fidelizacion = FidelizacionCrm.builder()
                    .cliente(cliente)
                    .codigoAfiliado(codigoAmigo)
                    .estadoMembresia("ACTIVO")
                    .porcentajeDescuento(descuento)
                    .puntosAcumulados(50) // Bono inicial de fidelidad
                    .fechaAfiliacion(LocalDate.now())
                    .build();

            cliente.setFidelizacion(fidelizacion);
        }

        Cliente guardado = clienteRepository.save(cliente);
        return ClienteResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el cliente con ID: " + id));

        String numDoc = (dto.getNumeroDocumento() != null && !dto.getNumeroDocumento().isBlank())
                ? dto.getNumeroDocumento().trim()
                : (dto.getDniRuc() != null ? dto.getDniRuc().trim() : cliente.getNumeroDocumento());

        if (clienteRepository.existsByNumeroDocumentoAndIdNot(numDoc, id)) {
            throw new BadRequestException("Ya existe otro cliente con el documento: " + numDoc);
        }

        cliente.setNumeroDocumento(numDoc);
        if (dto.getTipoDocumento() != null && !dto.getTipoDocumento().isBlank()) {
            cliente.setTipoDocumento(dto.getTipoDocumento().trim().toUpperCase());
        }
        cliente.setNombreCompleto(dto.obtenerNombreCompleto());
        cliente.setDireccion(dto.getDireccion() != null ? dto.getDireccion().trim() : null);
        cliente.setTelefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null);
        cliente.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);

        if (dto.getActivo() != null) {
            cliente.setActivo(dto.getActivo());
        }

        boolean esAmigo = Boolean.TRUE.equals(dto.getEsClienteAmigo()) ||
                (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().isBlank());

        if (esAmigo) {
            FidelizacionCrm fid = cliente.getFidelizacion();
            if (fid == null) {
                String codigo = (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty())
                        ? dto.getNumeroClienteAmigo().trim().toUpperCase()
                        : generarCodigoClienteAmigoUnico();

                fid = FidelizacionCrm.builder()
                        .cliente(cliente)
                        .codigoAfiliado(codigo)
                        .estadoMembresia("ACTIVO")
                        .porcentajeDescuento(dto.getPorcentajeDescuento() != null ? dto.getPorcentajeDescuento() : 10.0)
                        .puntosAcumulados(0)
                        .fechaAfiliacion(LocalDate.now())
                        .build();
                cliente.setFidelizacion(fid);
            } else {
                if (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().isBlank()) {
                    fid.setCodigoAfiliado(dto.getNumeroClienteAmigo().trim().toUpperCase());
                }
                if (dto.getPorcentajeDescuento() != null) {
                    fid.setPorcentajeDescuento(dto.getPorcentajeDescuento());
                }
                fid.setEstadoMembresia("ACTIVO");
            }
        } else if (cliente.getFidelizacion() != null) {
            cliente.getFidelizacion().setEstadoMembresia("INACTIVO");
        }

        Cliente actualizado = clienteRepository.save(cliente);
        return ClienteResponseDTO.fromEntity(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el cliente con ID: " + id));
        clienteRepository.delete(cliente);
    }

    private String generarCodigoClienteAmigoUnico() {
        String codigo;
        do {
            int randomNum = 1000 + random.nextInt(9000);
            codigo = "CA-" + randomNum;
        } while (fidelizacionRepository.existsByCodigoAfiliado(codigo));
        return codigo;
    }
}
