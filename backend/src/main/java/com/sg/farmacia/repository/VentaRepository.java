package com.sg.farmacia.repository;

import com.sg.farmacia.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    List<Venta> findByClienteId(Long clienteId);

    @Query("SELECT v FROM Venta v LEFT JOIN FETCH v.detalles d LEFT JOIN FETCH d.producto LEFT JOIN FETCH v.cliente LEFT JOIN FETCH v.recibo ORDER BY v.fechaVenta DESC")
    List<Venta> findAllConDetalles();

    @Query("SELECT DISTINCT v FROM Venta v " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "LEFT JOIN FETCH v.cliente c " +
           "LEFT JOIN FETCH v.recibo r " +
           "WHERE (:fechaInicio IS NULL OR v.fechaVenta >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR v.fechaVenta <= :fechaFin) " +
           "AND (:dni IS NULL OR :dni = '' OR (c IS NOT NULL AND LOWER(c.dniRuc) = LOWER(:dni))) " +
           "ORDER BY v.fechaVenta DESC")
    List<Venta> buscarHistorial(@Param("fechaInicio") java.time.LocalDateTime fechaInicio,
                                @Param("fechaFin") java.time.LocalDateTime fechaFin,
                                @Param("dni") String dni);
}
