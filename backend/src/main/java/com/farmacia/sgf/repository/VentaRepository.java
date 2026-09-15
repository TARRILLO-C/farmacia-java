package com.farmacia.sgf.repository;

import com.farmacia.sgf.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByNumeroVenta(String numeroVenta);

    List<Venta> findByClienteId(Long clienteId);

    List<Venta> findByUsuarioId(Long usuarioId);
}
