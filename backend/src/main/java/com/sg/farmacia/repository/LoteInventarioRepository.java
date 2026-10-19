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

    // Consultas explícitas: LoteInventario expone getProductoId() (JSON), y Spring Data lo toma como
    // atributo "productoId" en vez de navegar a producto.id, generando JPQL inválido.

    @Query("SELECT l FROM LoteInventario l WHERE l.producto.id = :productoId")
    List<LoteInventario> findByProductoId(@Param("productoId") Long productoId);

    @Query("SELECT l FROM LoteInventario l WHERE l.producto.id = :productoId AND l.activo = true ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findByProductoIdAndActivoTrueOrderByFechaVencimientoAsc(@Param("productoId") Long productoId);

    @Query("SELECT l FROM LoteInventario l WHERE l.producto.id = :productoId AND l.codigoLote = :codigoLote")
    Optional<LoteInventario> findByProductoIdAndCodigoLote(@Param("productoId") Long productoId, @Param("codigoLote") String codigoLote);

    @Query("SELECT COUNT(l) > 0 FROM LoteInventario l WHERE l.producto.id = :productoId AND l.codigoLote = :codigoLote")
    boolean existsByProductoIdAndCodigoLote(@Param("productoId") Long productoId, @Param("codigoLote") String codigoLote);

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.stockActual <= l.stockMinimo ORDER BY l.stockActual ASC")
    List<LoteInventario> findLotesBajoStock();

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.fechaVencimiento <= :fechaLimite ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findLotesProximosAVencer(@Param("fechaLimite") LocalDate fechaLimite);

    @Query("SELECT l FROM LoteInventario l JOIN FETCH l.producto WHERE l.activo = true AND l.stockActual > 0 ORDER BY l.fechaVencimiento ASC")
    List<LoteInventario> findAllDisponiblesFEFO();
}
