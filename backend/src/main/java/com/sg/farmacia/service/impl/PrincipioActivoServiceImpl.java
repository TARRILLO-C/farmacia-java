package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.principioactivo.PrincipioActivoRequestDTO;
import com.sg.farmacia.dto.principioactivo.PrincipioActivoResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.PrincipioActivo;
import com.sg.farmacia.repository.PrincipioActivoRepository;
import com.sg.farmacia.service.PrincipioActivoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrincipioActivoServiceImpl implements PrincipioActivoService {

    private final PrincipioActivoRepository principioActivoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PrincipioActivoResponseDTO> listarTodos() {
        return principioActivoRepository.findAll().stream()
                .map(PrincipioActivoResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PrincipioActivoResponseDTO obtenerPorId(Long id) {
        PrincipioActivo pa = principioActivoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Principio activo no encontrado con ID: " + id));
        return PrincipioActivoResponseDTO.fromEntity(pa);
    }

    @Override
    @Transactional
    public PrincipioActivoResponseDTO crear(PrincipioActivoRequestDTO dto) {
        String nombre = dto.getNombre().trim();
        if (principioActivoRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un principio activo con el nombre: " + nombre);
        }

        PrincipioActivo pa = PrincipioActivo.builder()
                .nombre(nombre)
                .descripcion(dto.getDescripcion())
                .build();

        return PrincipioActivoResponseDTO.fromEntity(principioActivoRepository.save(pa));
    }

    @Override
    @Transactional
    public PrincipioActivoResponseDTO actualizar(Long id, PrincipioActivoRequestDTO dto) {
        PrincipioActivo pa = principioActivoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Principio activo no encontrado con ID: " + id));

        String nombre = dto.getNombre().trim();
        if (principioActivoRepository.existsByNombreAndIdNot(nombre, id)) {
            throw new BadRequestException("Ya existe otro principio activo con el nombre: " + nombre);
        }

        pa.setNombre(nombre);
        pa.setDescripcion(dto.getDescripcion());

        return PrincipioActivoResponseDTO.fromEntity(principioActivoRepository.save(pa));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!principioActivoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Principio activo no encontrado con ID: " + id);
        }
        principioActivoRepository.deleteById(id);
    }

    @Override
    @Transactional
    public PrincipioActivo resolverEntidad(Long id, String nombre) {
        if (id != null) {
            return principioActivoRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Principio activo no encontrado con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return principioActivoRepository.findByNombre(nombre.trim())
                    .orElseGet(() -> principioActivoRepository.save(PrincipioActivo.builder().nombre(nombre.trim()).build()));
        }
        return null;
    }
}
