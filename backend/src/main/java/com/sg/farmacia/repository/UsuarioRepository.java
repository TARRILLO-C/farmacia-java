package com.sg.farmacia.repository;

import com.sg.farmacia.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.empleado LEFT JOIN FETCH u.rol WHERE u.username = :username")
    Optional<Usuario> findByUsername(@Param("username") String username);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.empleado LEFT JOIN FETCH u.rol WHERE u.email = :email")
    Optional<Usuario> findByEmail(@Param("email") String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByEmpleadoId(Long empleadoId);

    @Query("SELECT u FROM Usuario u LEFT JOIN FETCH u.empleado LEFT JOIN FETCH u.rol ORDER BY u.id ASC")
    List<Usuario> findAllWithRelations();
}
