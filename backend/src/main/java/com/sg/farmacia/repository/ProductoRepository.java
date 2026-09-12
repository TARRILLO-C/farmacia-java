package com.sg.farmacia.repository;

import com.sg.farmacia.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarrasAndIdNot(String codigoBarras, Long id);

    /**
     * Buscar productos por código de barras o nombre con coincidencia parcial.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE " +
           "LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Producto> buscarPorCodigoBarrasONombre(@Param("term") String term);

    /**
     * Filtrar productos por el ID de su categoría.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE p.categoria.id = :categoriaId")
    List<Producto> findByCategoriaId(@Param("categoriaId") Long categoriaId);

    /**
     * Filtrar productos por categoría y coincidencia en código de barras o nombre.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE " +
           "p.categoria.id = :categoriaId AND (" +
           "LOWER(p.codigoBarras) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :term, '%')))")
    List<Producto> buscarPorCategoriaYTermino(@Param("categoriaId") Long categoriaId, @Param("term") String term);

    /**
     * Consultar productos con stock menor o igual a un límite especificado.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE p.stock <= :limite ORDER BY p.stock ASC")
    List<Producto> findByStockLessThanEqual(@Param("limite") Integer limite);

    /**
     * Consultar productos con fecha de caducidad menor o igual a una fecha límite (o en un rango).
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE " +
           "p.fechaCaducidad IS NOT NULL AND p.fechaCaducidad <= :fechaLimite " +
           "ORDER BY p.fechaCaducidad ASC")
    List<Producto> findByFechaCaducidadLessThanEqual(@Param("fechaLimite") LocalDate fechaLimite);

    /**
     * Consultar productos que vencen entre una fecha de inicio y una fecha de fin.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria WHERE " +
           "p.fechaCaducidad IS NOT NULL AND p.fechaCaducidad BETWEEN :inicio AND :fin " +
           "ORDER BY p.fechaCaducidad ASC")
    List<Producto> findByFechaCaducidadBetween(@Param("inicio") LocalDate inicio, @Param("fin") LocalDate fin);

    /**
     * Cargar todos los productos inicializando de forma eficiente su categoría asociada.
     */
    @Query("SELECT p FROM Producto p LEFT JOIN FETCH p.categoria ORDER BY p.id DESC")
    List<Producto> findAllWithCategoria();
}
