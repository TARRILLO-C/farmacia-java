package com.farmacia.sgf.service.impl;

import com.farmacia.sgf.dto.cliente.ClienteRequestDTO;
import com.farmacia.sgf.dto.cliente.ClienteResponseDTO;
import com.farmacia.sgf.exception.BadRequestException;
import com.farmacia.sgf.exception.ResourceNotFoundException;
import com.farmacia.sgf.model.Cliente;
import com.farmacia.sgf.model.TipoCliente;
import com.farmacia.sgf.repository.ClienteRepository;
import com.farmacia.sgf.service.ClienteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClienteServiceImpl implements ClienteService {

    private final ClienteRepository clienteRepository;
    private final Random random = new Random();

    @Override
    @Transactional(readOnly = true)
    public List<ClienteResponseDTO> listarTodos() {
        return clienteRepository.findAll()
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
        Cliente cliente = clienteRepository.findByDniRuc(dniRuc.trim())
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
        String dniRuc = dto.getDniRuc().trim();
        if (clienteRepository.existsByDniRuc(dniRuc)) {
            throw new BadRequestException("Ya existe un cliente registrado con el documento: " + dniRuc);
        }

        boolean esAmigo = Boolean.TRUE.equals(dto.getEsClienteAmigo());
        String numeroAmigo = null;
        Double descuento = 0.0;

        if (esAmigo) {
            numeroAmigo = (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty())
                    ? dto.getNumeroClienteAmigo().trim().toUpperCase()
                    : generarCodigoClienteAmigoUnico();

            descuento = (dto.getPorcentajeDescuento() != null && dto.getPorcentajeDescuento() > 0)
                    ? dto.getPorcentajeDescuento()
                    : 10.0;
        }

        Cliente cliente = Cliente.builder()
                .dniRuc(dniRuc)
                .nombreCompleto(dto.obtenerNombreCompleto())
                .direccion(dto.getDireccion() != null ? dto.getDireccion().trim() : null)
                .telefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null)
                .email(dto.getEmail() != null ? dto.getEmail().trim() : null)
                .tipoCliente(dto.getTipoCliente() != null ? dto.getTipoCliente() : TipoCliente.NUEVO)
                .esClienteAmigo(esAmigo)
                .numeroClienteAmigo(numeroAmigo)
                .porcentajeDescuento(descuento)
                .puntosFidelidad(esAmigo ? 50 : 0) // Bono inicial de fidelidad
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        Cliente guardado = clienteRepository.save(cliente);
        return ClienteResponseDTO.fromEntity(guardado);
    }

    @Override
    @Transactional
    public ClienteResponseDTO actualizar(Long id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró el cliente con ID: " + id));

        String dniRuc = dto.getDniRuc().trim();
        if (clienteRepository.existsByDniRucAndIdNot(dniRuc, id)) {
            throw new BadRequestException("Ya existe otro cliente con el documento: " + dniRuc);
        }

        cliente.setDniRuc(dniRuc);
        cliente.setNombreCompleto(dto.obtenerNombreCompleto());
        cliente.setDireccion(dto.getDireccion() != null ? dto.getDireccion().trim() : null);
        cliente.setTelefono(dto.getTelefono() != null ? dto.getTelefono().trim() : null);
        cliente.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);

        if (dto.getTipoCliente() != null) {
            cliente.setTipoCliente(dto.getTipoCliente());
        }
        if (dto.getActivo() != null) {
            cliente.setActivo(dto.getActivo());
        }

        boolean esAmigo = Boolean.TRUE.equals(dto.getEsClienteAmigo());
        cliente.setEsClienteAmigo(esAmigo);

        if (esAmigo) {
            if (cliente.getNumeroClienteAmigo() == null || cliente.getNumeroClienteAmigo().isEmpty()) {
                String codigo = (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty())
                        ? dto.getNumeroClienteAmigo().trim().toUpperCase()
                        : generarCodigoClienteAmigoUnico();
                cliente.setNumeroClienteAmigo(codigo);
            } else if (dto.getNumeroClienteAmigo() != null && !dto.getNumeroClienteAmigo().trim().isEmpty()) {
                cliente.setNumeroClienteAmigo(dto.getNumeroClienteAmigo().trim().toUpperCase());
            }

            Double desc = (dto.getPorcentajeDescuento() != null && dto.getPorcentajeDescuento() > 0)
                    ? dto.getPorcentajeDescuento()
                    : (cliente.getPorcentajeDescuento() > 0 ? cliente.getPorcentajeDescuento() : 10.0);
            cliente.setPorcentajeDescuento(desc);
        } else {
            cliente.setPorcentajeDescuento(0.0);
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
            codigo = "AMIGO-" + randomNum;
        } while (clienteRepository.existsByNumeroClienteAmigo(codigo));
        return codigo;
    }
}
