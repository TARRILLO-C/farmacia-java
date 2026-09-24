package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.empleado.EmpleadoRequestDTO;
import com.sg.farmacia.dto.empleado.EmpleadoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Empleado;
import com.sg.farmacia.repository.EmpleadoRepository;
import com.sg.farmacia.service.EmpleadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmpleadoServiceImpl implements EmpleadoService {

    private final EmpleadoRepository empleadoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoResponseDTO> listarTodos() {
        return empleadoRepository.findAll().stream()
                .map(EmpleadoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoResponseDTO> listarActivos() {
        return empleadoRepository.findByActivoTrue().stream()
                .map(EmpleadoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoResponseDTO obtenerPorId(Long id) {
        Empleado e = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + id));
        return EmpleadoResponseDTO.fromEntity(e);
    }

    @Override
    @Transactional(readOnly = true)
    public EmpleadoResponseDTO obtenerPorDni(String dni) {
        Empleado e = empleadoRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con DNI: " + dni));
        return EmpleadoResponseDTO.fromEntity(e);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmpleadoResponseDTO> buscar(String term) {
        return empleadoRepository.buscarPorTermino(term).stream()
                .map(EmpleadoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmpleadoResponseDTO crear(EmpleadoRequestDTO dto) {
        String dni = dto.getDni().trim();
        if (empleadoRepository.existsByDni(dni)) {
            throw new BadRequestException("Ya existe un empleado con el DNI: " + dni);
        }

        Empleado e = Empleado.builder()
                .dni(dni)
                .nombres(dto.getNombres().trim())
                .apellidos(dto.getApellidos().trim())
                .telefono(dto.getTelefono())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return EmpleadoResponseDTO.fromEntity(empleadoRepository.save(e));
    }

    @Override
    @Transactional
    public EmpleadoResponseDTO actualizar(Long id, EmpleadoRequestDTO dto) {
        Empleado e = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + id));

        String dni = dto.getDni().trim();
        if (empleadoRepository.existsByDniAndIdNot(dni, id)) {
            throw new BadRequestException("Ya existe otro empleado con el DNI: " + dni);
        }

        e.setDni(dni);
        e.setNombres(dto.getNombres().trim());
        e.setApellidos(dto.getApellidos().trim());
        e.setTelefono(dto.getTelefono());
        if (dto.getActivo() != null) {
            e.setActivo(dto.getActivo());
        }

        return EmpleadoResponseDTO.fromEntity(empleadoRepository.save(e));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Empleado e = empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + id));
        e.setActivo(false);
        empleadoRepository.save(e);
    }

    @Override
    @Transactional
    public Empleado resolverEntidad(Long id, String dni) {
        if (id != null) {
            return empleadoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con ID: " + id));
        }
        if (dni != null && !dni.isBlank()) {
            return empleadoRepository.findByDni(dni.trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado con DNI: " + dni));
        }
        throw new BadRequestException("Debe especificar el id o DNI del empleado.");
    }
}
