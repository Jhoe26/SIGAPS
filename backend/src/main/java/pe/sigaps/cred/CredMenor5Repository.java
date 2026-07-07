package pe.sigaps.cred;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CredMenor5Repository extends JpaRepository<CredMenor5, Long>, JpaSpecificationExecutor<CredMenor5> {

    List<CredMenor5> findByPacienteIdOrderByFechaDesc(Long pacienteId);

    @Query("SELECT c.dxNutricional, COUNT(c) FROM CredMenor5 c GROUP BY c.dxNutricional")
    List<Object[]> contarPorDxNutricional();
}
