package pe.sigaps.pai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;

import java.util.List;

@NoRepositoryBean
public interface PaiJpaRepository<T extends PaiRegistro> extends JpaRepository<T, Long>, JpaSpecificationExecutor<T> {

    List<T> findByPacienteIdOrderByFechaAplicacionDesc(Long pacienteId);

    @Query("SELECT p.vacunaId, COUNT(p) FROM #{#entityName} p GROUP BY p.vacunaId")
    List<Object[]> contarPorVacuna();
}
