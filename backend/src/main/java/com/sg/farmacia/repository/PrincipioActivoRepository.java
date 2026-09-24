package com.sg.farmacia.repository;

import com.sg.farmacia.model.PrincipioActivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PrincipioActivoRepository extends JpaRepository<PrincipioActivo, Long> {

    Optional<PrincipioActivo> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, Long id);
}
