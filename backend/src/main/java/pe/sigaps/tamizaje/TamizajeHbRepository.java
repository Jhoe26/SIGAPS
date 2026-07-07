package pe.sigaps.tamizaje;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TamizajeHbRepository extends JpaRepository<TamizajeHb, Long>, JpaSpecificationExecutor<TamizajeHb> {

    List<TamizajeHb> findByPacienteIdOrderByFechaDesc(Long pacienteId);

    @Query("SELECT t.grupoEtario, COUNT(t) FROM TamizajeHb t GROUP BY t.grupoEtario")
    List<Object[]> contarPorGrupoEtario();

    @Query("SELECT COUNT(t) FROM TamizajeHb t WHERE t.fecha BETWEEN :desde AND :hasta AND t.tipoDosaje = pe.sigaps.tamizaje.TipoDosaje.SIN_DOSAJE")
    long contarPendientesEnRango(LocalDate desde, LocalDate hasta);

    @Query("SELECT COUNT(t) FROM TamizajeHb t WHERE t.fecha BETWEEN :desde AND :hasta AND t.hbCorregido IS NOT NULL AND t.hbCorregido < :corte")
    long contarPositivosEnRango(LocalDate desde, LocalDate hasta, BigDecimal corte);

    @Query("SELECT COUNT(t) FROM TamizajeHb t WHERE t.fecha BETWEEN :desde AND :hasta AND t.hbCorregido IS NOT NULL AND t.hbCorregido >= :corte")
    long contarNegativosEnRango(LocalDate desde, LocalDate hasta, BigDecimal corte);
}
