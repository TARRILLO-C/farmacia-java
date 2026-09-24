package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.proveedor.ProveedorRequestDTO;
import com.sg.farmacia.dto.proveedor.ProveedorResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Proveedor;
import com.sg.farmacia.repository.ProveedorRepository;
import com.sg.farmacia.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(ProveedorResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> listarActivos() {
        return proveedorRepository.findByActivoTrue().stream()
                .map(ProveedorResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDTO obtenerPorId(Long id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        return ProveedorResponseDTO.fromEntity(p);
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDTO obtenerPorRuc(String ruc) {
        Proveedor p = proveedorRepository.findByRuc(ruc)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con RUC: " + ruc));
        return ProveedorResponseDTO.fromEntity(p);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDTO> buscar(String term) {
        return proveedorRepository.buscarPorTermino(term).stream()
                .map(ProveedorResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProveedorResponseDTO crear(ProveedorRequestDTO dto) {
        String ruc = dto.getRuc().trim();
        if (proveedorRepository.existsByRuc(ruc)) {
            throw new BadRequestException("Ya existe un proveedor registrado con el RUC: " + ruc);
        }

        Proveedor p = Proveedor.builder()
                .ruc(ruc)
                .razonSocial(dto.getRazonSocial().trim())
                .contacto(dto.getContacto())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return ProveedorResponseDTO.fromEntity(proveedorRepository.save(p));
    }

    @Override
    @Transactional
    public ProveedorResponseDTO actualizar(Long id, ProveedorRequestDTO dto) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));

        String ruc = dto.getRuc().trim();
        if (proveedorRepository.existsByRucAndIdNot(ruc, id)) {
            throw new BadRequestException("Ya existe otro proveedor con el RUC: " + ruc);
        }

        p.setRuc(ruc);
        p.setRazonSocial(dto.getRazonSocial().trim());
        p.setContacto(dto.getContacto());
        p.setTelefono(dto.getTelefono());
        p.setEmail(dto.getEmail());
        if (dto.getActivo() != null) {
            p.setActivo(dto.getActivo());
        }

        return ProveedorResponseDTO.fromEntity(proveedorRepository.save(p));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Proveedor p = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        p.setActivo(false);
        proveedorRepository.save(p);
    }

    @Override
    @Transactional
    public Proveedor resolverEntidad(Long id, String ruc) {
        if (id != null) {
            return proveedorRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        }
        if (ruc != null && !ruc.isBlank()) {
            return proveedorRepository.findByRuc(ruc.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con RUC: " + ruc));
        }
        throw new BadRequestException("Debe indicar el id o ruc del proveedor.");
    }
}
