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

    @Query("SELECT p FROM Producto p " +
           "LEFT JOIN FETCH p.categoria " +
           "LEFT JOIN FETCH p.laboratorio " +
           "LEFT JOIN FETCH p.principioActivo " +
           "LEFT JOIN FETCH p.presentacion " +
           "LEFT JOIN FETCH p.lotes " +
           "WHERE p.codigo = :codigo")
    Optional<Producto> findByCodigo(@Param("codigo") String codigo);

    default Optional<Producto> findByCodigoBarras(String codigoBarras) {
        return findByCodigo(codigoBarras);
    }

    boolean existsByCodigo(String codigo);

    default boolean existsByCodigoBarras(String codigoBarras) {
        return existsByCodigo(codigoBarras);
    }

    boolean existsByCodigoAndIdNot(String codigo, Long id);

    default boolean existsByCodigoBarrasAndIdNot(String codigoBarras, Long id) {
        return existsByCodigoAndIdNot(codigoBarras, id);
    }

    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.categoria " +
           "LEFT JOIN FETCH p.laboratorio " +
           "LEFT JOIN FETCH p.principioActivo " +
           "LEFT JOIN FETCH p.presentacion " +
           "LEFT JOIN FETCH p.lotes " +
           "WHERE LOWER(p.codigo) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :term, '%'))")
    List<Producto> buscarPorCodigoONombre(@Param("term") String term);

    default List<Producto> buscarPorCodigoBarrasONombre(String term) {
        return buscarPorCodigoONombre(term);
    }

    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.categoria " +
           "LEFT JOIN FETCH p.laboratorio " +
           "LEFT JOIN FETCH p.principioActivo " +
           "LEFT JOIN FETCH p.presentacion " +
           "LEFT JOIN FETCH p.lotes " +
           "WHERE p.categoria.id = :categoriaId")
    List<Producto> findByCategoriaId(@Param("categoriaId") Long categoriaId);

    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.categoria " +
           "LEFT JOIN FETCH p.laboratorio " +
           "LEFT JOIN FETCH p.principioActivo " +
           "LEFT JOIN FETCH p.presentacion " +
           "LEFT JOIN FETCH p.lotes " +
           "WHERE p.categoria.id = :categoriaId AND (" +
           "LOWER(p.codigo) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
           "LOWER(p.nombre) LIKE LOWER(CONCAT('%', :term, '%')))")
    List<Producto> buscarPorCategoriaYTermino(@Param("categoriaId") Long categoriaId, @Param("term") String term);

    @Query("SELECT DISTINCT p FROM Producto p " +
           "LEFT JOIN FETCH p.categoria " +
           "LEFT JOIN FETCH p.laboratorio " +
           "LEFT JOIN FETCH p.principioActivo " +
           "LEFT JOIN FETCH p.presentacion " +
           "LEFT JOIN FETCH p.lotes " +
           "ORDER BY p.id DESC")
    List<Producto> findAllWithRelations();

    default List<Producto> findAllWithCategoria() {
        return findAllWithRelations();
    }
}
