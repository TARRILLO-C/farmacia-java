package com.sg.farmacia.repository;

import com.sg.farmacia.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    Optional<Cliente> findByDniRuc(String dniRuc);

    Optional<Cliente> findByNumeroClienteAmigo(String numeroClienteAmigo);

    List<Cliente> findByNombreCompletoContainingIgnoreCase(String nombreCompleto);

    boolean existsByDniRuc(String dniRuc);

    boolean existsByDniRucAndIdNot(String dniRuc, Long id);

    boolean existsByNumeroClienteAmigo(String numeroClienteAmigo);

    @Query("SELECT c FROM Cliente c WHERE " +
           "LOWER(c.dniRuc) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(c.nombreCompleto) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "(c.numeroClienteAmigo IS NOT NULL AND LOWER(c.numeroClienteAmigo) LIKE LOWER(CONCAT('%', :term, '%')))")
    List<Cliente> buscarPorTermino(@Param("term") String term);
}
