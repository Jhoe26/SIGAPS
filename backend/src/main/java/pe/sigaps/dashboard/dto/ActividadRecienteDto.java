package pe.sigaps.dashboard.dto;

import java.time.LocalDateTime;

public record ActividadRecienteDto(
        Long usuarioId,
        String usuarioNombre,
        String descripcion,
        LocalDateTime timestamp
) {
}
