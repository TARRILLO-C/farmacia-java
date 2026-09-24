package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.fidelizacion.FidelizacionRequestDTO;
import com.sg.farmacia.dto.fidelizacion.FidelizacionResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Cliente;
import com.sg.farmacia.model.FidelizacionCrm;
import com.sg.farmacia.repository.ClienteRepository;
import com.sg.farmacia.repository.FidelizacionCrmRepository;
import com.sg.farmacia.service.FidelizacionCrmService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FidelizacionCrmServiceImpl implements FidelizacionCrmService {

    private final FidelizacionCrmRepository fidelizacionRepository;
    private final ClienteRepository clienteRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FidelizacionResponseDTO> listarTodos() {
        return fidelizacionRepository.findAll().stream()
                .map(FidelizacionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FidelizacionResponseDTO obtenerPorId(Long id) {
        FidelizacionCrm f = fidelizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de fidelización no encontrado con ID: " + id));
        return FidelizacionResponseDTO.fromEntity(f);
    }

    @Override
    @Transactional(readOnly = true)
    public FidelizacionResponseDTO obtenerPorClienteId(Long clienteId) {
        FidelizacionCrm f = fidelizacionRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Fidelización no encontrada para el cliente ID: " + clienteId));
        return FidelizacionResponseDTO.fromEntity(f);
    }

    @Override
    @Transactional(readOnly = true)
    public FidelizacionResponseDTO obtenerPorCodigoAfiliado(String codigoAfiliado) {
        FidelizacionCrm f = fidelizacionRepository.findByCodigoAfiliado(codigoAfiliado)
                .orElseThrow(() -> new ResourceNotFoundException("Fidelización no encontrada con código afiliado: " + codigoAfiliado));
        return FidelizacionResponseDTO.fromEntity(f);
    }

    @Override
    @Transactional
    public FidelizacionResponseDTO afiliarOActualizar(FidelizacionRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(dto.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + dto.getClienteId()));

        FidelizacionCrm f = fidelizacionRepository.findByClienteId(dto.getClienteId())
                .orElse(FidelizacionCrm.builder()
                        .cliente(cliente)
                        .fechaAfiliacion(dto.getFechaAfiliacion() != null ? dto.getFechaAfiliacion() : LocalDate.now())
                        .build());

        if (dto.getCodigoAfiliado() != null && !dto.getCodigoAfiliado().isBlank()) {
            String cod = dto.getCodigoAfiliado().trim();
            fidelizacionRepository.findByCodigoAfiliado(cod).ifPresent(existing -> {
                if (!existing.getId().equals(f.getId())) {
                    throw new BadRequestException("El código de afiliado '" + cod + "' ya está en uso.");
                }
            });
            f.setCodigoAfiliado(cod);
        } else if (f.getCodigoAfiliado() == null) {
            f.setCodigoAfiliado("CA-" + (cliente.getId() != null ? cliente.getId() + 10000 : System.currentTimeMillis() % 100000));
        }

        if (dto.getEstadoMembresia() != null) {
            f.setEstadoMembresia(dto.getEstadoMembresia().trim().toUpperCase());
        }
        if (dto.getPorcentajeDescuento() != null) {
            f.setPorcentajeDescuento(dto.getPorcentajeDescuento());
        }
        if (dto.getPuntosAcumulados() != null) {
            f.setPuntosAcumulados(dto.getPuntosAcumulados());
        }
        if (dto.getFechaAfiliacion() != null) {
            f.setFechaAfiliacion(dto.getFechaAfiliacion());
        }

        cliente.setFidelizacion(f);
        return FidelizacionResponseDTO.fromEntity(fidelizacionRepository.save(f));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        FidelizacionCrm f = fidelizacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de fidelización no encontrado con ID: " + id));
        if (f.getCliente() != null) {
            f.getCliente().setFidelizacion(null);
        }
        fidelizacionRepository.delete(f);
    }

    @Override
    @Transactional
    public void acumularPuntos(Long clienteId, int puntos) {
        fidelizacionRepository.findByClienteId(clienteId).ifPresent(f -> {
            int actuales = f.getPuntosAcumulados() != null ? f.getPuntosAcumulados() : 0;
            f.setPuntosAcumulados(actuales + puntos);
            fidelizacionRepository.save(f);
        });
    }
}
