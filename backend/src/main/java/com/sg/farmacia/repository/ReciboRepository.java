package com.sg.farmacia.repository;

import com.sg.farmacia.model.Recibo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReciboRepository extends JpaRepository<Recibo, Long> {

    Optional<Recibo> findByNumeroRecibo(String numeroRecibo);

    default Optional<Recibo> findByCodigoComprobante(String codigoComprobante) {
        return findByNumeroRecibo(codigoComprobante);
    }

    Optional<Recibo> findByVentaId(Long ventaId);

    @Query("SELECT COALESCE(MAX(r.id), 0) FROM Recibo r")
    Long findMaxId();

    @Query("SELECT r FROM Recibo r " +
           "JOIN FETCH r.venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.lote l " +
           "LEFT JOIN FETCH l.producto " +
           "WHERE r.id = :id")
    Optional<Recibo> findByIdConDetalles(@Param("id") Long id);

    @Query("SELECT r FROM Recibo r " +
           "JOIN FETCH r.venta v " +
           "LEFT JOIN FETCH v.cliente " +
           "LEFT JOIN FETCH v.detalles d " +
           "LEFT JOIN FETCH d.lote l " +
           "LEFT JOIN FETCH l.producto " +
           "WHERE r.numeroRecibo = :codigo")
    Optional<Recibo> findByCodigoConDetalles(@Param("codigo") String codigo);
}
