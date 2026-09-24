package com.sg.farmacia.repository;

import com.sg.farmacia.model.Presentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PresentacionRepository extends JpaRepository<Presentacion, Long> {

    Optional<Presentacion> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    boolean existsByNombreAndIdNot(String nombre, Long id);
}
