package com.sg.farmacia.repository;

import com.sg.farmacia.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Long> {

    List<Compra> findByProveedorId(Long proveedorId);

    @Query("SELECT c FROM Compra c " +
           "JOIN FETCH c.proveedor " +
           "JOIN FETCH c.usuario u " +
           "LEFT JOIN FETCH u.empleado " +
           "LEFT JOIN FETCH c.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "ORDER BY c.fechaCompra DESC")
    List<Compra> findAllConDetalles();

    @Query("SELECT c FROM Compra c " +
           "JOIN FETCH c.proveedor " +
           "JOIN FETCH c.usuario u " +
           "LEFT JOIN FETCH u.empleado " +
           "LEFT JOIN FETCH c.detalles d " +
           "LEFT JOIN FETCH d.producto " +
           "WHERE c.id = :id")
    Optional<Compra> findByIdConDetalles(@Param("id") Long id);

    @Query("SELECT c FROM Compra c " +
           "JOIN FETCH c.proveedor " +
           "JOIN FETCH c.usuario u " +
           "WHERE (:desde IS NULL OR c.fechaCompra >= :desde) " +
           "AND (:hasta IS NULL OR c.fechaCompra <= :hasta) " +
           "ORDER BY c.fechaCompra DESC")
    List<Compra> buscarPorRangoFechas(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
