package pe.sigaps.common;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.sigaps.common.dto.StatsDto;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Calcula stats reutilizables por los 9 módulos clínicos a partir de su repositorio,
 * sin duplicar la misma consulta 9 veces. Zero-safe: sobre una tabla vacía, count()
 * y count(Specification) devuelven 0 de forma natural.
 */
public final class StatsUtil {

    private StatsUtil() {
    }

    public static <T, R extends JpaRepository<T, Long> & JpaSpecificationExecutor<T>> StatsDto calcular(R repositorio) {
        long total = repositorio.count();
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        long esteMes = repositorio.count((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), inicioMes));
        return new StatsDto(total, esteMes);
    }

    public static <T, R extends JpaRepository<T, Long> & JpaSpecificationExecutor<T>> long contarEnRango(
            R repositorio, LocalDateTime desde, LocalDateTime hasta) {
        return repositorio.count((root, query, cb) -> cb.and(
                cb.greaterThanOrEqualTo(root.get("createdAt"), desde),
                cb.lessThanOrEqualTo(root.get("createdAt"), hasta)));
    }

    public static <T, R extends JpaRepository<T, Long> & JpaSpecificationExecutor<T>> long contarNoHistoricos(R repositorio) {
        return repositorio.count((root, query, cb) -> cb.isFalse(root.get("esHistorico")));
    }

    public static <T, R extends JpaRepository<T, Long> & JpaSpecificationExecutor<T>> long contarConProfesional(R repositorio) {
        return repositorio.count((root, query, cb) -> cb.isNotNull(root.get("profesionalId")));
    }
}
