package pe.sigaps.cred;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CredMayor5Repository extends JpaRepository<CredMayor5, Long>, JpaSpecificationExecutor<CredMayor5> {

    List<CredMayor5> findByPacienteIdOrderByFechaDesc(Long pacienteId);

    @Query("SELECT c.dxNutricional, COUNT(c) FROM CredMayor5 c GROUP BY c.dxNutricional")
    List<Object[]> contarPorDxNutricional();
}
