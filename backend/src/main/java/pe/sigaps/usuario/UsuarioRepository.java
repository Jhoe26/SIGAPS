package pe.sigaps.usuario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByDni(String dni);

    Optional<Usuario> findByEmail(String email);

    boolean existsByDni(String dni);

    Page<Usuario> findByActivo(boolean activo, Pageable pageable);

    long countByActivo(boolean activo);

    long countByRol(Rol rol);
}
