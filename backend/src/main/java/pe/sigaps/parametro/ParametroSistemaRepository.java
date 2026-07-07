package pe.sigaps.parametro;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface ParametroSistemaRepository extends JpaRepository<ParametroSistema, String> {

    @Query("SELECT MAX(p.updatedAt) FROM ParametroSistema p")
    LocalDateTime obtenerUltimaActualizacion();
}
