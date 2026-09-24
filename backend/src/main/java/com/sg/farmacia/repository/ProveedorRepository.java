package com.sg.farmacia.repository;

import com.sg.farmacia.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {

    Optional<Proveedor> findByRuc(String ruc);

    boolean existsByRuc(String ruc);

    boolean existsByRucAndIdNot(String ruc, Long id);

    List<Proveedor> findByActivoTrue();

    @Query("SELECT p FROM Proveedor p WHERE " +
           "LOWER(p.ruc) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.razonSocial) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.contacto) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Proveedor> buscarPorTermino(@Param("term") String term);
}
