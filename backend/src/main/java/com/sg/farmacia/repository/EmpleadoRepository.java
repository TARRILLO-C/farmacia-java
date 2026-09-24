package com.sg.farmacia.repository;

import com.sg.farmacia.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {

    Optional<Empleado> findByDni(String dni);

    boolean existsByDni(String dni);

    boolean existsByDniAndIdNot(String dni, Long id);

    List<Empleado> findByActivoTrue();

    @Query("SELECT e FROM Empleado e WHERE " +
           "LOWER(e.dni) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(e.nombres) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(e.apellidos) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Empleado> buscarPorTermino(@Param("term") String term);
}
