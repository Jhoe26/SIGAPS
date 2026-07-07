package pe.sigaps.gestante;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface GestanteRepository extends JpaRepository<Gestante, Long>, JpaSpecificationExecutor<Gestante> {

    List<Gestante> findByPacienteIdOrderByCreatedAtDesc(Long pacienteId);

    long countByInfluenzaFechaIsNotNull();

    long countByInfluenzaFechaIsNull();
}
