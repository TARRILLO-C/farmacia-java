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

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.fidelizacion WHERE c.numeroDocumento = :numeroDocumento")
    Optional<Cliente> findByNumeroDocumento(@Param("numeroDocumento") String numeroDocumento);

    default Optional<Cliente> findByDniRuc(String dniRuc) {
        return findByNumeroDocumento(dniRuc);
    }

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.fidelizacion f WHERE f.codigoAfiliado = :codigo")
    Optional<Cliente> findByNumeroClienteAmigo(@Param("codigo") String codigo);

    boolean existsByNumeroDocumento(String numeroDocumento);

    boolean existsByNumeroDocumentoAndIdNot(String numeroDocumento, Long id);

    default boolean existsByDniRuc(String dniRuc) {
        return existsByNumeroDocumento(dniRuc);
    }

    default boolean existsByDniRucAndIdNot(String dniRuc, Long id) {
        return existsByNumeroDocumentoAndIdNot(dniRuc, id);
    }

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.fidelizacion ORDER BY c.id DESC")
    List<Cliente> findAllWithFidelizacion();

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.fidelizacion f WHERE " +
           "LOWER(c.numeroDocumento) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(c.nombreCompleto) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "(f IS NOT NULL AND LOWER(f.codigoAfiliado) LIKE LOWER(CONCAT('%', :term, '%')))")
    List<Cliente> buscarPorTermino(@Param("term") String term);
}
