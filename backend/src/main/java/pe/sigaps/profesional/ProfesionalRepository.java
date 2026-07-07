package pe.sigaps.profesional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProfesionalRepository extends JpaRepository<Profesional, Long>, JpaSpecificationExecutor<Profesional> {

    boolean existsByDni(String dni);

    @Query(value = """
            SELECT COUNT(DISTINCT paciente_id) FROM (
                SELECT paciente_id FROM tamizaje_hb WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM cred_menor5 WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM cred_mayor5 WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM anemia_seguimiento WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM gestante WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM pai_menor12m WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM pai_12m_5a WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM pai_mayor5a WHERE profesional_id = :profesionalId
                UNION SELECT paciente_id FROM pai_7a_15a WHERE profesional_id = :profesionalId
            ) pacientes_atendidos
            """, nativeQuery = true)
    long contarPacientesDistintos(@Param("profesionalId") Long profesionalId);
}
