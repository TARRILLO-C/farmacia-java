package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.metodopago.MetodoPagoRequestDTO;
import com.sg.farmacia.dto.metodopago.MetodoPagoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.MetodoPago;
import com.sg.farmacia.repository.MetodoPagoRepository;
import com.sg.farmacia.service.MetodoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MetodoPagoServiceImpl implements MetodoPagoService {

    private final MetodoPagoRepository metodoPagoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MetodoPagoResponseDTO> listarTodos() {
        return metodoPagoRepository.findAll().stream()
                .map(MetodoPagoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MetodoPagoResponseDTO> listarActivos() {
        return metodoPagoRepository.findByActivoTrue().stream()
                .map(MetodoPagoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MetodoPagoResponseDTO obtenerPorId(Long id) {
        MetodoPago mp = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        return MetodoPagoResponseDTO.fromEntity(mp);
    }

    @Override
    @Transactional
    public MetodoPagoResponseDTO crear(MetodoPagoRequestDTO dto) {
        String nombre = dto.getNombre().trim();
        if (metodoPagoRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un método de pago con el nombre: " + nombre);
        }

        MetodoPago mp = MetodoPago.builder()
                .nombre(nombre)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return MetodoPagoResponseDTO.fromEntity(metodoPagoRepository.save(mp));
    }

    @Override
    @Transactional
    public MetodoPagoResponseDTO actualizar(Long id, MetodoPagoRequestDTO dto) {
        MetodoPago mp = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));

        String nombre = dto.getNombre().trim();
        if (!mp.getNombre().equalsIgnoreCase(nombre) && metodoPagoRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un método de pago con el nombre: " + nombre);
        }

        mp.setNombre(nombre);
        if (dto.getActivo() != null) {
            mp.setActivo(dto.getActivo());
        }

        return MetodoPagoResponseDTO.fromEntity(metodoPagoRepository.save(mp));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        MetodoPago mp = metodoPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        mp.setActivo(false);
        metodoPagoRepository.save(mp);
    }

    @Override
    @Transactional
    public MetodoPago resolverMetodoPago(Long id, String nombre) {
        if (id != null) {
            return metodoPagoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return metodoPagoRepository.findByNombre(nombre.trim())
                    .orElseGet(() -> metodoPagoRepository.save(MetodoPago.builder().nombre(nombre.trim()).activo(true).build()));
        }
        // Fallback default Efectivo
        return metodoPagoRepository.findByNombre("Efectivo")
                .orElseGet(() -> metodoPagoRepository.save(MetodoPago.builder().nombre("Efectivo").activo(true).build()));
    }
}
