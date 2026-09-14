package com.sg.farmacia.repository;

import com.sg.farmacia.model.Recibo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {

    Optional<Recibo> findByCodigoComprobante(String codigoComprobante);

    Optional<Recibo> findByVentaId(Long ventaId);

    @Query("SELECT COALESCE(MAX(r.id), 0) FROM Recibo r")
    Long findMaxId();

    @Query("SELECT r FROM Recibo r " +
           "JOIN FETCH r.venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "WHERE r.id = :id")
    Optional<Recibo> findByIdConDetalles(@Param("id") Long id);

    @Query("SELECT r FROM Recibo r " +
           "JOIN FETCH r.venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "WHERE r.codigoComprobante = :codigo")
    Optional<Recibo> findByCodigoConDetalles(@Param("codigo") String codigo);
}
