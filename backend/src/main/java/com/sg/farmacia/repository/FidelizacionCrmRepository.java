package com.sg.farmacia.repository;

import com.sg.farmacia.model.FidelizacionCrm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FidelizacionCrmRepository extends JpaRepository<FidelizacionCrm, Long> {

    Optional<FidelizacionCrm> findByClienteId(Long clienteId);

    Optional<FidelizacionCrm> findByCodigoAfiliado(String codigoAfiliado);

    boolean existsByCodigoAfiliado(String codigoAfiliado);
}
