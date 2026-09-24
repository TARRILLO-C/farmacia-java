package com.sg.farmacia.service.impl;

import com.sg.farmacia.dto.rol.RoleRequestDTO;
import com.sg.farmacia.dto.rol.RoleResponseDTO;
import com.sg.farmacia.exception.BadRequestException;
import com.sg.farmacia.exception.ResourceNotFoundException;
import com.sg.farmacia.model.Role;
import com.sg.farmacia.repository.RoleRepository;
import com.sg.farmacia.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponseDTO> listarTodos() {
        return roleRepository.findAll().stream()
                .map(RoleResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RoleResponseDTO obtenerPorId(Long id) {
        Role rol = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + id));
        return RoleResponseDTO.fromEntity(rol);
    }

    @Override
    @Transactional
    public RoleResponseDTO crear(RoleRequestDTO dto) {
        String nombre = dto.getNombre().trim().toUpperCase();
        if (roleRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un rol con el nombre: " + nombre);
        }

        Role rol = Role.builder()
                .nombre(nombre)
                .descripcion(dto.getDescripcion())
                .build();

        return RoleResponseDTO.fromEntity(roleRepository.save(rol));
    }

    @Override
    @Transactional
    public RoleResponseDTO actualizar(Long id, RoleRequestDTO dto) {
        Role rol = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + id));

        String nombre = dto.getNombre().trim().toUpperCase();
        if (!rol.getNombre().equalsIgnoreCase(nombre) && roleRepository.existsByNombre(nombre)) {
            throw new BadRequestException("Ya existe un rol con el nombre: " + nombre);
        }

        rol.setNombre(nombre);
        rol.setDescripcion(dto.getDescripcion());

        return RoleResponseDTO.fromEntity(roleRepository.save(rol));
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        if (!roleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rol no encontrado con ID: " + id);
        }
        roleRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public Role obtenerEntidadPorIdONombre(Long id, String nombre) {
        if (id != null) {
            return roleRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con ID: " + id));
        }
        if (nombre != null && !nombre.isBlank()) {
            return roleRepository.findByNombre(nombre.trim().toUpperCase())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con nombre: " + nombre));
        }
        throw new BadRequestException("Debe especificar el id o nombre del rol.");
    }
}
