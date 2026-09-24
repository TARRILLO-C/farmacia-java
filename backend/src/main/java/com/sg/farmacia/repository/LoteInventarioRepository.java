package com.sg.farmacia.repository;

import com.sg.farmacia.model.LoteInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LoteInventarioRepository extends JpaRepository<LoteInventario, Long> {

    List<LoteInventario> findByProductoId(Long productoId);

    List<LoteInventario> findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(Long productoId);

    Optional<LoteInventario> findByProductoIdAndCodigoLote(Long productoId, String codigoLote);

    boolean existsByProductoIdAndCodigoLote(Long productoId, String codigoLote);

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.stockActual <= l.stockMinimo ORDER BY l.stockActual ASC")
    List<LoteInventario> findLotesBajoStock();

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.fechaVencimiento <= :fechaLimite ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findLotesProximosAVencer(@Param("fechaLimite") LocalDate fechaLimite);

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.stockActual > 0 ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findAllDisponiblesFEFO();
}
