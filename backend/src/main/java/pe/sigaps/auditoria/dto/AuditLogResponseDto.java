package pe.sigaps.auditoria.dto;

import pe.sigaps.auditoria.AccionAuditoria;

import java.time.LocalDateTime;

public record AuditLogResponseDto(
        Long id,
        Long usuarioId,
        String tabla,
        Long registroId,
        AccionAuditoria accion,
        String valoresAntes,
        String valoresDespues,
        String ipOrigen,
        String userAgent,
        LocalDateTime timestamp
) {
}
