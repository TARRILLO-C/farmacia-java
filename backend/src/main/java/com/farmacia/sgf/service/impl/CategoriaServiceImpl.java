package com.farmacia.sgf.service.impl;

import com.farmacia.sgf.dto.categoria.CategoriaRequestDTO;
import com.farmacia.sgf.dto.categoria.CategoriaResponseDTO;
import com.farmacia.sgf.exception.BadRequestException;
import com.farmacia.sgf.exception.ResourceNotFoundException;
import com.farmacia.sgf.model.Categoria;
import com.farmacia.sgf.repository.CategoriaRepository;
import com.farmacia.sgf.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoriaResponseDTO> listarTodas() {
        return categoriaRepository.findAll()
                .stream()
                .map(CategoriaResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoriaResponseDTO obtenerPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + id));
        return CategoriaResponseDTO.fromEntity(categoria);
    }

    @Override
    @Transactional
    public CategoriaResponseDTO crear(CategoriaRequestDTO dto) {
        if (categoriaRepository.existsByNombreIgnoreCase(dto.getNombre().trim())) {
            throw new BadRequestException("Ya existe una categoría registrada con el nombre: " + dto.getNombre().trim());
        }

        Categoria categoria = Categoria.builder()
                .nombre(dto.getNombre().trim())
                .descripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        Categoria guardada = categoriaRepository.save(categoria);
        return CategoriaResponseDTO.fromEntity(guardada);
    }

    @Override
    @Transactional
    public CategoriaResponseDTO actualizar(Long id, CategoriaRequestDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + id));

        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(dto.getNombre().trim(), id)) {
            throw new BadRequestException("Ya existe otra categoría registrada con el nombre: " + dto.getNombre().trim());
        }

        categoria.setNombre(dto.getNombre().trim());
        categoria.setDescripcion(dto.getDescripcion() != null ? dto.getDescripcion().trim() : null);
        if (dto.getActivo() != null) {
            categoria.setActivo(dto.getActivo());
        }

        Categoria actualizada = categoriaRepository.save(categoria);
        return CategoriaResponseDTO.fromEntity(actualizada);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró la categoría con ID: " + id));
        categoriaRepository.delete(categoria);
    }
}
