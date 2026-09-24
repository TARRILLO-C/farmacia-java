package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.laboratorio.LaboratorioRequestDTO;
import com.sg.farmacia.dto.laboratorio.LaboratorioResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Laboratorio;
import com.sg.farmacia.repository.LaboratorioRepository;
import com.sg.farmacia.service.LaboratorioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaboratorioServiceImpl implements LaboratorioService {

    private final LaboratorioRepository laboratorioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<LaboratorioResponseDTO> listarTodos() {
        return laboratorioRepository.findAll().stream()
                .map(LaboratorioResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LaboratorioResponseDTO> listarActivos() {
        return laboratorioRepository.findByActivoTrue().stream()
                .map(LaboratorioResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public LaboratorioResponseDTO obtenerPorId(Long id) {
        Laboratorio lab = laboratorioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratorio no encontrado con ID: " + id));
        return LaboratorioResponseDTO.fromEntity(lab);
    }

    @Override
    @Transactional
    public LaboratorioResponseDTO crear(LaboratorioRequestDTO dto) {
        String nombre = dto.getNombre().trim();
        if (laboratorioRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un laboratorio con el nombre: " + nombre);
        }

        Laboratorio lab = Laboratorio.builder()
                .nombre(nombre)
                .paisOrigen(dto.getPaisOrigen())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return LaboratorioResponseDTO.fromEntity(laboratorioRepository.save(lab));
    }

    @Override
    @Transactional
    public LaboratorioResponseDTO actualizar(Long id, LaboratorioRequestDTO dto) {
        Laboratorio lab = laboratorioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratorio no encontrado con ID: " + id));

        String nombre = dto.getNombre().trim();
        if (laboratorioRepository.existsByNombreAndIdNot(nombre, id)) {
            throw new BadRequestException("Ya existe otro laboratorio con el nombre: " + nombre);
        }

        lab.setNombre(nombre);
        lab.setPaisOrigen(dto.getPaisOrigen());
        if (dto.getActivo() != null) {
            lab.setActivo(dto.getActivo());
        }

        return LaboratorioResponseDTO.fromEntity(laboratorioRepository.save(lab));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Laboratorio lab = laboratorioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratorio no encontrado con ID: " + id));
        lab.setActivo(false);
        laboratorioRepository.save(lab);
    }

    @Override
    @Transactional
    public Laboratorio resolverEntidad(Long id, String nombre) {
        if (id != null) {
            return laboratorioRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Laboratorio no encontrado con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return laboratorioRepository.findByNombre(nombre.trim())
                    .orElseGet(() -> laboratorioRepository.save(Laboratorio.builder().nombre(nombre.trim()).activo(true).build()));
        }
        return null;
    }
}
