package com.sg.farmacia.repository;

import com.sg.farmacia.model.Caja;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CajaRepository extends JpaRepository<Caja, Long> {

    Optional<Caja> findFirstByEstadoOrderByFechaAperturaDesc(String estado);

    @Query("SELECT c FROM Caja c WHERE c.estado = 'ABIERTA' ORDER BY c.fechaApertura DESC")
    List<Caja> findCajasAbiertas();

    @Query("SELECT c FROM Caja c WHERE " +
           "(:desde IS NULL OR c.fechaApertura >= :desde) AND " +
           "(:hasta IS NULL OR c.fechaApertura <= :hasta) " +
           "ORDER BY c.fechaApertura DESC")
    List<Caja> buscarHistorial(@Param("desde") LocalDateTime desde, @Param("hasta") LocalDateTime hasta);
}
