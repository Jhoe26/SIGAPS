package pe.sigaps.common;

import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Filtro reutilizado por todos los módulos clínicos que exponen
 * GET /{modulo}?pacienteId=&desde=&hasta=
 */
public final class FiltrosClinicos {

    private FiltrosClinicos() {
    }

    public static <T> Specification<T> porPacienteYRangoFecha(Long pacienteId, String campoFecha,
                                                                LocalDate desde, LocalDate hasta) {
        return (root, query, cb) -> {
            List<Predicate> predicados = new ArrayList<>();
            if (pacienteId != null) {
                predicados.add(cb.equal(root.get("pacienteId"), pacienteId));
            }
            if (desde != null) {
                predicados.add(cb.greaterThanOrEqualTo(root.get(campoFecha), desde));
            }
            if (hasta != null) {
                predicados.add(cb.lessThanOrEqualTo(root.get(campoFecha), hasta));
            }
            return cb.and(predicados.toArray(new Predicate[0]));
        };
    }
}
