package com.sg.farmacia.repository;

import com.sg.farmacia.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByNumeroVenta(String numeroVenta);

    @Query("SELECT v FROM Venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.usuario u " +
           "LEFT JOIN FETCH u.empleado " +
           "LEFT JOIN FETCH v.metodoPago " +
           "LEFT JOIN FETCH v.recibo " +
           "WHERE v.cliente.id = :clienteId ORDER BY v.fecha DESC")
    List<Venta> findByClienteId(@Param("clienteId") Long clienteId);

    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.usuario u " +
           "LEFT JOIN FETCH u.empleado " +
           "LEFT JOIN FETCH v.metodoPago " +
           "LEFT JOIN FETCH v.recibo " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.lote l " +
           "LEFT JOIN FETCH l.producto " +
           "ORDER BY v.fecha DESC")
    List<Venta> findAllConDetalles();

    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.cliente c " +
           "LEFT JOIN FETCH v.usuario u " +
           "LEFT JOIN FETCH u.empleado " +
           "LEFT JOIN FETCH v.metodoPago " +
           "LEFT JOIN FETCH v.recibo " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.lote l " +
           "LEFT JOIN FETCH l.producto " +
           "WHERE (:fechaInicio IS NULL OR v.fecha >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fecha <= :fechaFin) " +
           "AND (:dni IS NULL OR :dni = '' OR (c IS NOT NULL AND LOWER(c.numeroDocumento) = LOWER(:dni))) " +
           "ORDER BY v.fecha DESC")
    List<Venta> buscarHistorial(@Param("fechaInicio") LocalDateTime fechaInicio,
                                @Param("fechaFin") LocalDateTime fechaFin,
                                @Param("dni") String dni);

    @Query("SELECT COALESCE(MAX(v.id), 0) FROM Venta v")
    Long findMaxId();
}
