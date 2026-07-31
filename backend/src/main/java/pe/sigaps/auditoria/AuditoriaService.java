package pe.sigaps.auditoria;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import pe.sigaps.auditoria.dto.AuditLogResponseDto;
import pe.sigaps.auditoria.mapper.AuditLogMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditoriaService {

    private final AuditLogRepository auditLogRepository;
    private final AuditLogMapper auditLogMapper;

    public Page<AuditLogResponseDto> buscar(String tabla, Long registroId, Long usuarioId,
                                             LocalDateTime desde, LocalDateTime hasta, Pageable pageable) {
        Specification<AuditLog> spec = construirFiltro(tabla, registroId, usuarioId, desde, hasta);
        return auditLogRepository.findAll(spec, pageable).map(auditLogMapper::toResponseDto);
    }

    @Transactional
    public void registrar(String tabla, Long registroId, AccionAuditoria accion,
                           String valoresAntes, String valoresDespues,
                           Long usuarioId, String ipOrigen, String userAgent) {
        AuditLog log = new AuditLog();
        log.setTabla(tabla);
        log.setRegistroId(registroId);
        log.setAccion(accion);
        log.setValoresAntes(valoresAntes);
        log.setValoresDespues(valoresDespues);
        log.setUsuarioId(usuarioId);
        log.setIpOrigen(ipOrigen);
        log.setUserAgent(userAgent);
        auditLogRepository.save(log);
    }

    /**
     * Auditoría de una consulta de solo lectura (p.ej. GET /acreditados/{dni}). Corre en una
     * transacción propia (REQUIRES_NEW) para que el registro se conserve aunque el método que
     * originó la consulta termine lanzando una excepción y haciendo rollback (p.ej. 404).
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void registrarConsulta(String tabla, Long registroId, String valoresDespues,
                                   Long usuarioId, String ipOrigen, String userAgent) {
        registrar(tabla, registroId, AccionAuditoria.CONSULTA, null, valoresDespues, usuarioId, ipOrigen, userAgent);
    }

    private Specification<AuditLog> construirFiltro(String tabla, Long registroId, Long usuarioId,
                                                      LocalDateTime desde, LocalDateTime hasta) {
        return (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicados = new ArrayList<>();
            if (tabla != null && !tabla.isBlank()) {
                predicados.add(cb.equal(root.get("tabla"), tabla));
            }
            if (registroId != null) {
                predicados.add(cb.equal(root.get("registroId"), registroId));
            }
            if (usuarioId != null) {
                predicados.add(cb.equal(root.get("usuarioId"), usuarioId));
            }
            if (desde != null) {
                predicados.add(cb.greaterThanOrEqualTo(root.get("timestamp"), desde));
            }
            if (hasta != null) {
                predicados.add(cb.lessThanOrEqualTo(root.get("timestamp"), hasta));
            }
            return cb.and(predicados.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }
}
