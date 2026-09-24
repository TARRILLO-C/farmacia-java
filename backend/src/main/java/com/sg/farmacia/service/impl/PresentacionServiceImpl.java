package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.presentacion.PresentacionRequestDTO;
import com.sg.farmacia.dto.presentacion.PresentacionResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Presentacion;
import com.sg.farmacia.repository.PresentacionRepository;
import com.sg.farmacia.service.PresentacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresentacionServiceImpl implements PresentacionService {

    private final PresentacionRepository presentacionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PresentacionResponseDTO> listarTodas() {
        return presentacionRepository.findAll().stream()
                .map(PresentacionResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PresentacionResponseDTO obtenerPorId(Long id) {
        Presentacion p = presentacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación no encontrada con ID: " + id));
        return PresentacionResponseDTO.fromEntity(p);
    }

    @Override
    @Transactional
    public PresentacionResponseDTO crear(PresentacionRequestDTO dto) {
        String nombre = dto.getNombre().trim();
        if (presentacionRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe una presentación con el nombre: " + nombre);
        }

        Presentacion p = Presentacion.builder()
                .nombre(nombre)
                .build();

        return PresentacionResponseDTO.fromEntity(presentacionRepository.save(p));
    }

    @Override
    @Transactional
    public PresentacionResponseDTO actualizar(Long id, PresentacionRequestDTO dto) {
        Presentacion p = presentacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación no encontrada con ID: " + id));

        String nombre = dto.getNombre().trim();
        if (presentacionRepository.existsByNombreAndIdNot(nombre, id)) {
            throw new BadRequestException("Ya existe otra presentación con el nombre: " + nombre);
        }

        p.setNombre(nombre);

        return PresentacionResponseDTO.fromEntity(presentacionRepository.save(p));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!presentacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Presentación no encontrada con ID: " + id);
        }
        presentacionRepository.deleteById(id);
    }

    @Override
    @Transactional
    public Presentacion resolverEntidad(Long id, String nombre) {
        if (id != null) {
            return presentacionRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Presentación no encontrada con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return presentacionRepository.findByNombre(nombre.trim())
                    .orElseGet(() -> presentacionRepository.save(Presentacion.builder().nombre(nombre.trim()).build()));
        }
        return null;
    }
}
