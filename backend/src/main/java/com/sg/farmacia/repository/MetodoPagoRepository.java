package com.sg.farmacia.repository;

import com.sg.farmacia.model.MetodoPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MetodoPagoRepository extends JpaRepository<MetodoPago, Long> {

    Optional<MetodoPago> findByNombre(String nombre);

    List<MetodoPago> findByActivoTrue();

    boolean existsByNombre(String nombre);
}
