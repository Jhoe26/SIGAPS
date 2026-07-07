package pe.sigaps.anemia;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AnemiaSeguimientoRepository extends JpaRepository<AnemiaSeguimiento, Long>,
        JpaSpecificationExecutor<AnemiaSeguimiento> {

    List<AnemiaSeguimiento> findByPacienteIdOrderByFechaInicioDesc(Long pacienteId);

    long countByEstado(EstadoAnemia estado);

    @Query("SELECT a.dxInicial, COUNT(a) FROM AnemiaSeguimiento a GROUP BY a.dxInicial")
    List<Object[]> contarPorDxInicial();
}
